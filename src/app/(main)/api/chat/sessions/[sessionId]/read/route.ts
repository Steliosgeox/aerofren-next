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
        const rateLimit = checkRateLimit(`chatSessionRead:${clientIP}`, RATE_LIMITS.chatHistory);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.' },
                { status: 429 }
            );
        }

        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const token = extractBearerToken(authHeader);
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
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
        const sessionRef = db.collection('chatSessions').doc(sessionId);
        const sessionSnapshot = await sessionRef.get();
        if (!sessionSnapshot.exists) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const isAdmin = await isUserAdmin(decodedToken);
        const sessionUserId = sessionSnapshot.data()?.userId as string | undefined;
        if (!isAdmin && (!sessionUserId || sessionUserId !== decodedToken.uid)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await sessionRef.set(
            {
                sessionId,
                customerUnreadCount: 0,
            },
            { merge: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Chat session read API error:', error);
        return NextResponse.json({ error: 'Failed to update read state' }, { status: 500 });
    }
}
