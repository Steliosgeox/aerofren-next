/**
 * Admin Escalations API Route
 * GET /api/admin/escalations
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminEscalations:${clientIP}`, RATE_LIMITS.adminData);

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

        const snapshot = await db
            .collection('escalatedChats')
            .orderBy('escalatedAt', 'desc')
            .get();

        const escalations = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                sessionId: data.sessionId,
                userId: data.userId,
                userEmail: data.userEmail,
                userName: data.userName,
                escalatedAt: data.escalatedAt?.toDate?.()?.toISOString() || new Date(0).toISOString(),
                status: data.status,
                resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || undefined,
                resolvedBy: data.resolvedBy,
            };
        });

        return NextResponse.json(escalations, {
            headers: {
                'X-RateLimit-Remaining': String(rateLimit.remaining),
            },
        });
    } catch (error) {
        console.error('Admin escalations API error:', error);
        return NextResponse.json({ error: 'Failed to fetch escalations' }, { status: 500 });
    }
}
