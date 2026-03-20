import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { Timestamp } from 'firebase-admin/firestore';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    extractBearerToken,
    getAdminFirestore,
    isUserAdmin,
    verifyIdToken,
} from '@/lib/firebase-admin';

const filterSchema = z.object({
    status: z.string().optional().nullable(),
    teamId: z.string().optional().nullable(),
    assignedEmail: z.string().optional().nullable(),
});

const bodySchema = z.object({
    name: z.string().min(1).max(64),
    filter: filterSchema.optional().default({}),
});

async function authenticate(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);
    if (!token) return null;
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) return null;
    if (!(await isUserAdmin(decodedToken))) return null;
    return decodedToken;
}

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminFolders:${clientIP}`, RATE_LIMITS.adminActions);
        if (!rateLimit.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const decoded = await authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const snapshot = await db.collection('chatFolders').orderBy('name').get();
        const folders = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: String(doc.data().name ?? ''),
            filter: (doc.data().filter as Record<string, string | null>) ?? {},
        }));

        return NextResponse.json({ folders }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('GET /api/admin/folders error:', error);
        return NextResponse.json({ error: 'Failed to list folders' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminFolders:${clientIP}`, RATE_LIMITS.adminActions);
        if (!rateLimit.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
        }

        const decoded = await authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = bodySchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0]?.message ?? 'Invalid body' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const ref = await db.collection('chatFolders').add({
            name: validated.data.name,
            filter: validated.data.filter ?? {},
            createdAt: Timestamp.now(),
        });

        return NextResponse.json(
            { id: ref.id, name: validated.data.name, filter: validated.data.filter ?? {} },
            { status: 201, headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('POST /api/admin/folders error:', error);
        return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
}
