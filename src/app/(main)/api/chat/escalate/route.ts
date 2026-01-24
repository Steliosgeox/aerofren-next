/**
 * Chat Escalation API Route
 * POST /api/chat/escalate
 *
 * Security:
 * - Rate limited per IP
 * - Requires Firebase auth
 * - Validates session ownership
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const escalationSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`chatEscalate:${clientIP}`, RATE_LIMITS.chatEscalation);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Πολλές προσπάθειες. Δοκιμάστε ξανά σε λίγο.' },
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

        const authHeader = request.headers.get('authorization');
        const token = extractBearerToken(authHeader);
        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const decodedToken = await verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const body = await request.json();
        const validation = escalationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Validation failed' },
                { status: 400 }
            );
        }

        const { sessionId } = validation.data;
        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        // Fetch session messages to validate ownership and find latest message
        const messagesSnapshot = await db
            .collection('chatMessages')
            .where('sessionId', '==', sessionId)
            .select('userId', 'timestamp')
            .get();

        if (messagesSnapshot.empty) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        let sessionUserId: string | undefined;
        let latestDocId: string | null = null;
        let latestTimestamp: Date | null = null;

        messagesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!sessionUserId && data.userId) {
                sessionUserId = data.userId as string;
            }
            const ts = data.timestamp?.toDate?.();
            if (ts && (!latestTimestamp || ts > latestTimestamp)) {
                latestTimestamp = ts;
                latestDocId = doc.id;
            }
        });

        if (sessionUserId && sessionUserId !== decodedToken.uid) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const escalationRef = db.collection('escalatedChats').doc(sessionId);
        const existingEscalation = await escalationRef.get();

        let status: 'pending' | 'in_progress' | 'resolved' = 'pending';
        let alreadyEscalated = false;

        if (existingEscalation.exists) {
            status = (existingEscalation.data()?.status as typeof status) || 'pending';
            alreadyEscalated = true;
        } else {
            const escalation = {
                sessionId,
                userId: decodedToken.uid,
                userEmail: decodedToken.email ?? 'Unknown',
                userName: decodedToken.name ?? decodedToken.email ?? 'Unknown User',
                escalatedAt: Timestamp.now(),
                status: 'pending' as const,
            };
            await escalationRef.set(escalation);
        }

        const escalatedAt =
            existingEscalation.exists && existingEscalation.data()?.escalatedAt
                ? (existingEscalation.data()?.escalatedAt as Timestamp)
                : Timestamp.now();

        await db.collection('chatSessions').doc(sessionId).set(
            {
                sessionId,
                escalationStatus: status,
                isEscalated: true,
                escalatedAt,
            },
            { merge: true }
        );

        // Mark the latest message as escalated for visibility (best-effort)
        if (latestDocId) {
            await db.collection('chatMessages').doc(latestDocId).update({
                isEscalated: true,
                escalatedAt: Timestamp.now(),
            });
        }

        return NextResponse.json(
            { success: true, status, alreadyEscalated },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                },
            }
        );
    } catch (error) {
        console.error('Chat escalation API error:', error);
        return NextResponse.json({ error: 'Failed to escalate chat' }, { status: 500 });
    }
}
