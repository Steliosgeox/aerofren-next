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
import { buildMessagePreview, isOpenEscalationStatus } from '@/lib/chat/session-metadata';
import type { ChatEscalationStatus } from '@/lib/chat/types';

const paramsSchema = z.object({
    sessionId: z.string().uuid(),
});

const bodySchema = z.object({
    content: z.string().trim().min(1).max(5000),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminChatReply:${clientIP}`, RATE_LIMITS.adminActions);

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
                { error: validatedBody.error.issues[0]?.message ?? 'Invalid content' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const { sessionId } = validatedParams.data;
        const { content } = validatedBody.data;
        const sessionRef = db.collection('chatSessions').doc(sessionId);
        const escalationRef = db.collection('escalatedChats').doc(sessionId);
        const messageRef = db.collection('chatMessages').doc();
        const sentAt = Timestamp.now();
        const expiresAtDate = new Date();
        expiresAtDate.setMonth(expiresAtDate.getMonth() + 3);
        const expiresAt = Timestamp.fromDate(expiresAtDate);
        const senderLabel = decodedToken.name ?? decodedToken.email ?? 'Ομάδα AEROFREN';

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

            const sessionData = sessionSnapshot.data() ?? {};
            const status = sessionData.escalationStatus as ChatEscalationStatus | undefined;
            if (!isOpenEscalationStatus(status)) {
                throw new Error('session_not_open');
            }

            if (!sessionData.userId) {
                throw new Error('anonymous_session');
            }

            tx.set(messageRef, {
                sessionId,
                role: 'admin',
                content,
                timestamp: sentAt,
                expiresAt,
                userId: sessionData.userId,
                senderLabel,
            });

            tx.set(
                sessionRef,
                {
                    sessionId,
                    escalationStatus: status === 'pending' ? 'in_progress' : status,
                    isEscalated: true,
                    lastMessageAt: sentAt,
                    lastMessagePreview: buildMessagePreview(content),
                    lastMessageRole: 'admin',
                    messageCount: FieldValue.increment(1),
                    waitingOn: 'customer',
                    adminUnreadCount: 0,
                    customerUnreadCount: FieldValue.increment(1),
                    assignedAdminEmail: decodedToken.email ?? decodedToken.uid,
                },
                { merge: true }
            );

            tx.set(
                escalationRef,
                {
                    status: status === 'pending' ? 'in_progress' : status,
                    resolvedAt: FieldValue.delete(),
                    resolvedBy: FieldValue.delete(),
                },
                { merge: true }
            );
        });

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
        if (error instanceof Error) {
            if (error.message === 'session_not_found') {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }
            if (error.message === 'escalation_not_found') {
                return NextResponse.json({ error: 'Escalation not found' }, { status: 404 });
            }
            if (error.message === 'session_not_open') {
                return NextResponse.json(
                    { error: 'Resolved chats must be reopened before replying.' },
                    { status: 409 }
                );
            }
            if (error.message === 'anonymous_session') {
                return NextResponse.json(
                    { error: 'Anonymous sessions do not support in-app replies.' },
                    { status: 409 }
                );
            }
        }

        console.error('Admin chat reply API error:', error);
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
    }
}
