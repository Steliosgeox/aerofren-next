# Admin Portal — Full Audit & Execution Plan (Architect Edition)
**Date:** 2026-03-03  
**Status:** Deep code-level audit (every file read line-by-line)

*Prepared for Senior Full-Stack Developer execution. This document serves as the master blueprint for completing, securing, and stabilizing the Admin Portal.*

---

## ✅ What Is Working (Do Not Touch)

| Feature | Status |
|---------|--------|
| Admin authentication (email whitelist fallback) | ✅ Working |
| Dashboard stats (total chats, today, escalations, unique users) | ✅ Working |
| Escalated chats table on dashboard | ✅ Working |
| Resolve escalation from dashboard | ✅ Working |
| Requests page — Escalations tab | ✅ Working |
| Requests page — Contact Form tab | ✅ Working |
| Contact status update (new → read → replied) | ✅ Working |
| Export chat to CSV | ✅ Working (when sessions load) |
| Firestore composite index for chats | ✅ FIXED (2026-03-03) |

---

## 🔴 CRITICAL PRODUCTION BUGS

### PROD-1: Stats API Downloads EVERY Document (Firestore Billing Bomb)
**Severity:** 🔴 CRITICAL  
**File:** `src/app/api/admin/stats/route.tsx` — Lines 84–113  
**Problem:** Two devastating full-collection scans:

1. **Line 84–100 (Zero-count fallback):** When `totalChats === 0` from the `chatSessions` count, the code falls back to `chatsRef.select('sessionId', 'userId').get()` — this downloads **EVERY SINGLE DOCUMENT** from the `chatMessages` collection. If you have 50,000 chat messages, that's 50,000 Firestore reads ON A SINGLE API CALL. This will cost real money.

2. **Line 102–112 (Unique users):** Even when `totalChats > 0`, the code runs `sessionsRef.select('userId').get()` — downloading ALL session documents just to count unique users via a `Set`. As the app grows, this gets exponentially slower and more expensive.

**Impact in production:** Every time the admin loads the dashboard, it triggers thousands of Firestore read operations. At scale, this will generate unexpected Firebase bills and slow the dashboard to a crawl.

**How to Fix:**
- Remove the zero-count fallback entirely (Lines 84–100). If `chatSessions` is empty, `totalChats` is `0`. Period.
- For `uniqueUsers`, add a `distinctUsers` counter field to a `sys_stats/global` aggregation document and maintain it via a Cloud Function or manual `runTransaction`, OR use Firestore's `count()` with a `collectionGroup` approach. As a quick fix, simply use `sessionsRef.where('userId', '!=', null).select().count().get()` — though this only gives total sessions, not distinct users. Best option: maintain a separate `uniqueUsersCount` in a stats doc.

---

### PROD-2: Escalations API Has NO Limit (Unbounded Growth)
**Severity:** 🔴 CRITICAL  
**File:** `src/app/api/admin/escalations/route.ts` — Line 49–52  
**Problem:** The query is:
```typescript
db.collection('escalatedChats').orderBy('escalatedAt', 'desc').get()
```
There is **NO `.limit()`**. This means after 6 months of operations, if 500 escalations have accumulated, every single dashboard load and every 30-second notification poll downloads ALL 500 documents. After a year, it could be thousands.

**Impact in production:** Progressively slower page loads, increasing Firestore costs, and eventually request timeouts.

**How to Fix:** Add `.limit(50)` to the query and implement cursor-based pagination (like the chats and contacts routes already do).

---

### PROD-3: Rate Limiter is Broken on Vercel (In-Memory on Serverless)
**Severity:** 🟠 HIGH  
**File:** `src/lib/rate-limit.ts`  
**Problem:** Two issues:

1. **Line 20 — `rateLimitStore` is a `Map` in module scope.** On Vercel, each serverless function invocation gets its own isolated memory. This `Map` resets to empty on every cold start, making rate limiting essentially non-functional. An attacker can bypass it by simply waiting for a cold start (seconds).

2. **Lines 23–31 — `setInterval` in module scope.** This creates a persistent timer that keeps the Node.js process alive, preventing Vercel from properly garbage-collecting the function. This is wasted compute.

**Impact in production:** Rate limiting doesn't work. Your admin APIs are essentially unprotected from brute-force or abuse.

**How to Fix:** Either:
- Accept the limitation and document it (current rate limiting is "best effort" for hot instances only), OR
- Migrate to **Upstash Redis** for distributed rate limiting (the comment on Line 5 already hints at this).

---

### PROD-4: UUID Validation Rejects Firestore IDs (3 Routes Affected!)
**Severity:** 🔴 CRITICAL  
**Files affected (all three use `z.string().uuid()`):**
1. `src/app/api/admin/escalations/resolve/route.ts` — Line 13
2. `src/app/(main)/api/chat/history/route.ts` — Line 56
3. `src/app/(main)/api/chat/escalate/route.ts` — Line 18

