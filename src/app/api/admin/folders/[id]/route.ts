import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import {
    extractBearerToken,
    getAdminFirestore,
    isUserAdmin,
    verifyIdToken,
} from '@/lib/firebase-admin';

const paramsSchema = z.object({
    id: z.string().min(1),
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const validatedParams = paramsSchema.safeParse(await params);
        if (!validatedParams.success) {
            return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 });
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const ref = db.collection('chatFolders').doc(validatedParams.data.id);
        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        await ref.delete();

        return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('DELETE /api/admin/folders/[id] error:', error);
        return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
    }
}
