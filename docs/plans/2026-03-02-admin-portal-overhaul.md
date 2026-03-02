# Admin Portal Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete admin portal overhaul — shared layout, Αιτήματα unified inbox, Firestore real-time notifications in header for admins and users.

**Architecture:** `NotificationContext` uses Firestore `onSnapshot` on `escalatedChats` and `contactSubmissions` collections. `AdminLayout` is a client component wrapping all admin pages (eliminates duplicated auth-guard). New `/admin/requests` page is a tabbed unified inbox.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Firebase client SDK (`getFirestoreDb` from `@/lib/firebase`), lucide-react icons, Firestore Admin SDK for API routes.

---

## Task 0: Merge worktree into master

**Step 1: Merge feat/lenis-migration into master**
```bash
cd aerofren-next
git checkout master
git merge feat/lenis-migration --no-ff -m "feat: merge lenis migration + auth refactor + admin refactor + ScrollAnimation P1 fix"
```

**Step 2: Remove the worktree**
```bash
git worktree remove .worktrees/lenis-migration --force
```

**Step 3: Delete the branch**
```bash
git branch -d feat/lenis-migration
```

**Step 4: Verify merge**
```bash
git log --oneline -5
ls src/components/LenisProvider.tsx  # should exist
ls src/components/ScrollAnimation.tsx # should exist with 350ms timeout fix
```

**Step 5: Copy .env.local to project root (if not already there)**
```bash
# The worktree had a copy — ensure the main project has it
ls .env.local  # should exist with Firebase keys
```

---

## Task 1: Extend `services/admin.ts` with contact submissions

**Files:**
- Modify: `src/services/admin.ts`

**Step 1: Add types and functions**

Add to the end of `src/services/admin.ts`:

