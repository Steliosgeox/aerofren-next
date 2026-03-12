/**
 * Admin Chat Sessions API Route
 * GET /api/admin/chats
 */

import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    extractBearerToken,
    getAdminFirestore,
    isUserAdmin,
    verifyIdToken,
} from '@/lib/firebase-admin';
import { isOpenEscalationStatus, normalizeChatSearchValue } from '@/lib/chat/session-metadata';
import type {
    AdminChatStatusFilter,
    ChatEscalationStatus,
    ChatMessageRole,
    ChatWaitingOn,
} from '@/lib/chat/types';

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;
const SEARCH_LIMIT = 100;
const BASE_CHUNK_LIMIT = 100;
const SESSION_ID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SessionPayload = {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userPhotoURL?: string;
    messageCount: number;
    lastMessage: string;
    lastMessagePreview?: string;
    lastMessageRole?: ChatMessageRole;
    adminUnreadCount: number;
    customerUnreadCount: number;
    waitingOn?: ChatWaitingOn;
    assignedAdminEmail?: string;
    userEmailNormalized?: string;
    userNameNormalized?: string;
    userEmailLocalPartNormalized?: string;
    isEscalated: boolean;
    escalationStatus?: ChatEscalationStatus;
};

function coerceStatusFilter(value: string | null): AdminChatStatusFilter {
    if (
        value === 'pending' ||
        value === 'in_progress' ||
        value === 'resolved' ||
        value === 'open'
    ) {
        return value;
    }
    return 'all';
}

function mapSession(doc: FirebaseFirestore.QueryDocumentSnapshot): SessionPayload {
    const data = doc.data();
    const lastMessageAt = data.lastMessageAt?.toDate?.() ?? new Date(0);
    const escalationStatus = data.escalationStatus as ChatEscalationStatus | undefined;

    return {
        sessionId: (data.sessionId as string | undefined) ?? doc.id,
        userId: data.userId as string | undefined,
        userEmail: data.userEmail as string | undefined,
        userName: data.userName as string | undefined,
        userPhotoURL: data.userPhotoURL as string | undefined,
        messageCount: (data.messageCount as number | undefined) ?? 0,
        lastMessage: lastMessageAt.toISOString(),
        lastMessagePreview: data.lastMessagePreview as string | undefined,
        lastMessageRole: data.lastMessageRole as ChatMessageRole | undefined,
        adminUnreadCount: (data.adminUnreadCount as number | undefined) ?? 0,
        customerUnreadCount: (data.customerUnreadCount as number | undefined) ?? 0,
        waitingOn: (data.waitingOn as ChatWaitingOn | undefined) ?? 'none',
        assignedAdminEmail: data.assignedAdminEmail as string | undefined,
        userEmailNormalized: data.userEmailNormalized as string | undefined,
        userNameNormalized: data.userNameNormalized as string | undefined,
        userEmailLocalPartNormalized: data.userEmailLocalPartNormalized as string | undefined,
        isEscalated: Boolean(data.isEscalated) || Boolean(escalationStatus),
        escalationStatus,
    };
}

function matchesStatus(session: SessionPayload, status: AdminChatStatusFilter): boolean {
    if (status === 'all') {
        return true;
    }

    if (status === 'open') {
        return isOpenEscalationStatus(session.escalationStatus);
    }

    return session.escalationStatus === status;
}

function matchesNeedsReply(session: SessionPayload, needsReply: boolean): boolean {
    if (!needsReply) {
        return true;
    }

    return session.waitingOn === 'admin' && isOpenEscalationStatus(session.escalationStatus);
}

function sortByLastMessage(left: SessionPayload, right: SessionPayload): number {
    return new Date(right.lastMessage).getTime() - new Date(left.lastMessage).getTime();
}

async function queryByPrefix(
    db: FirebaseFirestore.Firestore,
    field: string,
    prefix: string,
    limit: number
) {
    const snapshot = await db
        .collection('chatSessions')
        .orderBy(field)
        .startAt(prefix)
        .endAt(`${prefix}\uf8ff`)
        .limit(limit)
        .get();

    return snapshot.docs;
}

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
        const search = normalizeChatSearchValue(searchParams.get('search'));
        const status = coerceStatusFilter(searchParams.get('status'));
        const needsReply = searchParams.get('needsReply') === 'true';

        if (search) {
            let docs: FirebaseFirestore.QueryDocumentSnapshot[] = [];

            if (SESSION_ID_PATTERN.test(search)) {
                const doc = await db.collection('chatSessions').doc(search).get();
                if (doc.exists) {
                    docs = [doc as FirebaseFirestore.QueryDocumentSnapshot];
                }
            } else if (search.includes('@')) {
                docs = await queryByPrefix(db, 'userEmailNormalized', search, SEARCH_LIMIT);
            } else {
                const [nameDocs, emailDocs] = await Promise.all([
                    queryByPrefix(db, 'userNameNormalized', search, SEARCH_LIMIT),
                    queryByPrefix(db, 'userEmailLocalPartNormalized', search, SEARCH_LIMIT),
                ]);

                const merged = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
                for (const doc of [...nameDocs, ...emailDocs]) {
                    merged.set(doc.id, doc);
                }
                docs = [...merged.values()];
            }

            const sessions = docs
                .map(mapSession)
                .filter((session) => matchesStatus(session, status) && matchesNeedsReply(session, needsReply))
                .sort(sortByLastMessage)
                .slice(0, limit);

            return NextResponse.json(
                { sessions, nextCursor: null },
                {
                    headers: {
                        'X-RateLimit-Remaining': String(rateLimit.remaining),
                        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                    },
                }
            );
        }

        const collected: SessionPayload[] = [];
        let hasMore = false;
        let exhausted = false;
        let pageCursor: Timestamp | null = null;

        if (cursor) {
            const millis = Number(cursor);
            if (Number.isFinite(millis)) {
                pageCursor = Timestamp.fromMillis(millis);
            }
        }

        while (collected.length < limit + 1 && !exhausted) {
            let query = db
                .collection('chatSessions')
                .orderBy('lastMessageAt', 'desc')
                .limit(BASE_CHUNK_LIMIT);

            if (pageCursor) {
                query = query.startAfter(pageCursor);
            }

            const snapshot = await query.get();
            if (snapshot.empty) {
                exhausted = true;
                break;
            }

            const docs = snapshot.docs;
            const mapped = docs
                .map(mapSession)
                .filter((session) => matchesStatus(session, status) && matchesNeedsReply(session, needsReply));

            collected.push(...mapped);

            const lastDoc = docs[docs.length - 1];
            pageCursor = lastDoc.data().lastMessageAt as Timestamp | null;
            exhausted = docs.length < BASE_CHUNK_LIMIT;
        }

        hasMore = collected.length > limit;
        const sessions = collected.slice(0, limit);
        const nextCursor = hasMore && sessions.length > 0
            ? String(new Date(sessions[sessions.length - 1].lastMessage).getTime())
            : null;

        return NextResponse.json(
            { sessions, nextCursor },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('Admin chats API error:', error);
        return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
    }
}
