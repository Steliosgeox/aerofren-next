/**
 * Chat History API Route
 * GET /api/chat/history?sessionId=xxx - Get chat history for a session
 *
 * Security:
 * - Rate limited per IP
 * - Requires Firebase authentication
 * - Validates session ownership (user can only access their own sessions)
 * - Admins can access any session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChatHistory } from '@/lib/firebase';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    verifyIdToken,
    extractBearerToken,
    isUserAdmin,
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

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Validate sessionId format (UUID v4)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(sessionId)) {
            return NextResponse.json(
                { error: 'Invalid session ID format' },
                { status: 400 }
            );
        }

        // Get chat history
        const history = await getChatHistory(sessionId);

        // If no messages found, return empty (don't reveal if session exists)
        if (history.length === 0) {
            return NextResponse.json({
                sessionId,
                messages: [],
                count: 0,
            });
        }

        // Check if session has a userId (authenticated session)
        const sessionUserId = history.find(msg => msg.userId)?.userId;

        if (sessionUserId) {
            // Session belongs to an authenticated user - require auth
            const authHeader = request.headers.get('Authorization');
            const token = extractBearerToken(authHeader);

            if (!token) {
                return NextResponse.json(
                    { error: 'Authentication required for this session' },
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

            // Check ownership: user must own the session or be an admin
            const isAdmin = await isUserAdmin(decodedToken);
            if (decodedToken.uid !== sessionUserId && !isAdmin) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
        }
        // If session has no userId, it's an anonymous session
        // The sessionId acts as a bearer token (stored in client localStorage)

        // Transform to simpler format for frontend
        const messages = history.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));

        return NextResponse.json(
            {
                sessionId,
                messages,
                count: messages.length,
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
