/**
 * Contact Form API Route
 *
 * Handles contact form submissions with:
 * - Rate limiting (5 requests/minute per IP)
 * - Zod validation
 * - Honeypot bot detection
 * - Firestore persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Contact form validation schema
 */
const contactSchema = z.object({
    name: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες').max(100),
    email: z.string().email('Μη έγκυρο email'),
    phone: z.string().optional(),
    company: z.string().optional(),
    subject: z.string().max(200).optional(),
    message: z.string().min(10, 'Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες').max(5000),
    honeypot: z.string().max(0).optional(), // Bot detection
});

const CONTACTS_COLLECTION = 'contactSubmissions';

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

        const db = getAdminFirestore();
        if (!db) {
            console.error('Firebase Admin not configured - contact submission failed');
            return NextResponse.json(
                { error: 'Αποτυχία αποθήκευσης. Παρακαλώ δοκιμάστε ξανά.' },
                { status: 503 }
            );
        }

        // Save to Firestore with admin privileges
        const submission = {
            name,
            email,
            message,
            submittedAt: Timestamp.now(),
            status: 'new',
            ...(phone ? { phone } : {}),
            ...(company ? { company } : {}),
            ...(subject ? { subject } : {}),
            ...(clientIP !== 'anonymous' ? { ipAddress: clientIP } : {}),
        };

        const docRef = await db.collection(CONTACTS_COLLECTION).add(submission);
        const submissionId = docRef.id;

        if (!submissionId) {
            // Firestore save failed - log for debugging but don't expose to user
            console.error('Failed to save contact submission to Firestore');
            return NextResponse.json(
                { error: 'Αποτυχία αποθήκευσης. Παρακαλώ δοκιμάστε ξανά.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Το μήνυμά σας στάλθηκε επιτυχώς.',
            },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
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
    return NextResponse.json({
        status: 'ok',
        message: 'Contact API is running',
    });
}
