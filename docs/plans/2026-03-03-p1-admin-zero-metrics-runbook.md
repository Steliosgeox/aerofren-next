# P1 Runbook: Admin Dashboard Zero Metrics

## Purpose
Operational checklist to validate and recover when admin dashboard metrics show zeros.

## 1) Capture evidence in one 15-minute window

1. Browser network while loading `/admin`:
- `GET /api/admin/stats` status + payload + `x-trace-id`
- `GET /api/admin/escalations` status + payload

2. Vercel function logs filtered by trace:
- `/api/chat`
- `/api/admin/stats`
- `/api/admin/escalations`

3. Firestore counts:
- `chatMessages`
- `chatSessions`
- `escalatedChats`
- `chatUsers`
- `sys_stats/global.uniqueUsersCount`

## 2) Classify incident

- Case A: `chatMessages > 0` and `chatSessions = 0`
  - Run backfill dry-run then apply.
- Case B: `chatMessages` and `chatSessions` both near zero despite traffic
  - Check `/api/chat` logs for `persisted=false` and `persistenceError`.
- Case C: `chatSessions > 0` but admin stats still zeros
  - Compare Firestore project in Vercel env with expected project.
- Case D: only unique users is zero
  - Verify `chatUsers` and `sys_stats/global`.

## 3) Backfill commands

Dry-run:

```bash
npm run backfill:chat-sessions
```

Apply:

```bash
npm run backfill:chat-sessions -- --apply
```

## 4) Drift monitoring command

```bash
npm run check:chat-session-drift
```

Optional stricter threshold:

```bash
npm run check:chat-session-drift -- --min-ratio=0.1
```

Exit code `2` means likely aggregate flatline and should page on-call.