```typescript
export interface ContactSubmission {
    id: string;
    requestId: string;
    name: string;
    email: string;
    message: string;
    phone?: string;
    company?: string;
    subject?: string;
    submittedAt: string;
    status: 'new' | 'read' | 'replied';
    source: string;
}

export async function fetchContactSubmissionsPage(
    user: AuthUser | null,
    options?: { cursor?: string | null; limit?: number }
): Promise<PaginatedResult<ContactSubmission>> {
    const params = new URLSearchParams();
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.limit) params.set('limit', String(options.limit));

    const data = await fetchWithAuth<{ contacts: ContactSubmission[]; nextCursor: string | null }>(
        user,
        `/api/admin/contacts${params.toString() ? `?${params.toString()}` : ''}`
    );

    return {
        items: data.contacts ?? [],
        nextCursor: data.nextCursor ?? null,
    };
}

export async function updateContactStatus(
    user: AuthUser | null,
    id: string,
    status: ContactSubmission['status']
): Promise<boolean> {
    const data = await fetchWithAuth<{ success: boolean }>(
        user,
        `/api/admin/contacts/${encodeURIComponent(id)}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }
    );
    return data.success === true;
}
```

**Step 2: Commit**
```bash
git add src/services/admin.ts
git commit -m "feat(admin): add ContactSubmission type + fetch/update contact service functions"
```

---

## Task 2: API route — GET /api/admin/contacts

**Files:**
- Create: `src/app/api/admin/contacts/route.ts`

**Step 1: Create the route file**

```typescript
/**
 * Admin Contacts API Route
 * GET /api/admin/contacts — paginated contact form submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { extractBearerToken, getAdminFirestore, isUserAdmin, verifyIdToken } from '@/lib/firebase-admin';

const CONTACTS_COLLECTION = 'contactSubmissions';
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(`adminContacts:${clientIP}`, RATE_LIMITS.adminData);

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

        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
        const limit = Math.min(isNaN(rawLimit) ? DEFAULT_LIMIT : rawLimit, MAX_LIMIT);

        let query = db
            .collection(CONTACTS_COLLECTION)
            .orderBy('submittedAt', 'desc')
            .limit(limit + 1);

        if (cursor) {
            const cursorDoc = await db.collection(CONTACTS_COLLECTION).doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        const snapshot = await query.get();
        const docs = snapshot.docs;
        const hasMore = docs.length > limit;
        const items = (hasMore ? docs.slice(0, limit) : docs).map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                requestId: data.requestId ?? doc.id,
                name: data.name ?? 'Άγνωστος',
                email: data.email ?? '',
                message: data.message ?? '',
                phone: data.phone ?? undefined,
                company: data.company ?? undefined,
                subject: data.subject ?? undefined,
                submittedAt: data.submittedAt?.toDate?.()?.toISOString() ?? new Date(0).toISOString(),
                status: data.status ?? 'new',
                source: data.source ?? 'website-contact-form',
            };
        });

        const nextCursor = hasMore ? docs[limit - 1].id : null;

        return NextResponse.json(
            { contacts: items, nextCursor },
            {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                },
            }
        );
    } catch (error) {
        console.error('Admin contacts API error:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}
```

**Step 2: Commit**
```bash
git add src/app/api/admin/contacts/route.ts
git commit -m "feat(api): add GET /api/admin/contacts — paginated contact submissions for admin"
```

---

## Task 3: API route — PATCH /api/admin/contacts/[id]

**Files:**
- Create: `src/app/api/admin/contacts/[id]/route.ts`

**Step 1: Create the route file**

```typescript
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
        const doc = await docRef.get();

        if (!doc.exists) {
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
```

**Step 2: Commit**
```bash
git add src/app/api/admin/contacts/
git commit -m "feat(api): add PATCH /api/admin/contacts/[id] — update contact submission status"
```

---

## Task 4: Firestore security rules

**Files:**
- Check if `firestore.rules` exists in project root: `ls firestore.rules`
- If not, check `firebase.json` for rules file path

**Step 1: Find or create the rules file**

If `firestore.rules` does NOT exist, create it:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: check if user is authenticated
    function isAuth() {
      return request.auth != null;
    }

    // Helper: check if user is admin (matches admin-emails list)
    // Note: in production, add custom claim check: request.auth.token.admin == true
    // For now, this is enforced server-side via firebase-admin
    function isAdmin() {
      return isAuth() && request.auth.token.admin == true;
    }

    // chatMessages: authenticated users can read their own session messages
    match /chatMessages/{docId} {
      allow read: if isAuth() && resource.data.userId == request.auth.uid;
      allow write: if false; // writes via server API only
    }

    // chatSessions: authenticated users can read their own sessions
    match /chatSessions/{sessionId} {
      allow read: if isAuth() && resource.data.userId == request.auth.uid;
      allow write: if false;
    }

    // escalatedChats: admin reads all; users read their own
    match /escalatedChats/{docId} {
      allow read: if isAdmin() || (isAuth() && resource.data.userId == request.auth.uid);
      allow write: if false; // writes via server API only
    }

    // contactSubmissions: admin reads only (no user ownership)
    match /contactSubmissions/{docId} {
      allow read: if isAdmin();
      allow write: if false; // writes via /api/contact only
    }
  }
}
```

**IMPORTANT:** The `isAdmin()` function above uses a custom claim `request.auth.token.admin == true`. The server-side already checks admin by email whitelist. For client-side rules, the simplest approach that's still secure for v1 is to rely on the existing server-side checks and keep client-side rules open for authenticated users on their own data. Update the rules to:

```
match /escalatedChats/{docId} {
  // Admin: no client-side rule enforcement (all admin reads go via API with admin SDK)
  // Regular users: can read their own escalations for notification purposes
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow write: if false;
}

match /contactSubmissions/{docId} {
  // No client-side access — admin reads go via server API
  allow read: if false;
  allow write: if false;
}
```

This means:
- Regular users get `onSnapshot` on their own `escalatedChats` ✓
- Admin notification for `contactSubmissions` will use a **polling fallback** (30s interval) since the client SDK can't read it safely without custom claims
- Admin notification for `escalatedChats` also goes via polling for admin (they see ALL, not just their own)

**REVISED APPROACH for Admin Notifications (pragmatic v1):**
Since setting up Firebase custom claims requires Firebase Admin SDK configuration outside the scope of this feature, admin notifications will use **30-second polling** against the existing REST API. Regular user notifications (their own escalation resolved) use `onSnapshot`.

This is the cleanest approach that works immediately without Firestore rules changes.

**Step 2: Apply the rules**
```bash
# If firebase CLI is installed:
firebase deploy --only firestore:rules

# If not, update via Firebase Console:
# https://console.firebase.google.com → Firestore → Rules tab
# Paste the escalatedChats rule above
```

**Step 3: Commit the rules file**
```bash
git add firestore.rules
git commit -m "feat(firestore): add security rules for escalatedChats user-scoped read access"
```

---

## Task 5: NotificationContext

**Files:**
- Create: `src/contexts/NotificationContext.tsx`

**Architecture decision (from Task 4 analysis):**
- **Regular users** → Firestore `onSnapshot` on `escalatedChats WHERE userId == user.uid`
- **Admin users** → 30s polling of `/api/admin/escalations` + `/api/admin/contacts`

**Step 1: Create the context**

```typescript
'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEscalations, fetchContactSubmissionsPage } from '@/services/admin';

export interface AppNotification {
    id: string;
    type: 'escalation' | 'contact' | 'escalation_resolved';
    title: string;
    body: string;
    timestamp: Date;
    href: string;
    isRead: boolean;
}

interface NotificationContextValue {
    notifications: AppNotification[];
    unreadCount: number;
    markAllRead: () => void;
    markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
    notifications: [],
    unreadCount: 0,
    markAllRead: () => {},
    markRead: () => {},
});

function getReadSet(userId: string): Set<string> {
    try {
        const raw = localStorage.getItem(`notifications:read:${userId}`);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadSet(userId: string, ids: Set<string>) {
    try {
        localStorage.setItem(`notifications:read:${userId}`, JSON.stringify([...ids]));
    } catch {
        // ignore localStorage errors (private browsing, etc.)
    }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user, isAdmin } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevEscalationIdsRef = useRef<Set<string>>(new Set());
    const prevContactIdsRef = useRef<Set<string>>(new Set());

    // Load read set from localStorage when user changes
    useEffect(() => {
        if (user?.uid) {
            setReadIds(getReadSet(user.uid));
        } else {
            setReadIds(new Set());
            setNotifications([]);
        }
    }, [user?.uid]);

    const markAllRead = useCallback(() => {
        if (!user?.uid) return;
        const allIds = new Set(notifications.map((n) => n.id));
        setReadIds(allIds);
        saveReadSet(user.uid, allIds);
    }, [notifications, user?.uid]);

    const markRead = useCallback((id: string) => {
        if (!user?.uid) return;
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            saveReadSet(user.uid!, next);
            return next;
        });
    }, [user?.uid]);

    // ── Regular user: onSnapshot for their own escalatedChats ──────────────
    useEffect(() => {
        if (!user?.uid || isAdmin) return;

        const db = getFirestoreDb();
        const q = query(
            collection(db, 'escalatedChats'),
            where('userId', '==', user.uid),
            orderBy('escalatedAt', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const notifs: AppNotification[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                const isResolved = data.status === 'resolved';
                return {
                    id: doc.id,
                    type: isResolved ? 'escalation_resolved' : 'escalation',
                    title: isResolved ? 'Αίτημα επιλύθηκε' : 'Αίτημα σε εξέλιξη',
                    body: isResolved
                        ? 'Ένας εκπρόσωπος ολοκλήρωσε το αίτημά σας.'
                        : 'Το αίτημά σας λαμβάνει χειρισμό.',
                    timestamp: data.escalatedAt?.toDate() ?? new Date(),
                    href: '/',
                    isRead: readIds.has(doc.id),
                };
            });
            setNotifications(notifs);
        }, (error) => {
            console.warn('[NotificationContext] onSnapshot error:', error);
        });

        return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isAdmin]);
    // Note: readIds intentionally excluded — we don't want snapshot to re-run on read

    // ── Admin: 30s polling for escalations + contacts ──────────────────────
    const pollAdmin = useCallback(async () => {
        if (!user || !isAdmin) return;

        try {
            const [escalations, contactsPage] = await Promise.all([
                fetchEscalations(user),
                fetchContactSubmissionsPage(user, { limit: 20 }),
            ]);

            const newNotifs: AppNotification[] = [];

            // Escalations
            const currentEscIds = new Set(escalations.map((e) => e.sessionId));
            for (const esc of escalations) {
                if (
                    esc.status === 'pending' &&
                    !prevEscalationIdsRef.current.has(esc.sessionId)
                ) {
                    newNotifs.push({
                        id: `esc:${esc.sessionId}`,
                        type: 'escalation',
                        title: 'Νέα κλιμάκωση',
                        body: `${esc.userName || esc.userEmail || 'Χρήστης'} ζητά βοήθεια`,
                        timestamp: new Date(esc.escalatedAt),
                        href: `/admin/requests`,
                        isRead: readIds.has(`esc:${esc.sessionId}`),
                    });
                }
            }
            prevEscalationIdsRef.current = currentEscIds;

            // Contacts
            const currentContactIds = new Set(contactsPage.items.map((c) => c.id));
            for (const contact of contactsPage.items) {
                if (
                    contact.status === 'new' &&
                    !prevContactIdsRef.current.has(contact.id)
                ) {
                    newNotifs.push({
                        id: `contact:${contact.id}`,
                        type: 'contact',
                        title: 'Νέα φόρμα επικοινωνίας',
                        body: `${contact.name}: ${contact.subject || contact.message.slice(0, 50)}`,
                        timestamp: new Date(contact.submittedAt),
                        href: `/admin/requests?tab=contacts`,
                        isRead: readIds.has(`contact:${contact.id}`),
                    });
                }
            }
            prevContactIdsRef.current = currentContactIds;

            if (newNotifs.length > 0) {
                setNotifications((prev) => {
                    const existingIds = new Set(prev.map((n) => n.id));
                    const deduped = newNotifs.filter((n) => !existingIds.has(n.id));
                    return [...deduped, ...prev].slice(0, 50);
                });
            }
        } catch (error) {
            console.warn('[NotificationContext] Admin poll error:', error);
        }
    }, [user, isAdmin, readIds]);

    useEffect(() => {
        if (!user || !isAdmin) return;

        // Initial load
        pollAdmin();

        // Poll every 30s
        pollIntervalRef.current = setInterval(pollAdmin, 30_000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [user, isAdmin, pollAdmin]);

    // Apply read state to all notifications
    const notificationsWithReadState = notifications.map((n) => ({
        ...n,
        isRead: readIds.has(n.id),
    }));

    const unreadCount = notificationsWithReadState.filter((n) => !n.isRead).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications: notificationsWithReadState,
                unreadCount,
                markAllRead,
                markRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
```

**Step 2: Commit**
```bash
git add src/contexts/NotificationContext.tsx
git commit -m "feat(notifications): add NotificationContext — Firestore onSnapshot for users, 30s polling for admins"
```

---

## Task 6: NotificationBell component

**Files:**
- Create: `src/components/NotificationBell.tsx`

**Step 1: Create the component**

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, type AppNotification } from '@/contexts/NotificationContext';

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return 'μόλις τώρα';
    if (diffMin < 60) return `${diffMin}λ πριν`;
    if (diffH < 24) return `${diffH}ω πριν`;
    return `${diffD}μ πριν`;
}

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
    if (type === 'escalation') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    if (type === 'contact') return <Mail className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />;
    return <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />;
}

export function NotificationBell() {
    const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                panelRef.current && !panelRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const recent = notifications.slice(0, 10);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-xl transition-colors hover:bg-white/10"
                aria-label={`Ειδοποιήσεις${unreadCount > 0 ? ` (${unreadCount} αδιάβαστες)` : ''}`}
            >
                <Bell
                    className="w-5 h-5"
                    style={{ color: 'var(--theme-text-muted)' }}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--theme-accent)] text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
                    style={{
                        background: 'var(--theme-mega-bg)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--theme-glass-border)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid var(--theme-glass-border)' }}
                    >
                        <span
                            className="text-sm font-semibold"
                            style={{ color: 'var(--theme-text)' }}
                        >
                            Ειδοποιήσεις
                            {unreadCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors hover:bg-white/10"
                                    style={{ color: 'var(--theme-text-muted)' }}
                                    title="Σήμανση όλων ως διαβασμένα"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                                style={{ color: 'var(--theme-text-muted)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                        {recent.length === 0 ? (
                            <div
                                className="py-8 text-center text-sm"
                                style={{ color: 'var(--theme-text-muted)' }}
                            >
                                Δεν υπάρχουν ειδοποιήσεις.
                            </div>
                        ) : (
                            recent.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={notif.href}
                                    onClick={() => {
                                        markRead(notif.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                                    style={{
                                        borderBottom: '1px solid var(--theme-glass-border)',
                                        backgroundColor: notif.isRead ? 'transparent' : 'color-mix(in srgb, var(--theme-accent) 5%, transparent)',
                                    }}
                                >
                                    <NotificationIcon type={notif.type} />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-sm font-medium truncate"
                                            style={{ color: 'var(--theme-text)' }}
                                        >
                                            {notif.title}
                                        </p>
                                        <p
                                            className="text-xs mt-0.5 truncate"
                                            style={{ color: 'var(--theme-text-muted)' }}
                                        >
                                            {notif.body}
                                        </p>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                                            {formatRelativeTime(notif.timestamp)}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] shrink-0 mt-1.5" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
```

**Step 2: Commit**
```bash
git add src/components/NotificationBell.tsx
git commit -m "feat(ui): add NotificationBell component — bell icon with badge, dropdown, mark-read"
```

---

## Task 7: Wire NotificationProvider + NotificationBell into the app

**Files:**
- Modify: `src/app/(main)/layout.tsx`
- Modify: `src/components/Header.tsx`

**Step 1: Update layout.tsx**

In `src/app/(main)/layout.tsx`, import and wrap with `NotificationProvider`:

```typescript
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { RouteEffects } from "@/components/RouteEffects"
import { RouteScrollShell } from "@/components/RouteScrollShell"
import { NotificationProvider } from "@/contexts/NotificationContext"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const currentYear = new Date().getFullYear()

  return (
    <>
      <div className="waves-background" aria-hidden="true" />
      <RouteEffects />
      <NotificationProvider>
        <Header />
        <RouteScrollShell>
          <main className="min-h-screen">{children}</main>
          <Footer currentYear={currentYear} />
        </RouteScrollShell>
      </NotificationProvider>
    </>
  )
}
```

**Step 2: Update Header.tsx — add NotificationBell**

In `src/components/Header.tsx`:

1. Add import at top:
```typescript
import { NotificationBell } from './NotificationBell';
```

2. Find the "Desktop CTA" section (around line 532). Change the right side from:
```tsx
{/* Login / User Avatar - Anchored Right */}
<div className="relative justify-self-end" ref={userMenuRef}>
```
To include the bell BEFORE the user avatar area:
```tsx
{/* Notifications + User Avatar - Anchored Right */}
<div className="flex items-center gap-2 justify-self-end">
  {user && !authLoading && <NotificationBell />}
  <div className="relative" ref={userMenuRef}>
    {/* existing user avatar / login button code stays here */}
  </div>
