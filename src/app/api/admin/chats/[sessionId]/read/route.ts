import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    extractBearerToken,
    getAdminFirestore,
    isUserAdmin,
    verifyIdToken,
} from '@/lib/firebase-admin';

const paramsSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminChatRead:${clientIP}`, RATE_LIMITS.adminActions);

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

        if (!(await isUserAdmin(decodedToken))) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const validatedParams = paramsSchema.safeParse(await params);
        if (!validatedParams.success) {
            return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const { sessionId } = validatedParams.data;
        await db.collection('chatSessions').doc(sessionId).set(
            {
                sessionId,
                adminUnreadCount: 0,
            },
            { merge: true }
        );

        return NextResponse.json(
            { success: true },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'Cache-Control': 'no-store',
                },
            }
        );
    } catch (error) {
        console.error('Admin chat read API error:', error);
        return NextResponse.json({ error: 'Failed to update read state' }, { status: 500 });
    }
}
