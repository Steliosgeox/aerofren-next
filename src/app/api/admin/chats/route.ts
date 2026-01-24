/**
 * Admin Chat Sessions API Route
 * GET /api/admin/chats
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { Timestamp } from 'firebase-admin/firestore';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';

type EscalationStatus = 'pending' | 'in_progress' | 'resolved';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminChats:${clientIP}`, RATE_LIMITS.adminData);

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
        const limitParam = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
        const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT);
        const cursor = searchParams.get('cursor');

        let query = db
            .collection('chatSessions')
            .orderBy('lastMessageAt', 'desc')
            .orderBy('sessionId', 'asc')
            .limit(limit + 1);

        if (cursor) {
            const [tsPart, ...idParts] = cursor.split('_');
            const sessionId = idParts.join('_');
            const tsMillis = Number(tsPart);
            if (sessionId && Number.isFinite(tsMillis)) {
                query = query.startAfter(Timestamp.fromMillis(tsMillis), sessionId);
            }
        }

        const sessionsSnapshot = await query.get();
        const docs = sessionsSnapshot.docs;
        const hasMore = docs.length > limit;
        const pageDocs = hasMore ? docs.slice(0, limit) : docs;

        const sessions = pageDocs.map((doc) => {
            const data = doc.data();
            const lastMessageAt = data.lastMessageAt?.toDate?.() || new Date(0);
            return {
                sessionId: (data.sessionId as string | undefined) ?? doc.id,
                userId: data.userId as string | undefined,
                userEmail: data.userEmail as string | undefined,
                userName: data.userName as string | undefined,
                messageCount: data.messageCount ?? 0,
                lastMessage: lastMessageAt.toISOString(),
                isEscalated: Boolean(data.escalationStatus),
                escalationStatus: data.escalationStatus as EscalationStatus | undefined,
            };
        });

        const lastDoc = pageDocs[pageDocs.length - 1];
        const nextCursor = hasMore && lastDoc
            ? `${(lastDoc.data().lastMessageAt?.toMillis?.() ?? Date.now())}_${(lastDoc.data().sessionId as string | undefined) ?? lastDoc.id}`
            : null;

        return NextResponse.json({ sessions, nextCursor }, {
            headers: {
                'X-RateLimit-Remaining': String(rateLimit.remaining),
            },
        });
    } catch (error) {
        console.error('Admin chats API error:', error);
        return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
    }
}