</div>
```

The wrapping `<div className="relative justify-self-end" ref={userMenuRef}>` becomes a nested div for just the user menu, and the outer div is a flex row with the bell.

**Step 3: Commit**
```bash
git add src/app/(main)/layout.tsx src/components/Header.tsx
git commit -m "feat(header): add real-time NotificationBell to header and wire NotificationProvider to main layout"
```

---

## Task 8: AdminAccessDenied component

**Files:**
- Create: `src/components/admin/AdminAccessDenied.tsx`

**Step 1: Create the file**

```typescript
'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminAccessDenied() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg-solid)]">
            <div
                className="w-full max-w-md rounded-2xl p-8 text-center"
                style={{
                    background: 'var(--theme-glass-bg)',
                    border: '1px solid var(--theme-glass-border)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-red-500/15">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--theme-text)' }}
                >
                    Πρόσβαση μόνο για διαχειριστές
                </h2>
                <p className="mb-6" style={{ color: 'var(--theme-text-muted)' }}>
                    {!user
                        ? 'Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα.'
                        : 'Ο λογαριασμός σας δεν έχει δικαιώματα διαχειριστή.'}
                </p>
                <div className="flex flex-col gap-3">
                    {!user ? (
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] hover:-translate-y-0.5 transition-transform"
                        >
                            Σύνδεση
                        </button>
                    ) : (
                        <>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--theme-text-muted)' }}
                            >
                                Συνδεδεμένος ως: {user.email}
                            </p>
                            <button
                                onClick={handleSignOut}
                                className="w-full py-3 px-6 rounded-xl font-semibold transition-colors"
                                style={{
                                    color: 'var(--theme-text)',
                                    border: '1px solid var(--theme-glass-border)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--theme-glass-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                Αποσύνδεση
                            </button>
                        </>
                    )}
                    <Link
                        href="/"
                        className="text-sm hover:underline"
                        style={{ color: 'var(--theme-accent)' }}
                    >
                        Επιστροφή στην αρχική
                    </Link>
                </div>
            </div>
        </div>
    );
}
```

**Step 2: Commit**
```bash
git add src/components/admin/AdminAccessDenied.tsx
git commit -m "feat(admin): add AdminAccessDenied component — single access denied UI for all admin pages"
```

---

## Task 9: AdminSidebar component

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`

