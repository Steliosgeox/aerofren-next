/**
 * Chat History API Route
 * GET /api/chat/history?sessionId=xxx - Get chat history for a session
 *
 * Security:
 * - Rate limited per IP
 * - Requires Firebase authentication for all requests
 * - Validates session ownership (user can only access their own sessions)
 * - Admins can access any session (including anonymous sessions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    verifyIdToken,
    extractBearerToken,
    isUserAdmin,
    getAdminFirestore,
} from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
    try {
        // Server-side rate limiting
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`chatHistory:${clientIP}`, RATE_LIMITS.chatHistory);

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

        // Extract and validate sessionId
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const limitParam = Number(searchParams.get('limit')) || 50;
        const limit = Math.min(Math.max(limitParam, 1), 200);
        const cursor = searchParams.get('cursor');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const sessionIdValidation = z.string().uuid().safeParse(sessionId);
        if (!sessionIdValidation.success) {
            return NextResponse.json(
                { error: 'Invalid session ID format' },
                { status: 400 }
            );
        }

        // Require authentication for all history requests
        const authHeader = request.headers.get('Authorization');
        const token = extractBearerToken(authHeader);

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decodedToken = await verifyIdToken(token);
        if (!decodedToken) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 503 }
            );
        }

        const sessionDoc = await db.collection('chatSessions').doc(sessionId).get();
        const sessionUserId = sessionDoc.exists ? (sessionDoc.data()?.userId as string | undefined) : undefined;

        const isAdmin = await isUserAdmin(decodedToken);
        if (sessionUserId) {
            // Session belongs to an authenticated user - require owner or admin
            if (decodedToken.uid !== sessionUserId && !isAdmin) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
        } else if (!isAdmin) {
            // Anonymous sessions are restricted to admins only
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Query latest messages first for pagination
        let query = db
            .collection('chatMessages')
            .where('sessionId', '==', sessionId)
            .orderBy('timestamp', 'desc')
            .orderBy('__name__', 'desc')
            .limit(limit + 1);

        if (cursor) {
            const [tsPart, ...idParts] = cursor.split('_');
            const docId = idParts.join('_');
            const tsMillis = Number(tsPart);
            if (docId && Number.isFinite(tsMillis)) {
                query = query.startAfter(Timestamp.fromMillis(tsMillis), docId);
            }
        }

        const historySnapshot = await query.get();
        const docs = historySnapshot.docs;
        const hasMore = docs.length > limit;
        const pageDocs = hasMore ? docs.slice(0, limit) : docs;

        // If no messages found, return empty (don't reveal if session exists)
        if (pageDocs.length === 0) {
            return NextResponse.json({
                sessionId,
                messages: [],
                count: 0,
                nextCursor: null,
            });
        }

        // Transform to simpler format for frontend
        const messages = pageDocs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
                userEmail: data.userEmail,
                userName: data.userName,
            };
        }).reverse();

        const lastDoc = pageDocs[pageDocs.length - 1];
        const nextCursor = hasMore && lastDoc
            ? `${(lastDoc.data().timestamp?.toMillis?.() ?? Date.now())}_${lastDoc.id}`
            : null;

        return NextResponse.json(
            {
                sessionId,
                messages,
                count: messages.length,
                nextCursor,
            },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                },
            }
        );
    } catch (error) {
        console.error('Chat history API error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch chat history' },
            { status: 500 }
        );
    }
}
