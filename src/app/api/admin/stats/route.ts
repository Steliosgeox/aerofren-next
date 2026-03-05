/**
 * Admin Stats API Route
 * GET /api/admin/stats
 *
 * Security:
 * - Requires admin auth
 * - Rate limited per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';
import { selectUniqueUsersMetric } from '@/lib/admin/stats-utils';

export async function GET(request: NextRequest) {
    const traceId = randomUUID();
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

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const sessionsRef = db.collection('chatSessions');
        const escalationsRef = db.collection('escalatedChats');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalSessionsSnap, escalatedCountSnap, pendingCountSnap, todayCountSnap] = await Promise.all([
            sessionsRef.count().get(),
            escalationsRef.count().get(),
            escalationsRef.where('status', '==', 'pending').count().get(),
            sessionsRef.where('lastMessageAt', '>=', Timestamp.fromDate(today)).count().get(),
        ]);

        const totalChats = totalSessionsSnap.data().count || 0;

        // Resolve unique users from server-maintained sys_stats first; fallback to chatUsers count.
        // If both are empty, expose "uninitialized" to avoid silently misleading zeros.
        const sysStatsDoc = await db.collection('sys_stats').doc('global').get();
        const sysStatsUniqueUsers = sysStatsDoc.exists
            ? (sysStatsDoc.data()?.uniqueUsersCount as number | null | undefined) ?? null
            : null;
        const chatUsersCountSnap = await db.collection('chatUsers').count().get();
        const uniqueUsersMetric = selectUniqueUsersMetric({
            sysStatsUniqueUsersCount: sysStatsUniqueUsers,
            chatUsersCount: chatUsersCountSnap.data().count || 0,
        });

        const data = {
            totalChats,
            escalatedChats: escalatedCountSnap.data().count || 0,
            pendingEscalations: pendingCountSnap.data().count || 0,
            uniqueUsers: uniqueUsersMetric.uniqueUsers,
            uniqueUsersInitialized: uniqueUsersMetric.initialized,
            uniqueUsersSource: uniqueUsersMetric.source,
            todayChats: todayCountSnap.data().count || 0,
            traceId,
        };

        console.info(
            '[admin.stats] read_ok',
            JSON.stringify({
                traceId,
                totalChats: data.totalChats,
                todayChats: data.todayChats,
                escalatedChats: data.escalatedChats,
                pendingEscalations: data.pendingEscalations,
                uniqueUsers: data.uniqueUsers,
                uniqueUsersInitialized: data.uniqueUsersInitialized,
                uniqueUsersSource: data.uniqueUsersSource,
            })
        );

        return NextResponse.json(data, {
            headers: {
                'X-RateLimit-Remaining': String(rateLimit.remaining),
                'X-Trace-Id': traceId,
                'Cache-Control': 'private, max-age=30',
            },
        });
    } catch (error) {
        console.error(
            '[admin.stats] read_failed',
            JSON.stringify({
                traceId,
                error: error instanceof Error ? error.message : String(error),
            })
        );
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
