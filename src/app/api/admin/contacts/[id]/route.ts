/**
 * Admin Contact Status Update
 * PATCH /api/admin/contacts/[id] — update contactSubmission status
 */

import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const patchSchema = z.object({
    status: z.enum(['new', 'read', 'replied']),
});

const CONTACTS_COLLECTION = 'contactSubmissions';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 });
        }

        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminContactPatch:${clientIP}`, RATE_LIMITS.adminData);

        if (!rateLimit.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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
        const validation = patchSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0]?.message ?? 'Invalid status' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        if (!db) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
        }

        const docRef = db.collection(CONTACTS_COLLECTION).doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        await docRef.update({
            status: validation.data.status,
            updatedAt: Timestamp.now(),
            updatedBy: decodedToken.email ?? decodedToken.uid,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin contact PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update contact status' }, { status: 500 });
    }
}
