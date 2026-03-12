import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    extractBearerToken,
    getAdminFirestore,
    isUserAdmin,
    verifyIdToken,
} from '@/lib/firebase-admin';
import type { ChatEscalationStatus, ChatWaitingOn } from '@/lib/chat/types';

const paramsSchema = z.object({
    sessionId: z.string().uuid(),
});

const bodySchema = z.object({
    status: z.enum(['pending', 'in_progress', 'resolved']),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminChatStatus:${clientIP}`, RATE_LIMITS.adminActions);

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

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
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

        const body = await request.json();
        const validatedBody = bodySchema.safeParse(body);
        if (!validatedBody.success) {
            return NextResponse.json(
                { error: validatedBody.error.issues[0]?.message ?? 'Invalid status' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const { sessionId } = validatedParams.data;
        const { status } = validatedBody.data;
        const sessionRef = db.collection('chatSessions').doc(sessionId);
        const escalationRef = db.collection('escalatedChats').doc(sessionId);
        const now = Timestamp.now();

        await db.runTransaction(async (tx) => {
            const [sessionSnapshot, escalationSnapshot] = await Promise.all([
                tx.get(sessionRef),
                tx.get(escalationRef),
            ]);

            if (!sessionSnapshot.exists) {
                throw new Error('session_not_found');
            }

            if (!escalationSnapshot.exists) {
                throw new Error('escalation_not_found');
            }

            const currentWaitingOn =
                (sessionSnapshot.data()?.waitingOn as ChatWaitingOn | undefined) ?? 'none';
            const nextWaitingOn: ChatWaitingOn =
                status === 'resolved'
                    ? 'none'
                    : currentWaitingOn === 'customer'
                        ? 'customer'
                        : 'admin';

            tx.set(
                escalationRef,
                {
                    status,
                    ...(status === 'resolved'
                        ? {
                              resolvedAt: now,
                              resolvedBy: decodedToken.email ?? decodedToken.uid,
                          }
                        : {
                              resolvedAt: FieldValue.delete(),
                              resolvedBy: FieldValue.delete(),
                          }),
                },
                { merge: true }
            );

            tx.set(
                sessionRef,
                {
                    sessionId,
                    escalationStatus: status,
                    isEscalated: true,
                    waitingOn: nextWaitingOn,
                    adminUnreadCount: status === 'resolved' ? 0 : currentWaitingOn === 'admin' ? 1 : 0,
                    assignedAdminEmail: decodedToken.email ?? decodedToken.uid,
                    ...(status === 'resolved'
                        ? {
                              resolvedAt: now,
                              resolvedBy: decodedToken.email ?? decodedToken.uid,
                          }
                        : {
                              resolvedAt: FieldValue.delete(),
                              resolvedBy: FieldValue.delete(),
                          }),
                },
                { merge: true }
            );
        });

        return NextResponse.json(
            { success: true, status: status as ChatEscalationStatus },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'Cache-Control': 'no-store',
                },
            }
        );
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'session_not_found') {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }
            if (error.message === 'escalation_not_found') {
                return NextResponse.json({ error: 'Escalation not found' }, { status: 404 });
            }
        }

        console.error('Admin chat status API error:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}
