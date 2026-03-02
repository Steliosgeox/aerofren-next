# Admin Portal Overhaul — Design Document
**Date:** 2026-03-02
**Branch:** master (after merging feat/lenis-migration)
**Status:** Approved by user

---

## Problem Statement

The admin portal is visually generic ("AI slop"), has dead sidebar links (Αιτήματα, Χρήστες, Ρυθμίσεις), no real-time notifications, and duplicates auth-guard logic across every page. Users also have no feedback when their AI chat escalation is resolved.

---

## Goals

1. **Perfection, not polish** — maintainable code that never breaks
2. **Real-time notifications** — admins see new escalations/contacts instantly; users see their status changes
3. **Αιτήματα page** — unified inbox for AI escalations + contact form submissions
4. **Shared admin layout** — no duplicated auth-guard or sidebar code
5. **Visual alignment** — glass aesthetic matching the main site brand

---

## Git Strategy

1. Merge `feat/lenis-migration` → `master` (includes: Lenis migration, ScrollAnimation P1 fix, auth refactor)
2. Delete the `lenis-migration` worktree
3. All new admin work goes directly on `master`

---

## Architecture

### New File Structure

```
src/
├── contexts/
│   └── NotificationContext.tsx       [NEW] Firestore onSnapshot subscriptions
├── components/
│   ├── NotificationBell.tsx          [NEW] Bell icon + badge + dropdown in header
│   ├── Header.tsx                    [MODIFIED] Add <NotificationBell />
│   └── admin/
│       ├── AdminLayout.tsx           [NEW] Shared sidebar + auth guard wrapper
│       ├── AdminSidebar.tsx          [NEW] Sidebar with notification badges
│       └── AdminAccessDenied.tsx     [NEW] Single access-denied component
└── app/(main)/
    ├── layout.tsx                    [MODIFIED] Add <NotificationProvider>
    └── admin/
        ├── page.tsx                  [REFACTORED] Uses AdminLayout
        ├── chats/page.tsx            [REFACTORED] Uses AdminLayout
        └── requests/page.tsx         [NEW] Unified inbox

src/app/api/admin/
└── contacts/
    ├── route.ts                      [NEW] GET /api/admin/contacts
    └── [id]/route.ts                 [NEW] PATCH /api/admin/contacts/[id]

firestore.rules                       [MODIFIED] Read access for client-side subscriptions
```

---

## Section 1 — Notification System

### Approach: Firestore `onSnapshot` (real-time)

**`NotificationContext`** subscribes on mount for authenticated users:

| Subscriber | Collection | Filter | Trigger |
|---|---|---|---|
| Admin | `escalatedChats` | `status` IN `['pending', 'in_progress']` | New escalation or status change |
| Admin | `contactSubmissions` | `status == 'new'` | New contact form submission |
| Regular user | `escalatedChats` | `userId == user.uid` | Their escalation resolved |

**Notification shape:**
```typescript
interface Notification {
  id: string;
  type: 'escalation' | 'contact' | 'escalation_resolved';
  title: string;       // e.g. "Νέα κλιμάκωση"
  body: string;        // e.g. "Ο χρήστης user@example.com ζητά βοήθεια"
  timestamp: Date;
  href: string;        // Deep link to /admin/requests or /admin/chats?session=X
  isRead: boolean;     // Persisted in localStorage keyed by user.uid
}
```

**`NotificationBell` component:**
- Positioned in Header between LiquidGlassSwitcher and user avatar
- Visible only when `user` is authenticated
- Badge: teal dot with count, animated pulse when `unreadCount > 0`
- Dropdown: last 10 notifications, "Mark all read" button at top
- Each item: icon + title + body (truncated) + relative timestamp ("2λεπτά πριν")
- Admin notifications link to `/admin/requests` or `/admin/chats?session=X`
- User notifications show "Η κλιμάκωσή σας ολοκληρώθηκε" with link to their chat

**Read state:** `localStorage` key `notifications:read:{userId}` — Set of notification IDs. Cleared when user signs out. Good enough for v1; Firestore persistence can be added later.

**Firestore security rules additions:**
```
match /escalatedChats/{docId} {
  allow read: if isAdmin() || resource.data.userId == request.auth.uid;
}
match /contactSubmissions/{docId} {
  allow read: if isAdmin();
  allow write: if false; // writes only via admin SDK
}
```

---

## Section 2 — Shared Admin Layout

