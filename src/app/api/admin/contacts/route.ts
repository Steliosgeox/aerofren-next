/**
 * Admin Contacts API Route
 * GET /api/admin/contacts — paginated contact form submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';

const CONTACTS_COLLECTION = 'contactSubmissions';
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminContacts:${clientIP}`, RATE_LIMITS.adminData);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                }
            );
        }

        const authHeader = request.headers.get('authorization');
        const token = extractBearerToken(authHeader);
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const isAdmin = await isUserAdmin(decodedToken);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
        const pageLimit = Math.min(isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit, MAX_LIMIT);

        let query = db
            .collection(CONTACTS_COLLECTION)
            .orderBy('submittedAt', 'desc')
            .limit(pageLimit + 1);

        if (cursor) {
            const cursorDoc = await db.collection(CONTACTS_COLLECTION).doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        const snapshot = await query.get();
        const docs = snapshot.docs;
        const hasMore = docs.length > pageLimit;
        const items = (hasMore ? docs.slice(0, pageLimit) : docs).map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                requestId: data.requestId ?? doc.id,
                name: data.name ?? 'Άγνωστος',
                email: data.email ?? '',
                message: data.message ?? '',
                phone: data.phone ?? undefined,
                company: data.company ?? undefined,
                subject: data.subject ?? undefined,
                submittedAt: data.submittedAt?.toDate?.()?.toISOString() ?? new Date(0).toISOString(),
                status: data.status ?? 'new',
                source: data.source ?? 'website-contact-form',
            };
        });

        const nextCursor = hasMore ? docs[pageLimit - 1].id : null;

        return NextResponse.json(
            { contacts: items, nextCursor },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('Admin contacts API error:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}
