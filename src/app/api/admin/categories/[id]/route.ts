/**
 * Admin Category Operations
 * PATCH  /api/admin/categories/[id] — update a category
 * DELETE /api/admin/categories/[id] — delete a category
 */

import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { AdminCategory } from '@/data/types';

const COLLECTION = 'adminCategories';

const patchSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  nameEl: z.string().min(1).max(200).optional(),
  tagEl: z.string().min(1).max(80).optional(),
  summaryEl: z.string().min(1).max(1000).optional(),
  highlightsEl: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]).optional(),
  image: z.string().min(1).max(500).optional(),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  ctaLabel: z.string().max(100).optional(),
  assignedProductIds: z.array(z.string()).optional(),
});

async function authenticate(request: NextRequest, rateLimitKey: string) {
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.adminActions);
  if (!rateLimit.success) {
    return {
      error: NextResponse.json({ error: 'Too many requests' }, { status: 429 }),
      decoded: null,
    };
  }

  const token = extractBearerToken(request.headers.get('authorization'));
  if (!token) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), decoded: null };
  }

  const decoded = await verifyIdToken(token);
  if (!decoded) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }), decoded: null };
  }

  const isAdmin = await isUserAdmin(decoded);
  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }), decoded: null };
  }

  return { error: null, decoded };
}

function docToCategory(id: string, data: FirebaseFirestore.DocumentData): AdminCategory {
  return {
    id,
    slug: data.slug ?? '',
    order: data.order ?? 0,
    nameEl: data.nameEl ?? '',
    image: data.image ?? '',
    tagEl: data.tagEl ?? '',
    summaryEl: data.summaryEl ?? '',
    highlightsEl: (data.highlightsEl ?? ['', '', '']) as [string, string, string],
    visible: data.visible ?? true,
    ctaLabel: data.ctaLabel ?? 'Περισσότερες Λεπτομέρειες',
    assignedProductIds: data.assignedProductIds ?? [],
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date(0).toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date(0).toISOString(),
    createdBy: data.createdBy ?? '',
    updatedBy: data.updatedBy ?? '',
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const { error, decoded } = await authenticate(request, `adminCategoryPatch:${getClientIP(request)}`);
    if (error || !decoded) return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });

    const docRef = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = patchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? 'Invalid data' },
        { status: 400 },
      );
    }

    const updates = validation.data;

    // Check slug uniqueness if changing slug
    if (updates.slug && updates.slug !== docSnap.data()?.slug) {
      const existing = await db.collection(COLLECTION).where('slug', '==', updates.slug).limit(1).get();
      if (!existing.empty && existing.docs[0].id !== id) {
        return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 });
      }
    }

    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: decoded.email ?? decoded.uid,
    });

    const updated = await docRef.get();
    return NextResponse.json({ category: docToCategory(updated.id, updated.data()!) });
  } catch (error) {
    console.error('Admin category PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const { error } = await authenticate(request, `adminCategoryDelete:${getClientIP(request)}`);
    if (error) return error;

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });

    const docRef = db.collection(COLLECTION).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