**Step 1: Create the sidebar**

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    TrendingUp,
    Bot,
    Inbox,
    Users,
    Settings,
    LogOut,
    UserCircle,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
    disabled?: boolean;
}

export function AdminSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { unreadCount } = useNotifications();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/';
    };

    const navItems: NavItem[] = [
        { label: 'Σύνοψη', icon: <TrendingUp className="w-5 h-5" />, href: '/admin' },
        { label: 'Συνομιλίες AI', icon: <Bot className="w-5 h-5" />, href: '/admin/chats' },
        { label: 'Αιτήματα', icon: <Inbox className="w-5 h-5" />, href: '/admin/requests', badge: unreadCount > 0 ? unreadCount : undefined },
        { label: 'Χρήστες', icon: <Users className="w-5 h-5" />, href: '/admin/users' },
        { label: 'Ρυθμίσεις', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname?.startsWith(href) ?? false;
    };

    return (
        <div className="p-5 flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                    <span className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>
                        AEROFREN
                    </span>
                    <span className="text-xs block" style={{ color: 'var(--theme-text-muted)' }}>
                        Διαχείριση
                    </span>
                </div>
            </div>

            {/* User card */}
            <div
                className="mb-6 p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.05)' }}
            >
                <div className="relative shrink-0">
                    {user?.photoURL ? (
                        <Image
                            src={user.photoURL}
                            alt=""
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] flex items-center justify-center text-white font-bold text-sm">
                            {user?.displayName?.[0] || user?.email?.[0] || 'A'}
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--theme-accent)] flex items-center justify-center">
                        <Shield className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>
                <div className="min-w-0">
                    <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--theme-text)' }}
                    >
                        {user?.displayName || 'Διαχειριστής'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--theme-text-muted)' }}>
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                <p
                    className="text-[10px] font-bold tracking-widest px-4 mb-2"
                    style={{ color: 'var(--theme-text-muted)' }}
                >
                    ΠΛΟΗΓΗΣΗ
                </p>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                                active ? 'text-white' : ''
                            }`}
                            style={{
                                background: active
                                    ? 'linear-gradient(135deg, var(--theme-accent), var(--theme-accent-hover))'
                                    : 'transparent',
                                color: active ? 'white' : 'var(--theme-text-muted)',
                                boxShadow: active ? '0 4px 16px rgba(0, 186, 226, 0.3)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                if (!active) e.currentTarget.style.color = 'var(--theme-text)';
                            }}
                            onMouseLeave={(e) => {
                                if (!active) e.currentTarget.style.background = 'transparent';
                                if (!active) e.currentTarget.style.color = 'var(--theme-text-muted)';
                            }}
                        >
                            {item.icon}
                            <span className="flex-1">{item.label}</span>
                            {item.badge !== undefined && (
                                <span className="min-w-[20px] h-5 rounded-full bg-[var(--theme-accent)] text-white text-[10px] font-bold flex items-center justify-center px-1">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--theme-glass-border)' }}>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors"
                    style={{ color: 'var(--theme-text-muted)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--theme-text)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--theme-text-muted)';
                    }}
                >
                    <LogOut className="w-5 h-5" />
                    Αποσύνδεση
                </button>
            </div>
        </div>
    );
}
```

