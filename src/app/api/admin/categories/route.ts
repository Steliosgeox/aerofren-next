/**
 * Admin Categories API
 * GET  /api/admin/categories — list all, auto-seed from productShowcaseItems if empty
 * POST /api/admin/categories — create a new category
 */

import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { productShowcaseItems } from '@/data/product-showcase';
import type { AdminCategory } from '@/data/types';

const COLLECTION = 'adminCategories';

const createSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  nameEl: z.string().min(1).max(200),
  tagEl: z.string().min(1).max(80),
  summaryEl: z.string().min(1).max(1000),
  highlightsEl: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  image: z.string().min(1).max(500),
  order: z.number().int().min(0).optional(),
  visible: z.boolean().optional().default(true),
  ctaLabel: z.string().max(100).optional().default('Περισσότερες Λεπτομέρειες'),
  assignedProductIds: z.array(z.string()).optional().default([]),
});

/** Shared auth helper — returns decoded token or a NextResponse error */
async function authenticate(request: NextRequest, rateLimitKey: string, rateLimitConfig: { windowMs: number; maxRequests: number }) {
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(rateLimitKey, rateLimitConfig);
  if (!rateLimit.success) {
    return {
      error: NextResponse.json({ error: 'Too many requests' }, {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)) },
      }),
      decoded: null,
      remaining: 0,
    };
  }

  const token = extractBearerToken(request.headers.get('authorization'));
  if (!token) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }), decoded: null, remaining: rateLimit.remaining };
  }

  const decoded = await verifyIdToken(token);
  if (!decoded) {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }), decoded: null, remaining: rateLimit.remaining };
  }

  const isAdmin = await isUserAdmin(decoded);
  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }), decoded: null, remaining: rateLimit.remaining };
  }

  return { error: null, decoded, remaining: rateLimit.remaining };
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

export async function GET(request: NextRequest) {
  try {
    const { error, decoded, remaining } = await authenticate(
      request,
      `adminCategoryList:${getClientIP(request)}`,
      RATE_LIMITS.adminData,
    );
    if (error) return error;

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });

    let snapshot = await db.collection(COLLECTION).orderBy('order', 'asc').get();

    // Auto-seed from productShowcaseItems if collection is empty
    if (snapshot.empty) {
      const now = FieldValue.serverTimestamp();
      const batch = db.batch();
      productShowcaseItems.forEach((item, index) => {
        const ref = db.collection(COLLECTION).doc(item.id);
        batch.set(ref, {
          slug: item.slug,
          order: index,
          nameEl: item.nameEl,
          image: item.image,
          tagEl: item.tagEl,
          summaryEl: item.summaryEl,
          highlightsEl: item.highlightsEl,
          visible: true,
          ctaLabel: 'Περισσότερες Λεπτομέρειες',
          assignedProductIds: [],
          createdAt: now,
          updatedAt: now,
          createdBy: 'system-seed',
          updatedBy: 'system-seed',
        });
      });
      await batch.commit();
      snapshot = await db.collection(COLLECTION).orderBy('order', 'asc').get();
    }

    const categories = snapshot.docs.map((doc) => docToCategory(doc.id, doc.data()));

    return NextResponse.json(
      { categories, total: categories.length },
      { headers: { 'X-RateLimit-Remaining': String(remaining), 'Cache-Control': 'private, no-cache' } },
    );
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, decoded, remaining } = await authenticate(
      request,
      `adminCategoryCreate:${getClientIP(request)}`,
      RATE_LIMITS.adminActions,
    );
    if (error || !decoded) return error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getAdminFirestore();
    if (!db) return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });

    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? 'Invalid data' },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Check slug uniqueness
    const existing = await db.collection(COLLECTION).where('slug', '==', data.slug).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 });
    }

    // Auto-assign order if not provided
    let order = data.order;
    if (order === undefined) {
      const maxSnap = await db.collection(COLLECTION).orderBy('order', 'desc').limit(1).get();
      order = maxSnap.empty ? 0 : (maxSnap.docs[0].data().order ?? 0) + 1;
    }

    const now = FieldValue.serverTimestamp();
    const adminEmail = decoded.email ?? decoded.uid;

    const docRef = await db.collection(COLLECTION).add({
      slug: data.slug,
      order,
      nameEl: data.nameEl,
      image: data.image,
      tagEl: data.tagEl,
      summaryEl: data.summaryEl,
      highlightsEl: data.highlightsEl,
      visible: data.visible,
      ctaLabel: data.ctaLabel,
      assignedProductIds: data.assignedProductIds,
      createdAt: now,
      updatedAt: now,
      createdBy: adminEmail,
      updatedBy: adminEmail,
    });

    const created = await docRef.get();
    return NextResponse.json(
      { category: docToCategory(created.id, created.data()!) },
      { status: 201, headers: { 'X-RateLimit-Remaining': String(remaining) } },
    );
  } catch (error) {
    console.error('Admin categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
