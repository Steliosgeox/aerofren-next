/**
 * Contact Form API Route
 *
 * Handles contact form submissions with:
 * - Rate limiting (5 requests/minute per IP)
 * - Zod validation
 * - Honeypot bot detection
 * - Multi-channel delivery (Firestore + SMTP email)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
    getContactEmailConfig,
    sendContactEmail,
    type ContactSubmissionPayload,
} from '@/lib/contact-delivery';

/**
 * Contact form validation schema
 */
const contactSchema = z.object({
    name: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες').max(100),
    email: z.string().email('Μη έγκυρο email'),
    phone: z.string()
        .regex(/^[\d\s\-+().]{6,20}$/, 'Μη έγκυρος αριθμός τηλεφώνου')
        .optional()
        .or(z.literal('')),
    company: z.string().optional(),
    subject: z.string().max(200).optional(),
    message: z.string().min(10, 'Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες').max(5000),
    honeypot: z.string().optional(), // Bot detection: Must allow strings to catch bots silently
});

const CONTACTS_COLLECTION = 'contactSubmissions';
const createRequestId = () => crypto.randomUUID();

/**
 * POST /api/contact
 * Submit a contact form
 */
export async function POST(request: NextRequest) {
    try {
        // Server-side rate limiting
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`contact:${clientIP}`, RATE_LIMITS.contact);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Πολλές προσπάθειες. Δοκιμάστε ξανά αργότερα.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                }
            );
        }

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Unsupported content type' },
                { status: 415 }
            );
        }

        const body = await request.json();

        // Validate with Zod
        const validation = contactSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Validation failed' },
                { status: 400 }
            );
        }

        // Bot detection - if honeypot field is filled, silently succeed
        if (validation.data.honeypot) {
            return NextResponse.json({ success: true });
        }

        const { name, email, phone, company, subject, message } = validation.data;
        const requestId = createRequestId();
        const submittedAt = Timestamp.now();
        const submittedAtISO = submittedAt.toDate().toISOString();
        const ipAddress = clientIP !== 'anonymous' ? clientIP : undefined;

        const db = getAdminFirestore();
        const emailConfig = getContactEmailConfig();

        const firestoreEnabled = Boolean(db);
        const emailEnabled = emailConfig.configured;

        if (!firestoreEnabled && !emailEnabled) {
            console.error('[contact-api] No delivery channel configured', {
                requestId,
                missingEmailVars: emailConfig.missing,
            });
            return NextResponse.json(
                { error: 'Η υπηρεσία επικοινωνίας δεν είναι διαθέσιμη προσωρινά.' },
                { status: 503 }
            );
        }

        const payload: ContactSubmissionPayload = {
            requestId,
            name,
            email,
            message,
            ...(phone ? { phone } : {}),
            ...(company ? { company } : {}),
            ...(subject ? { subject } : {}),
            ...(ipAddress ? { ipAddress } : {}),
            submittedAtISO,
        };

        let firestoreSuccess = false;
        let firestoreId: string | null = null;
        let firestoreError: string | null = null;

        if (db) {
            try {
                const submission = {
                    requestId,
                    name,
                    email,
                    message,
                    submittedAt,
                    status: 'new',
                    source: 'website-contact-form',
                    ...(phone ? { phone } : {}),
                    ...(company ? { company } : {}),
                    ...(subject ? { subject } : {}),
                    ...(ipAddress ? { ipAddress } : {}),
                };

                const docRef = await db.collection(CONTACTS_COLLECTION).add(submission);
                firestoreId = docRef.id;
                firestoreSuccess = Boolean(firestoreId);
            } catch (firestoreWriteError) {
                firestoreError =
                    firestoreWriteError instanceof Error
                        ? firestoreWriteError.message
                        : 'Firestore write failed';
                console.error('[contact-api] Firestore write failed', {
                    requestId,
                    error: firestoreError,
                });
            }
        }

        const emailResult = await sendContactEmail(payload);
        const emailSuccess = emailResult.success;
        const hasSuccessfulChannel = firestoreSuccess || emailSuccess;

        if (!hasSuccessfulChannel) {
            console.error('[contact-api] Submission failed for all channels', {
                requestId,
                firestoreError,
                emailError: emailResult.error,
            });
            return NextResponse.json(
                { error: 'Αποτυχία αποστολής. Παρακαλώ δοκιμάστε ξανά.' },
                { status: 503 }
            );
        }

        if (!emailSuccess) {
            console.warn('[contact-api] Submission accepted without email delivery', {
                requestId,
                firestoreSuccess,
                emailError: emailResult.error,
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Το μήνυμά σας στάλθηκε επιτυχώς.',
                requestId,
                delivery: {
                    firestore: firestoreSuccess,
                    email: emailSuccess,
                },
            },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'X-Contact-Request-Id': requestId,
                },
            }
        );
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/contact
 * Health check endpoint
 */
export async function GET() {
    const emailConfig = getContactEmailConfig();
    const firestoreConfigured = Boolean(getAdminFirestore());

    return NextResponse.json({
        status: 'ok',
        message: 'Contact API is running',
        channels: {
            firestore: firestoreConfigured ? 'configured' : 'missing',
            email: emailConfig.configured ? 'configured' : 'missing',
        },
    });
}
