/**
 * Admin Stats API Route
 * GET /api/admin/stats
 *
 * Security:
 * - Requires admin auth
 * - Rate limited per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';

const STATS_CACHE_TTL_MS = 30_000;
let cachedStats: { data: { totalChats: number; escalatedChats: number; pendingEscalations: number; uniqueUsers: number; todayChats: number }; expiresAt: number } | null = null;

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminStats:${clientIP}`, RATE_LIMITS.adminStats);

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

        if (cachedStats && cachedStats.expiresAt > Date.now()) {
            return NextResponse.json(cachedStats.data, {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'X-Cache': 'HIT',
                },
            });
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const chatsRef = db.collection('chatMessages');
        const sessionsRef = db.collection('chatSessions');
        const escalationsRef = db.collection('escalatedChats');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalSessionsSnap, escalatedCountSnap, pendingCountSnap, todayCountSnap] = await Promise.all([
            sessionsRef.count().get(),
            escalationsRef.count().get(),
            escalationsRef.where('status', '==', 'pending').count().get(),
            chatsRef.where('timestamp', '>=', Timestamp.fromDate(today)).count().get(),
        ]);

        let totalChats = totalSessionsSnap.data().count || 0;
        let uniqueUsers = 0;

        if (totalChats === 0) {
            const fallbackSnapshot = await chatsRef.select('sessionId', 'userId').get();
            const sessionIds = new Set<string>();
            const userIds = new Set<string>();

            fallbackSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.sessionId) {
                    sessionIds.add(data.sessionId as string);
                }
                if (data.userId) {
                    userIds.add(data.userId as string);
                }
            });

            totalChats = sessionIds.size;
            uniqueUsers = userIds.size;
        } else {
            const sessionsSnapshot = await sessionsRef.select('userId').get();
            const userIds = new Set<string>();

            sessionsSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.userId) {
                    userIds.add(data.userId as string);
                }
            });

            uniqueUsers = userIds.size;
        }

        const data = {
            totalChats,
            escalatedChats: escalatedCountSnap.data().count || 0,
            pendingEscalations: pendingCountSnap.data().count || 0,
            uniqueUsers,
            todayChats: todayCountSnap.data().count || 0,
        };

        cachedStats = {
            data,
            expiresAt: Date.now() + STATS_CACHE_TTL_MS,
        };

        return NextResponse.json(data, {
            headers: {
                'X-RateLimit-Remaining': String(rateLimit.remaining),
                'X-Cache': 'MISS',
            },
        });
    } catch (error) {
        console.error('Admin stats API error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
