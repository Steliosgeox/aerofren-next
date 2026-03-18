import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    extractBearerToken,
    getAdminFirestore,
    isUserAdmin,
    verifyIdToken,
} from '@/lib/firebase-admin';

const paramsSchema = z.object({
    sessionId: z.string().uuid(),
});

const bodySchema = z.object({
    agentEmail: z.string().email().nullable(),
    teamId: z.string().nullable().optional(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminChatAssign:${clientIP}`, RATE_LIMITS.adminActions);

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
                { error: validatedBody.error.issues[0]?.message ?? 'Invalid body' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const { sessionId } = validatedParams.data;
        const { agentEmail, teamId } = validatedBody.data;

        const sessionRef = db.collection('chatSessions').doc(sessionId);
        const sessionSnapshot = await sessionRef.get();

        if (!sessionSnapshot.exists) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const update: Record<string, unknown> = {
            assignedAdminEmail: agentEmail ?? FieldValue.delete(),
        };

        if (teamId !== undefined) {
            update.teamId = teamId ?? FieldValue.delete();
        }

        await sessionRef.set(update, { merge: true });

        return NextResponse.json(
            { success: true, agentEmail, teamId: teamId ?? null },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'Cache-Control': 'no-store',
                },
            }
        );
    } catch (error) {
        console.error('Admin chat assign API error:', error);
        return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
    }
}