**Step 2: Commit**
```bash
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat(admin): add AdminSidebar — nav with notification badges, user card, brand header"
```

---

## Task 10: AdminLayout component

**Files:**
- Create: `src/components/admin/AdminLayout.tsx`
- Create: `src/components/admin/index.ts` (barrel)

**Step 1: Create AdminLayout**

```typescript
'use client';

import React, { useState } from 'react';
import { Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminAccessDenied } from './AdminAccessDenied';

interface AdminLayoutProps {
    title: string;
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}

export function AdminLayout({ title, children, headerRight }: AdminLayoutProps) {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auth loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
            </div>
        );
    }

    // Access denied
    if (!user || !isAdmin) {
        return <AdminAccessDenied />;
    }

    return (
        /*
         * Layout: global Header is position:fixed at 100px.
         * pt-[100px] offsets content below it.
         * Sidebar is sticky on lg, fixed on mobile.
         */
        <div className="min-h-screen flex bg-[var(--theme-bg-solid)] pt-[100px]">
            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky lg:top-[100px] lg:self-start
                    top-[100px] left-0 z-40
                    w-64 h-[calc(100vh-100px)] overflow-y-auto
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{
                    background: 'var(--theme-glass-bg)',
                    borderRight: '1px solid var(--theme-glass-border)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <AdminSidebar />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main content */}
            <main className="flex-1 min-w-0 p-6 lg:p-8">
                {/* Mobile hamburger */}
                <button
                    className="lg:hidden fixed top-[116px] left-4 z-50 p-2 rounded-xl shadow-lg"
                    style={{
                        background: 'var(--theme-glass-bg)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--theme-glass-border)',
                    }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarOpen
                        ? <X className="w-5 h-5" style={{ color: 'var(--theme-text)' }} />
                        : <Menu className="w-5 h-5" style={{ color: 'var(--theme-text)' }} />
                    }
                </button>

                {/* Page header */}
                <div className="flex items-center justify-between mb-8">
                    <h1
                        className="text-3xl font-extrabold"
                        style={{ color: 'var(--theme-text)' }}
                    >
                        {title}
                    </h1>
                    {headerRight}
                </div>

                {children}
            </main>
        </div>
    );
}
```

**Step 2: Create barrel export**
```typescript
// src/components/admin/index.ts
export { AdminLayout } from './AdminLayout';
export { AdminSidebar } from './AdminSidebar';
export { AdminAccessDenied } from './AdminAccessDenied';
```

**Step 3: Commit**
```bash
git add src/components/admin/
git commit -m "feat(admin): add AdminLayout component — shared auth guard + sidebar wrapper for all admin pages"
```

---

## Task 11: Refactor Admin Dashboard page

**Files:**
- Modify: `src/app/(main)/admin/page.tsx`

**Step 1: Rewrite to use AdminLayout**

The page keeps all existing logic (fetchData, handleResolveEscalation, etc.) but removes the auth check, sidebar, and duplicated access-denied UI. Key changes:
- Remove `sidebarOpen`, `useState(true)`, sidebar JSX, mobile hamburger JSX, `authLoading` check, `!user || !isAdmin` check
- Import `AdminLayout` from `@/components/admin`
- Add 5th stat card for `todayChats`
- Fix user message timestamp color in chat viewer (not applicable on this page)
- The `RefreshCw` button goes into `AdminLayout`'s `headerRight` prop

```tsx
// Minimal diff — strip all the auth/layout boilerplate, wrap with AdminLayout:
import { AdminLayout } from '@/components/admin';
// ... keep all other imports and logic ...

export default function AdminPage() {
    // ... all existing state and callbacks ...

    const refreshButton = (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
                border: '1px solid var(--theme-glass-border)',
                color: 'var(--theme-text)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Ανανέωση
        </button>
    );

    // Update statsCards to include todayChats:
    const statsCards = stats ? [
        { label: 'Συνολικές συνομιλίες', value: stats.totalChats, icon: <MessageCircle className="w-6 h-6" /> },
        { label: 'Σήμερα', value: stats.todayChats, icon: <TrendingUp className="w-6 h-6" /> },
        { label: 'Κλιμακωμένες', value: stats.escalatedChats, icon: <AlertTriangle className="w-6 h-6" /> },
        { label: 'Εκκρεμείς κλιμακώσεις', value: stats.pendingEscalations, icon: <Clock className="w-6 h-6" /> },
        { label: 'Μοναδικοί χρήστες', value: stats.uniqueUsers, icon: <Users className="w-6 h-6" /> },
    ] : [];

    return (
        <AdminLayout title="Σύνοψη" headerRight={refreshButton}>
            {/* error banner, stats grid, escalated chats table — same as before */}
        </AdminLayout>
    );
}
```

Note: Update the stats grid from `lg:grid-cols-4` to `lg:grid-cols-5` to accommodate the new card.

