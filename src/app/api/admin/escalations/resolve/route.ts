/**
 * Resolve Escalation API Route
 * POST /api/admin/escalations/resolve
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';

const resolveSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminResolve:${clientIP}`, RATE_LIMITS.adminActions);

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

        const isAdmin = await isUserAdmin(decodedToken);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const validation = resolveSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message || 'Validation failed' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const { sessionId } = validation.data;
        const escalationRef = db.collection('escalatedChats').doc(sessionId);
        const escalationDoc = await escalationRef.get();

        if (!escalationDoc.exists) {
            return NextResponse.json({ error: 'Escalation not found' }, { status: 404 });
        }

        await escalationRef.update({
            status: 'resolved',
            resolvedAt: Timestamp.now(),
            resolvedBy: decodedToken.email ?? decodedToken.uid,
        });

        await db.collection('chatSessions').doc(sessionId).set(
            {
                sessionId,
                escalationStatus: 'resolved',
                resolvedAt: Timestamp.now(),
                resolvedBy: decodedToken.email ?? decodedToken.uid,
            },
            { merge: true }
        );

        return NextResponse.json(
            { success: true },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                },
            }
        );
    } catch (error) {
        console.error('Resolve escalation API error:', error);
        return NextResponse.json({ error: 'Failed to resolve escalation' }, { status: 500 });
    }
}