**Problem:**
```typescript
const resolveSchema = z.object({
    sessionId: z.string().uuid(),
});
```
This validates that `sessionId` must be a valid UUID (v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`). However, Firestore auto-generated document IDs are **20-character alphanumeric strings** (e.g., `abc123XYZ456def789gh`), NOT UUIDs. **IF** the chat system generates its own UUIDs for session IDs, this is fine and this is NOT a bug. **IF** it uses Firestore auto-generated IDs, then every "Resolve" button click and chat history load will return a 400 error.

> ⚠️ **Action for Senior Dev:** Verify in Firestore console whether `chatSessions` document IDs are UUIDs or Firestore auto-IDs. If they're UUIDs (e.g., `550e8400-e29b-41d4-a716-446655440000`), this is NOT a bug. If they're Firestore-style (e.g., `abc123XYZ456def789`), this is CRITICAL.

**How to Fix (if needed):** Change all three validations to:
```typescript
sessionId: z.string().min(1).max(128),
```

---

## 🟠 HIGH-PRIORITY BUGS  

### BUG-1: Contact Status Update Has No Error Handling
**File:** `src/app/(main)/admin/requests/page.tsx` — Lines 208–213  
**Problem:**
```typescript
const handleContactStatusChange = useCallback(async (id, status) => {
    if (!user) return;
    await updateContactStatus(user, id, status);  // ← No try/catch!
    setContacts((prev) => prev.map(...));  // ← Optimistic update
    setSelectedContact((prev) => ...);    // ← Optimistic update
}, [user]);
```
If the API call fails (network error, 500, etc.), the UI will still update locally. The admin sees "Replied" but the database still says "New". The states diverge silently.

**How to Fix:** Wrap in try/catch. Only update local state if the API succeeds. Show an error toast if it fails.

---

### BUG-2: CSV Export Breaks on Multi-Line Messages
**File:** `src/app/(main)/admin/chats/page.tsx` — Line 242  
**Problem:**
```typescript
return `"${timestamp}","${roleLabel(msg.role)}","${msg.content.replace(/"/g, '""')}","${msg.userEmail || "Ανώνυμος"}"`;
```
The code escapes double-quotes (`"` → `""`), which is correct CSV. But it does **not** escape newlines. If a user's chat message contains `\n` (which it will, since chat messages can be multi-line), the CSV row will split across multiple lines, corrupting the entire file.

**How to Fix:** Replace newlines before inserting:
```typescript
msg.content.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')
```

---

### BUG-3: Double API Calls on Admin Dashboard Load
**File:** `src/contexts/NotificationContext.tsx` + `src/app/(main)/admin/page.tsx`  
**Problem:** When an admin loads the dashboard:
1. `AdminPage` calls `fetchAdminStats(user)` + `fetchEscalations(user)` via `useEffect`
2. `NotificationContext` calls `pollAdmin()` immediately via `useEffect`, which also calls `fetchEscalations(user)` + `fetchContactSubmissionsPage(user)`

Both fire on mount simultaneously. This means `fetchEscalations` is called **TWICE** on every page load, doubling the Firestore reads unnecessarily.

**How to Fix:** Have `NotificationContext` skip its initial poll if the admin page has already fetched the data, or add a small delay (e.g., 5 seconds) before the first poll. Alternatively, share a SWR/react-query cache between them.

---

## 🟠 ARCHITECTURAL ISSUES (Previously Documented)

### ARCH-1: `proxy.ts` Doesn't Protect Admin Routes
**Severity:** HIGH  
**File:** `proxy.ts` (root)  
**Status:** Confirmed — proxy.ts only sets CSP headers. No auth check for `/admin/*` routes.
**Problem:** Unauthenticated users receive the full admin JS bundle. Protection is client-side only via `AdminLayout.tsx`.
**Fix:** Add auth check in `proxy.ts` for `/admin/*` paths.

### ARCH-2: Firebase Admin SDK Singleton (Already Improved)
**File:** `src/lib/firebase-admin.ts` — Lines 25–66  
**Status:** ✅ Already uses `getApps()` check (Line 30). The original race condition concern is mitigated. The code is structured correctly with the fallback at Line 30.

### ARCH-3: `isUserAdmin` Falls Back to Email Array
**File:** `src/lib/firebase-admin.ts` — Line 104–112  
**Status:** Working but suboptimal.
**Fix:** Set Firebase custom claim `admin: true` for the admin user, then remove the email fallback.

### ARCH-4: Fake In-Memory Stats Cache
**File:** `src/app/api/admin/stats/route.tsx` — Lines 15–16, 52–60  
**Status:** Broken on Vercel (cache resets on cold start). Not harmful, just useless code.
**Fix:** Remove the `cachedStats` logic entirely.

---

## 🟡 MISSING FEATURES

### MISSING-1: Users Page is a Stub
**Page:** `/admin/users`  
**Fix:** Create `GET /api/admin/users` using `admin.auth().listUsers()`. Build data table UI.

### MISSING-2: Settings Page is a Stub
**Page:** `/admin/settings`  
**Fix:** Display system health checks (Firebase status, SMTP status, maintenance mode toggle).

### MISSING-3: SMTP Configuration Missing
**Impact:** Contact form submissions don't trigger notification emails.
**Fix:** Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL` to Vercel env vars.

### MISSING-4: No Server-Side Chat Search
**Page:** `/admin/chats`  
**Problem:** Search only filters the locally loaded 50 sessions.
**Fix:** Add `?search=` query param to the chats API with Firestore `.where()`.

### MISSING-5: No Admin-Specific Error Boundary
**Files:** `src/app/(main)/admin/error.tsx` — does NOT exist.  
**Problem:** There's a root `src/app/error.tsx`, but no admin-specific one. If an admin React component crashes, the user sees the generic app error page without admin layout context.
**Fix:** Create `src/app/(main)/admin/error.tsx` with admin-themed error UI.

---

## 🟣 CODE QUALITY ISSUES

### QUALITY-1: `color-mix()` Still Used in Admin Pages
**Files:**
- `requests/page.tsx` — Lines 258, 336, 374
- `admin/page.tsx` — Line 135
**Problem:** `color-mix(in srgb, ...)` was supposed to be refactored to Tailwind. It has poor browser compatibility.
**Fix:** Replace with Tailwind `bg-[var(--theme-accent)]/30` opacity syntax.

### QUALITY-2: Inline `style={{}}` Throughout Admin Pages
**Files:** `AdminSidebar.tsx`, `requests/page.tsx`, `AdminAccessDenied.tsx`  
**Problem:** Heavy use of React `style={{ color: 'var(--theme-text)' }}` instead of Tailwind classes.
**Fix:** Replace with `text-[var(--theme-text)]` classes for consistency.

### QUALITY-3: Stats Route Uses `.tsx` Extension
**File:** `src/app/api/admin/stats/route.tsx`  
**Problem:** This is a pure API route with zero JSX. The `.tsx` extension is misleading.
**Fix:** Rename to `route.ts`.

### ✅ QUALITY-4: Duplicate Dead Code — ALREADY CLEANED
**Directory:** `src/app/(admin)/` — no longer exists.  
**Status:** ✅ Already removed. The only active admin routes are in `src/app/(main)/admin/`.

### QUALITY-5: `formatTime` Function Duplicated 3 Times
**Files:** `admin/page.tsx:75`, `admin/chats/page.tsx:219`, `admin/requests/page.tsx:42`  
**Problem:** Same Greek locale time formatter copy-pasted in three files.
**Fix:** Extract to `src/utils/format.ts` as a shared utility.

---

## 📋 PRIORITIZED EXECUTION ORDER

| # | ID | Issue | Effort | Impact |
|---|-----|-------|--------|--------|
| 1 | **PROD-4** | Fix Zod UUID validation → `z.string().min(1)` | 1 min | Resolve button is broken |
| 2 | **PROD-1** | Remove full-collection scan from stats API | 15 min | Firestore billing bomb |
| 3 | **PROD-2** | Add `.limit(50)` to escalations query | 2 min | Unbounded growth |
| 4 | **BUG-1** | Add try/catch to contact status update | 5 min | Silent data divergence |
| 5 | **BUG-2** | Escape newlines in CSV export | 2 min | Corrupted CSV files |
| 6 | **ARCH-1** | Add admin auth check in proxy.ts | 30 min | Leaking admin bundle |
| 7 | **BUG-3** | Deduplicate initial API calls | 10 min | Double Firestore reads |
| 8 | **MISSING-3** | Add SMTP env vars to Vercel | 5 min | Emails don't send |
| 9 | **ARCH-3** | Set Firebase admin custom claim | 5 min | Removes email fallback |
| 10 | **ARCH-4** | Delete useless in-memory cache | 2 min | Dead code |
| 11 | **PROD-3** | Document or fix rate-limiter | 30 min | Rate limiting broken |
| 12 | **MISSING-5** | Create admin error boundary | 10 min | Crash recovery UX |
| 13 | **QUALITY-1–5** | Refactor code quality issues | 30 min | Consistency |
| 14 | **MISSING-1** | Build Users page | 2 hrs | Feature complete |
| 15 | **MISSING-2** | Build Settings page | 1 hr | Feature complete |
| 16 | **MISSING-4** | Server-side chat search | 1 hr | Feature complete |