**Step 2: Commit**
```bash
git add src/app/(main)/admin/page.tsx
git commit -m "refactor(admin): dashboard uses shared AdminLayout + adds todayChats stat card"
```

---

## Task 12: Refactor Admin Chats page + fix timestamp bug

**Files:**
- Modify: `src/app/(main)/admin/chats/page.tsx`

**Step 1: Remove auth boilerplate, use AdminLayout**

Same pattern as Task 11. Additionally fix the timestamp color bug:

Find this in `AdminChatsPageContent`:
```tsx
className={`text-xs mt-1 ${msg.role === "user"
    ? "text-[var(--theme-accent)]"  // BUG: teal text on teal background
    : "text-[var(--theme-text-muted)]"
}`}
```

Fix to:
```tsx
className={`text-xs mt-1 ${msg.role === "user"
    ? "text-white/60"               // FIX: white/60 on teal background
    : "text-[var(--theme-text-muted)]"
}`}
```

Remove the sub-header (the `sticky top-[100px]` header) — it's replaced by `AdminLayout`'s built-in header. Instead, put the session count subtitle into the page and the refresh button into `headerRight`.

The `AdminChatsPage` (the Suspense wrapper) stays, but `AdminChatsPageContent` now returns `<AdminLayout>` instead of the full page structure.

**Step 2: Commit**
```bash
git add src/app/(main)/admin/chats/page.tsx
git commit -m "refactor(admin): chats page uses shared AdminLayout; fix user message timestamp color"
```

---

## Task 13: New Αιτήματα page

**Files:**
- Create: `src/app/(main)/admin/requests/page.tsx`

**Step 1: Create the unified inbox page**

This is the most complex new page. Structure:

```tsx
'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Mail, Search, RefreshCw, CheckCircle, Clock, ChevronRight, ExternalLink, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import {
    EscalatedChat, fetchEscalations, resolveEscalation,
    ContactSubmission, fetchContactSubmissionsPage, updateContactStatus,
} from '@/services/admin';

// ── STATUS CONFIG ──────────────────────────────────────────────────────────
const ESCALATION_STATUS_CONFIG = {
    pending:     { label: 'Σε αναμονή',     classes: 'bg-yellow-500/15 text-yellow-400' },
    in_progress: { label: 'Σε εξέλιξη',     classes: 'bg-[var(--theme-accent)]/15 text-[var(--theme-accent)]' },
    resolved:    { label: 'Ολοκληρώθηκε',   classes: 'bg-green-500/15 text-green-400' },
} as const;

const CONTACT_STATUS_CONFIG = {
    new:     { label: 'Νέο',          classes: 'bg-amber-500/15 text-amber-400' },
    read:    { label: 'Διαβάστηκε',   classes: 'bg-blue-500/15 text-blue-400' },
    replied: { label: 'Απαντήθηκε',   classes: 'bg-green-500/15 text-green-400' },
} as const;

function StatusBadge({ status, type }: { status: string; type: 'escalation' | 'contact' }) {
    const config = type === 'escalation'
        ? ESCALATION_STATUS_CONFIG[status as keyof typeof ESCALATION_STATUS_CONFIG]
        : CONTACT_STATUS_CONFIG[status as keyof typeof CONTACT_STATUS_CONFIG];
    if (!config) return null;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${config.classes}`}>
            {config.label}
        </span>
    );
}