### `AdminLayout` component

All admin pages use this wrapper. It handles:
- Auth loading state (spinner)
- Access denied state (`AdminAccessDenied`)
- Sidebar rendering
- Mobile hamburger
- Page title

```tsx
// Usage in each page:
export default function SomePage() {
  return (
    <AdminLayout title="Page Title">
      {/* page content only, no auth logic */}
    </AdminLayout>
  );
}
```

### `AdminSidebar` nav items

| Label | Icon | Route | Badge source |
|---|---|---|---|
| Σύνοψη | TrendingUp | /admin | — |
| Συνομιλίες AI | Bot | /admin/chats | pending escalations count |
| Αιτήματα | Inbox | /admin/requests | escalations + new contacts count |
| Χρήστες | Users | /admin/users | — |
| Ρυθμίσεις | Settings | /admin/settings | — |

Sidebar reads `unreadCount` from `NotificationContext` to show badges.

### Visual improvements
- Section label "ΠΛΟΗΓΗΣΗ" above nav items
- Active item: left border accent + gradient background
- User card at sidebar top: avatar + name + "Διαχειριστής" shield badge
- Dashboard adds 5th stat card: "Σήμερα" using `todayChats` from existing API
- **Bug fix:** chat viewer timestamp color on user messages (currently `text-[var(--theme-accent)]` on accent background — invisible). Fix to `text-white/70`.

---

## Section 3 — Αιτήματα (Requests) Page

**Route:** `/admin/requests`

**Layout:** Same 3-column split as the Chats page.
- Left panel: tabbed inbox list (1/3 width)
- Right panel: detail view (2/3 width)

### Tab 1: Κλιμακώσεις AI

**Data source:** `/api/admin/escalations` (existing) + Firestore `onSnapshot` for real-time updates

**List item shows:** user name, email (truncated), timestamp, status badge

**Detail panel shows:**
- User info (name, email, userId)
- Escalation timestamp
- Link button → opens `/admin/chats?session=X` in same tab
- Status dropdown: Σε αναμονή / Σε εξέλιξη / Ολοκληρώθηκε
- "Επίλυση" button (marks as resolved)

### Tab 2: Φόρμα Επικοινωνίας

**Data source:** New `GET /api/admin/contacts`

**List item shows:** sender name, subject (or truncated message), timestamp, status badge

**Detail panel shows:**
- Full contact info: name, email, phone, company, subject
- Full message text
- Status: Νέο / Διαβάστηκε / Απαντήθηκε
- "Απάντηση" button → `mailto:email?subject=Re: {subject}` (opens email client)
- Status auto-updates to "Διαβάστηκε" when detail panel opens

### New API routes

**`GET /api/admin/contacts`**
```
Auth: Bearer token (same as other admin routes)
Query params: cursor (optional), limit (default 50)
Response: { contacts: ContactSubmission[], nextCursor: string | null }
```

**`PATCH /api/admin/contacts/[id]`**
```
Auth: Bearer token
Body: { status: 'new' | 'read' | 'replied' }
Response: { success: true }
```

### Contact status labels (Greek)
- `new` → "Νέο" (amber badge)
- `read` → "Διαβάστηκε" (blue badge)
- `replied` → "Απαντήθηκε" (green badge)

---

## Section 4 — Regular User Notifications

When a user's escalation changes to `resolved`, they get a notification in the bell:
- Title: "Αίτημα επιλύθηκε"
- Body: "Ένας εκπρόσωπος ολοκλήρωσε το αίτημά σας."
- href: links to `/` (home — users don't have a chat history page yet)

This is read-only data (user can only read their own escalatedChats by userId).

---

## Code Quality Rules

1. **No duplicate auth-guard logic** — AdminLayout owns it, pages are dumb
2. **No inline styles** — all Tailwind or CSS vars
3. **No dead `#` links** — either route exists or item is `disabled` with coming-soon tooltip
4. **Typed API responses** — all admin services use typed interfaces from `src/services/admin.ts`
5. **Error boundaries** — API failures show inline error banners, not broken layouts
6. **Single source of truth for status labels** — one const object per type, imported everywhere

---

## Out of Scope (v1)

- Χρήστες and Ρυθμίσεις pages (sidebar items present, routes show stub "Σύντομα διαθέσιμο")
- Email notifications (separate system, outside this scope)
- Push notifications (browser push API)
- Admin-to-user reply via in-app chat