function formatTime(ts: string | Date | null | undefined) {
    const d = typeof ts === 'string' ? new Date(ts) : ts instanceof Date ? ts : new Date();
    return d.toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── ESCALATION DETAIL ──────────────────────────────────────────────────────
function EscalationDetail({ chat, onResolve }: { chat: EscalatedChat; onResolve: () => void }) {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-5 flex items-start justify-between gap-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                <div>
                    <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{chat.userName || 'Ανώνυμος'}</p>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{chat.userEmail}</p>
                    <div className="mt-2">
                        <StatusBadge status={chat.status} type="escalation" />
                    </div>
                </div>
                <p className="text-xs shrink-0" style={{ color: 'var(--theme-text-muted)' }}>{formatTime(chat.escalatedAt)}</p>
            </div>
            {/* Actions */}
            <div className="p-5 flex flex-col gap-3">
                <Link
                    href={`/admin/chats?session=${chat.sessionId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--theme-accent)', color: 'white' }}
                >
                    <ExternalLink className="w-4 h-4" />
                    Προβολή συνομιλίας
                </Link>
                {chat.status !== 'resolved' && (
                    <button
                        onClick={onResolve}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 bg-green-500/15 text-green-400 hover:bg-green-500/25"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Επίλυση αιτήματος
                    </button>
                )}
                {/* Info */}
                <div className="mt-2 space-y-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    <p><span className="font-medium" style={{ color: 'var(--theme-text)' }}>ID συνεδρίας:</span> {chat.sessionId.slice(0, 20)}...</p>
                    {chat.resolvedBy && <p><span className="font-medium" style={{ color: 'var(--theme-text)' }}>Επιλύθηκε από:</span> {chat.resolvedBy}</p>}
                </div>
            </div>
        </div>
    );
}

// ── CONTACT DETAIL ─────────────────────────────────────────────────────────
function ContactDetail({ contact, onStatusChange }: { contact: ContactSubmission; onStatusChange: (status: ContactSubmission['status']) => void }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-5" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{contact.name}</p>
                        <p className="text-sm" style={{ color: 'var(--theme-accent)' }}>{contact.email}</p>
                    </div>
                    <StatusBadge status={contact.status} type="contact" />
                </div>
                {contact.subject && (
                    <p className="mt-3 font-semibold" style={{ color: 'var(--theme-text)' }}>{contact.subject}</p>
                )}
                <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>{formatTime(contact.submittedAt)}</p>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
                {/* Extra info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {contact.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone}
                        </span>
                    )}
                    {contact.company && (
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {contact.company}
                        </span>
                    )}
                </div>

                {/* Message */}
                <div
                    className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--theme-glass-border)',
                        color: 'var(--theme-text)',
                    }}
                >
                    {contact.message}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2">
                    <a
                        href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Επικοινωνία AEROFREN')}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold hover:-translate-y-0.5 transition-all"
                        style={{ background: 'var(--theme-accent)', color: 'white' }}
                        onClick={() => onStatusChange('replied')}
                    >
                        <Mail className="w-4 h-4" />
                        Απάντηση μέσω email
                    </a>
                    {contact.status !== 'replied' && (
                        <div className="flex gap-2">
                            {contact.status === 'new' && (
                                <button
                                    onClick={() => onStatusChange('read')}
                                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                                >
                                    Σήμανση ως διαβασμένο
                                </button>
                            )}
                            <button
                                onClick={() => onStatusChange('replied')}
                                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors bg-green-500/15 text-green-400 hover:bg-green-500/25"
                            >
                                Σήμανση ως απαντημένο
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
type Tab = 'escalations' | 'contacts';

function RequestsPageContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<Tab>(
        (searchParams.get('tab') as Tab) ?? 'escalations'
    );
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Escalations
    const [escalations, setEscalations] = useState<EscalatedChat[]>([]);
    const [selectedEscalation, setSelectedEscalation] = useState<EscalatedChat | null>(null);

    // Contacts
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const [escs, contactsPage] = await Promise.all([
                fetchEscalations(user),
                fetchContactSubmissionsPage(user, { limit: 50 }),
            ]);
            setEscalations(escs);
            setContacts(contactsPage.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Αποτυχία φόρτωσης δεδομένων.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Auto-mark contact as read when selected
    useEffect(() => {
        if (selectedContact && selectedContact.status === 'new') {
            handleContactStatusChange(selectedContact.id, 'read');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedContact?.id]);

    const handleResolveEscalation = async (sessionId: string) => {
        if (!user) return;
        await resolveEscalation(user, sessionId);
        await fetchAll();
        setSelectedEscalation(null);
    };

    const handleContactStatusChange = async (id: string, status: ContactSubmission['status']) => {
        if (!user) return;
        await updateContactStatus(user, id, status);
        setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
        setSelectedContact((prev) => prev?.id === id ? { ...prev, status } : prev);
    };

    // Filter
    const filteredEscalations = escalations.filter((e) =>
        !search || e.userEmail?.toLowerCase().includes(search.toLowerCase()) || e.userName?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredContacts = contacts.filter((c) =>
        !search || c.email.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
    );

    const pendingEscalations = escalations.filter((e) => e.status === 'pending').length;
    const newContacts = contacts.filter((c) => c.status === 'new').length;

    const refreshButton = (
        <button
            onClick={fetchAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ border: '1px solid var(--theme-glass-border)', color: 'var(--theme-text)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Ανανέωση
        </button>
    );

    return (
        <AdminLayout title="Αιτήματα" headerRight={refreshButton}>
            {/* Error */}
            {error && (
                <div className="mb-5 p-4 rounded-xl text-sm" style={{ background: 'var(--theme-accent)/10', border: '1px solid var(--theme-accent)/30', color: 'var(--theme-text)' }}>
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
                {([
                    { tab: 'escalations' as Tab, label: 'Κλιμακώσεις AI', count: pendingEscalations, icon: <AlertTriangle className="w-4 h-4" /> },
                    { tab: 'contacts' as Tab, label: 'Φόρμα Επικοινωνίας', count: newContacts, icon: <Mail className="w-4 h-4" /> },
                ] as const).map(({ tab, label, count, icon }) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedEscalation(null); setSelectedContact(null); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: activeTab === tab ? 'linear-gradient(135deg, var(--theme-accent), var(--theme-accent-hover))' : 'var(--theme-glass-bg)',
                            color: activeTab === tab ? 'white' : 'var(--theme-text-muted)',
                            border: activeTab === tab ? 'none' : '1px solid var(--theme-glass-border)',
                        }}
                    >
                        {icon}
                        {label}
                        {count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'}`}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 3-column: list + detail */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* List panel */}
                <div
                    className="lg:col-span-1 rounded-xl overflow-hidden"
                    style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-glass-border)', backdropFilter: 'blur(20px)' }}
                >
                    <div className="p-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Αναζήτηση..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-transparent outline-none"
                                style={{
                                    border: '1px solid var(--theme-glass-border)',
                                    color: 'var(--theme-text)',
                                }}
                            />
                        </div>
                    </div>

                    <div className="divide-y max-h-[60vh] overflow-y-auto" style={{ borderColor: 'var(--theme-glass-border)' }}>
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-accent)]" />
                            </div>
                        ) : activeTab === 'escalations' ? (
                            filteredEscalations.length === 0 ? (
                                <div className="py-10 text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>Δεν υπάρχουν κλιμακώσεις.</div>
                            ) : filteredEscalations.map((esc) => (
                                <button
                                    key={esc.sessionId}
                                    onClick={() => setSelectedEscalation(esc)}
                                    className="w-full p-4 text-left transition-colors"
                                    style={{
                                        background: selectedEscalation?.sessionId === esc.sessionId ? 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' : 'transparent',
                                        borderLeft: selectedEscalation?.sessionId === esc.sessionId ? '3px solid var(--theme-accent)' : '3px solid transparent',
                                    }}
                                    onMouseEnter={(e) => { if (selectedEscalation?.sessionId !== esc.sessionId) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    onMouseLeave={(e) => { if (selectedEscalation?.sessionId !== esc.sessionId) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>
                                            {esc.userName || esc.userEmail || 'Ανώνυμος'}
                                        </span>
                                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-text-muted)' }} />
                                    </div>
                                    {esc.userEmail && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>{esc.userEmail}</p>}
                                    <div className="flex items-center gap-2 mt-2">
                                        <StatusBadge status={esc.status} type="escalation" />
                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                            <Clock className="w-3 h-3" />{formatTime(esc.escalatedAt)}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            filteredContacts.length === 0 ? (
                                <div className="py-10 text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>Δεν υπάρχουν μηνύματα.</div>
                            ) : filteredContacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className="w-full p-4 text-left transition-colors"
                                    style={{
                                        background: selectedContact?.id === contact.id ? 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' : 'transparent',
                                        borderLeft: selectedContact?.id === contact.id ? '3px solid var(--theme-accent)' : '3px solid transparent',
                                    }}
                                    onMouseEnter={(e) => { if (selectedContact?.id !== contact.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                    onMouseLeave={(e) => { if (selectedContact?.id !== contact.id) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>{contact.name}</span>
                                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-text-muted)' }} />
                                    </div>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--theme-text)' }}>{contact.subject || contact.message.slice(0, 40)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StatusBadge status={contact.status} type="contact" />
                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                            <Clock className="w-3 h-3" />{formatTime(contact.submittedAt)}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail panel */}
                <div
                    className="lg:col-span-2 rounded-xl overflow-hidden"
                    style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-glass-border)', backdropFilter: 'blur(20px)', minHeight: '400px' }}
                >
                    {activeTab === 'escalations' && selectedEscalation ? (
                        <EscalationDetail
                            chat={selectedEscalation}
                            onResolve={() => handleResolveEscalation(selectedEscalation.sessionId)}
                        />
                    ) : activeTab === 'contacts' && selectedContact ? (
                        <ContactDetail
                            contact={selectedContact}
                            onStatusChange={(status) => handleContactStatusChange(selectedContact.id, status)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
                            <Inbox className="w-12 h-12 mb-3 opacity-40" />
                            <p className="text-sm">Επιλέξτε ένα αίτημα για να δείτε τις λεπτομέρειες.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default function RequestsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]"><Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" /></div>}>
            <RequestsPageContent />
        </Suspense>
    );
}
```

**Step 2: Commit**
```bash
git add src/app/(main)/admin/requests/page.tsx
git commit -m "feat(admin): add Αιτήματα unified inbox — escalations + contact form submissions with tabbed interface"
```

---

## Task 14: Users and Settings stub pages

**Files:**
- Create: `src/app/(main)/admin/users/page.tsx`
- Create: `src/app/(main)/admin/settings/page.tsx`

**Step 1: Users stub**
```typescript
import { AdminLayout } from '@/components/admin';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
    return (
        <AdminLayout title="Χρήστες">
            <div
                className="rounded-2xl p-16 text-center"
                style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-glass-border)' }}
            >
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--theme-text-muted)' }} />
                <p className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Σύντομα διαθέσιμο</p>
                <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>Η διαχείριση χρηστών θα είναι διαθέσιμη σε επόμενη έκδοση.</p>
            </div>
        </AdminLayout>
    );
}
```

**Step 2: Settings stub**
```typescript
import { AdminLayout } from '@/components/admin';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <AdminLayout title="Ρυθμίσεις">
            <div
                className="rounded-2xl p-16 text-center"
                style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-glass-border)' }}
            >
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--theme-text-muted)' }} />
                <p className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Σύντομα διαθέσιμο</p>
                <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>Οι ρυθμίσεις θα είναι διαθέσιμες σε επόμενη έκδοση.</p>
            </div>
        </AdminLayout>
    );
}
```

**Step 3: Commit**
```bash
git add src/app/(main)/admin/users/page.tsx src/app/(main)/admin/settings/page.tsx
git commit -m "feat(admin): add Users and Settings stub pages — 'coming soon' placeholders"
```

---

## Task 15: Final verification

**Step 1: Build check**
```bash
cd aerofren-next
npm run build
# Must complete with 0 errors. Fix any TypeScript errors before proceeding.
```

**Step 2: Spot-check pages in browser**
- `/admin` — Dashboard loads, shows 5 stat cards, sidebar visible
- `/admin/chats` — Sessions list, message viewer, no more timestamp bug
- `/admin/requests` — Both tabs work, escalation/contact detail panels work
- `/admin/users` — Shows "Σύντομα διαθέσιμο"
- `/login` + `/signup` — Bell hidden (not logged in). ChatButton goes to /contact.
- Log in as admin → bell icon appears. Open bell → see notifications.
- Log in as non-admin → visit `/admin` → see access denied screen

**Step 3: Verify Firestore onSnapshot for regular users**
- Log in as a regular user who has an escalated chat
- Verify notification bell shows their escalation status

**Step 4: Final commit (if any cleanup)**
```bash
git add -p  # stage only intentional changes
git commit -m "fix: final cleanup after admin overhaul"
```

---

## Summary of all commits in this plan

1. `feat: merge lenis migration + auth refactor + admin refactor + ScrollAnimation P1 fix`
2. `feat(admin): add ContactSubmission type + fetch/update contact service functions`
3. `feat(api): add GET /api/admin/contacts — paginated contact submissions for admin`
4. `feat(api): add PATCH /api/admin/contacts/[id] — update contact submission status`
5. `feat(firestore): add security rules for escalatedChats user-scoped read access`
6. `feat(notifications): add NotificationContext — Firestore onSnapshot for users, 30s polling for admins`
7. `feat(ui): add NotificationBell component — bell icon with badge, dropdown, mark-read`
8. `feat(header): add real-time NotificationBell to header and wire NotificationProvider to main layout`
9. `feat(admin): add AdminAccessDenied component — single access denied UI for all admin pages`
10. `feat(admin): add AdminSidebar — nav with notification badges, user card, brand header`
11. `feat(admin): add AdminLayout component — shared auth guard + sidebar wrapper for all admin pages`
12. `refactor(admin): dashboard uses shared AdminLayout + adds todayChats stat card`
13. `refactor(admin): chats page uses shared AdminLayout; fix user message timestamp color`
14. `feat(admin): add Αιτήματα unified inbox — escalations + contact form submissions with tabbed interface`
15. `feat(admin): add Users and Settings stub pages — coming soon placeholders`
