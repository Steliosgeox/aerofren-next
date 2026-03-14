# Admin Chat Upstream Clone Plan

Status: Rewritten after full repository audit  
Date: 2026-03-14  
Scope: `src/app/(main)/admin/chats/page.tsx` and the admin chat workspace only  
Primary goal: replace the current custom admin chat UI with an upstream-first `react-chat-elements` integration without rewriting the backend or the realtime logic

## 1. Read This First

The previous draft was not strict enough for the actual mandate.

It treated `react-chat-elements` like a theme reference and proposed an iMessage-style rebuild. That is not what we want.

This plan changes the direction to this:

1. We do not hand-recreate the upstream UI in Tailwind.
2. We do not build an "inspired by" shell first.
3. We use the upstream `react-chat-elements` components and CSS directly.
4. We keep our existing admin chat logic and Firestore flows.
5. We scope the work to `/admin/chats` only.

If the npm package works cleanly in this React 19 / Next 16 app, we use the package.  
If the package fails because of peer/runtime issues, we vendor an exact upstream snapshot and keep all custom code outside that vendor copy.

That is the closest practical interpretation of "clone the repo and hook our things later" without lying about what the upstream repository actually is.

## 2. What I Audited In This Repository

### Current admin chat entry points

- `src/app/(main)/admin/chats/page.tsx`
  - Suspense wrapper plus `AdminPageGuard`
  - clean route-level swap point
- `src/lib/layout/route-chrome.ts`
  - `/admin/chats` already hides the global header and footer

### Current admin chat UI

- `src/components/admin/chats/AdminTeamsWorkspace.tsx`
  - current monolithic presentation layer
  - owns the route shell, the inbox UI, the thread UI, the detail drawer, the composer, and mobile action sheets
  - visually over-customized and expensive to keep polishing

### Current admin chat logic that must stay

- `src/components/admin/chats/useAdminChatWorkspace.ts`
  - source of truth for the admin chat screen
  - realtime inbox listeners
  - realtime thread listeners
  - paged session fetch
  - older-message paging
  - draft persistence
  - mark-as-read behavior
  - status changes
  - reply sending
  - copy/export helpers
  - scroll state
- `src/lib/admin-chat/workspace.ts`
  - formatting, grouping, merge helpers, status mapping, session row shaping
- `src/services/admin.ts`
  - admin chat API client contract
- `src/services/chat.ts`
  - chat history/session contract
- `src/app/api/admin/chats/**/*.ts`
  - backend contract we should preserve during the UI cutover

### Existing route behaviors that must not regress

- queue tabs: `open`, `waiting_on_admin`, `in_progress`, `resolved`, `all`
- search with debounce
- URL-driven thread selection via `?session=...`
- live inbox refresh from Firestore
- live thread refresh from Firestore
- older history paging
- jump-to-latest / detached-thread affordance
- per-session reply drafts in `localStorage`
- anonymous sessions remain read-only
- resolved sessions block reply until reopened
- copy email / copy session ID
- export thread to CSV
- mobile action sheet and mobile queue/thread split

## 3. What The Upstream Repository Actually Is

Target upstream:

- GitHub repo: `https://github.com/Detaysoft/react-chat-elements`
- npm package: `react-chat-elements`

Important reality:

1. The upstream repo is a component library, not a ready-made admin chat application.
2. The repo has a `src/` library and an `example/` showcase app.
3. The example app demonstrates components; it is not a production chat workspace we can mount as-is.

Relevant upstream pieces for this admin-only migration:

- `ChatList`
- `ChatItem`
- `MessageList`
- `MessageBox`
- `SystemMessage`
- `Input`
- `Button`
- `Avatar`
- optionally `Navbar` / `SideBar` if they fit the route shell

Upstream components we do not need in phase 1:

- meeting/call surfaces
- media/file/location message types unless the current admin chat actually supports them
- generic popups/dropdowns that do not map to current admin actions

## 4. Hard Constraints We Must Respect

### Local app constraints

- Next.js `16.1.1`
- React `19.2.3`
- App Router
- global CSS enters through `src/app/layout.tsx` / `src/app/globals.css`
- route already uses a custom admin theme override via `.admin-teams-theme`

### Upstream constraints

- latest package line found during audit: `12.0.18`
- open upstream issue exists for React 19 support (`Detaysoft/react-chat-elements` issue `#230`)

That means stage 0 must be a real compatibility gate, not a fake checkbox.

### Non-negotiable implementation rules

1. Do not rewrite `ChatList`, `MessageList`, or `Input` as local clones.
2. Do not fork admin chat state into a second hook.
3. Do not mix backend workflow changes into the first UI cutover unless a blocker is found.
4. Do not ship the first pass as an iMessage re-theme.
5. Do not modify vendored upstream files except when syncing from upstream.

## 5. Implementation Strategy

### Definition of "exact clone" for this codebase

Because the upstream repository is a library and not a turnkey admin app, "exact clone" in this repo means:

1. Upstream component source or package is used directly.
2. Upstream stylesheet is loaded directly.
3. Any Aerofren-specific code lives in adapter and shell files only.
4. Business logic stays in `useAdminChatWorkspace`.
5. Styling overrides are route-scoped and minimal in phase 1.

### What stays

- `useAdminChatWorkspace`
- `src/lib/admin-chat/workspace.ts`
- `src/services/admin.ts`
- `src/services/chat.ts`
- existing admin API routes

### What gets replaced

- most of `AdminTeamsWorkspace.tsx`
- current custom inbox list UI
- current custom message bubble UI
- current custom composer shell

### What remains custom because upstream does not provide it

- queue tabs
- top search bar
- admin status actions (`resolve`, `reopen`, `in_progress`)
- detail drawer / metadata panel
- CSV export and copy actions
- mobile route behavior

The chat surface becomes upstream.  
The business controls around it remain local.

## 6. Proposed File Structure

Keep the current workspace available as legacy until cutover is complete.

```text
src/components/admin/chats/
  AdminTeamsWorkspace.tsx                # legacy until final cleanup
  useAdminChatWorkspace.ts               # keep as logic source of truth
  index.ts
  rce/
    AdminChatRceWorkspace.tsx            # new route shell
    AdminChatRceSidebar.tsx              # queue + search + tabs + ChatList
    AdminChatRceThread.tsx               # header + MessageList + Input
    AdminChatRceDetails.tsx              # detail drawer/panel
    AdminChatRceActions.tsx              # resolve/reopen/export/copy actions
    useAdminChatRceAdapter.ts            # maps workspace data to upstream props
    admin-chat-rce.css                   # route-scoped overrides only
    index.ts
```

Optional vendor fallback if package compatibility fails:

```text
src/vendor/react-chat-elements/
  ...exact upstream snapshot...
```

## 7. Stage Plan

### Stage 0 - Compatibility Gate And Source Pinning

Goal: prove we can actually run upstream code in this app before touching the current admin workspace.

### Tasks

1. Try package-first integration with `react-chat-elements`.
2. Load the upstream CSS through the app-level stylesheet path, not inside a leaf component.
3. Render a minimal smoke-test surface using:
   - one `ChatList`
   - one `MessageList`
   - one `Input`
4. Verify:
   - no install dead-end from peer deps
   - no runtime crash in React 19
   - no hydration mismatch in Next App Router
   - no obvious stylesheet collision with global app CSS
5. If package path fails:
   - vendor the upstream source snapshot
   - pin the exact upstream commit in the doc
   - keep the vendor folder read-only except for upstream syncs

### Files touched in this stage

- `package.json` if the package path works
- `src/app/layout.tsx` or `src/app/globals.css` for stylesheet intake
- temporary smoke-test component under `src/components/admin/chats/rce/`

### Exit criteria

- upstream components render in this app
- CSS is loading predictably
- we have a final source decision:
  - package path
  - or vendored upstream snapshot

### Stage 1 - Safe Shell And Rollout Switch

Goal: create the new workspace behind a reversible switch without deleting the legacy UI.

### Tasks

1. Keep `AdminTeamsWorkspace.tsx` intact as the fallback.
2. Add `AdminChatRceWorkspace.tsx` as the new implementation root.
3. Switch the export path in `src/components/admin/chats/index.ts` to a wrapper that can choose:
   - legacy UI
   - RCE UI
4. Use a simple feature flag for rollout:
   - env flag
   - or query flag
   - or temporary hardcoded boolean during development
5. Keep `src/app/(main)/admin/chats/page.tsx` unchanged if possible so route ownership remains simple.

### Recommendation

Do not swap the route entry file immediately.  
Swap the component exported from the chat feature module instead.

### Exit criteria

- both legacy and RCE workspaces can be rendered
- rollback is one line, not a rescue refactor

### Stage 2 - Adapter Layer, No Logic Fork

Goal: map existing workspace state into upstream component props without duplicating business logic.

### New hook

- `useAdminChatRceAdapter.ts`

### Inputs

- the entire object returned by `useAdminChatWorkspace`

### Outputs

- `chatListItems`
- `messageListItems`
- `composerProps`
- `headerProps`
- `detailsProps`
- `actionProps`

### Required mappings

#### Sessions -> `ChatList`

| Local source | Upstream target |
| --- | --- |
| `sessionRows[].name` | `title` |
| `sessionRows[].preview` | `subtitle` |
| `sessionRows[].timestampLabel` | `dateString` or `date` |
| `sessionRows[].avatarUrl` | `avatar` |
| `sessionRows[].unreadCount` | `unread` |
| `sessionRows[].isSelected` | `active` styling / selected row state |
| `sessionRows[].statusTone` | `statusColor` |
| `sessionRows[].statusLabel` | `statusText` or local metadata row |
| `workspace.selectSession(sessionId)` | item `onClick` |

#### Messages -> `MessageList`

Use existing `groupedMessages`, not raw `messages`, so we preserve day separators.

| Local source | Upstream target |
| --- | --- |
| `GroupedMessageDayEntry` | `type: 'system'` item |
| `message.role === 'admin'` | `position: 'right'` |
| `message.role === 'user'` | `position: 'left'` |
| `message.role === 'assistant'` | `position: 'left'` |
| `message.content` | `text` |
| `message.senderLabel` | `title` |
| `message.timestamp` | `date` / `dateString` |

#### Composer -> `Input`

| Local source | Upstream target |
| --- | --- |
| `replyDraft` | `value` |
| `setReplyDraft` | `onChange` |
| `handleReplySubmit` | send action |
| `isSendingReply` | disabled/loading state |
| `canReply` | enable/disable composer |

### Important integration detail

`useAdminChatWorkspace` currently depends on:

- `composerRef`
- `threadScrollerRef`

The RCE integration must prove we can wire those to upstream components:

- `MessageList` needs to expose or accept a scroll reference that the hook can use
- `Input` needs to expose the underlying input/textarea ref so `focusComposer()` still works

If upstream ref wiring is awkward, fix the wrapper layer first.  
Do not rewrite the hook into a second state machine.

### Exit criteria

- adapter produces all upstream-facing props
- no duplicate fetching logic exists
- old backend contracts remain untouched

### Stage 3 - Inbox Clone With `ChatList`

Goal: replace the custom left-column inbox while preserving queue semantics.

### Keep local

- queue tabs
- search bar
- refresh button
- session counts and queue summary

### Replace with upstream

- the actual session list rows

### Tasks

1. Create `AdminChatRceSidebar.tsx`.
2. Keep the current queue/status model from `useAdminChatWorkspace`.
3. Feed `chatListItems` into `ChatList`.
4. Preserve:
   - selected session highlight
   - unread badges
   - person-first identity
   - live row updates from realtime listeners
5. Handle session pagination:
   - either a local "load more" control under the list
   - or wrapper scroll detection that calls `fetchSessions({ append: true, cursor })`

### Rule

The queue model remains ours.  
The list rows become upstream.

### Exit criteria

- left pane uses `ChatList`
- tabs/search/selection still work
- pagination still works

### Stage 4 - Thread Clone With `MessageList` And `Input`

Goal: replace the custom thread transcript and composer with upstream components.

### Tasks

1. Create `AdminChatRceThread.tsx`.
2. Render `MessageList` using adapter output.
3. Preserve detached-thread behavior:
   - if admin is near bottom, new messages pin to bottom
   - if admin is scrolled up, do not hijack scroll
4. Map `hasDetachedThreadMessages` to the upstream down-button behavior.
5. Use `MessageList` scroll events to:
   - keep `handleThreadScroll` behavior
   - fetch older messages when the list reaches the top
6. Replace the current textarea shell with RCE `Input`.
7. Preserve quick replies above the input as local UI because that is an admin workflow, not an upstream chat primitive.
8. Preserve read-only states:
   - anonymous thread
   - resolved thread
   - non-escalated thread

### Composer rule set

Phase 1 behavior:

- no custom glass composer
- no oversized bottom tray
- use upstream `Input`
- local quick-reply chips may remain above it

### Exit criteria

- thread transcript uses upstream message components
- older message paging still works
- reply send still works
- jump-to-latest still works

### Stage 5 - Header, Status Actions, And Details Panel

Goal: keep the admin-operational controls without diluting the upstream chat surface.

### Keep local

- thread header identity block
- status controls
- export/copy actions
- details drawer/panel

### Tasks

1. Move action logic into `AdminChatRceActions.tsx`.
2. Keep existing behavior:
   - `handleStatusChange('in_progress')`
   - `handleStatusChange('resolved')`
   - `handleStatusChange('pending')`
   - `handleCopy(...)`
   - `exportToCSV()`
3. Keep person-first header order:
   - user name
   - email
   - status
   - waiting-on state
   - session ID in details, not as primary identity
4. Rebuild the details panel as a thin companion surface.

### Design rule

Do not pour the existing dark-glass dashboard style over the new chat surface.

The control layer may remain local.  
The message UI must stay recognizably upstream.

### Exit criteria

- operational controls are still available
- the thread surface no longer looks like the current custom dashboard

### Stage 6 - Mobile Behavior And Route Integration

Goal: keep the admin route usable on mobile without forcing the desktop split layout.

### Tasks

1. Preserve inbox-first mobile flow.
2. Preserve thread selection via URL query param.
3. Preserve back-to-queue affordance.
4. Keep secondary actions in a mobile sheet/drawer.
5. Ensure upstream components fit inside:
   - narrow viewport widths
   - safe-area bottom spacing
   - keyboard-open states

### Mobile rule

Do not attempt to make the desktop 3-column layout "shrink".  
Use a simple queue -> thread progression on small screens.

### Exit criteria

- mobile triage is still usable
- thread remains readable and sendable on mobile

### Stage 7 - Route-Scoped Styling Only

Goal: apply only the minimum styling necessary to integrate upstream UI into this app.

### File

- `src/components/admin/chats/rce/admin-chat-rce.css`

### Allowed in phase 1

- route container sizing
- panel widths
- font alignment with the app
- spacing fixes
- selected state contrast improvements
- status accent colors
- override conflicts caused by app-wide scrollbars or theme variables

### Explicitly not allowed in phase 1

- full iMessage restyle
- custom bubble geometry rewrite
- aggressive dark-glass reskin
- reimplementing upstream visuals with Tailwind utilities

### Styling rule

Upstream default first.  
Aerofren adjustments second.  
Heavy brand restyling only after parity sign-off.

### Exit criteria

- the route looks integrated
- the route still looks like `react-chat-elements`, not a custom clone of a clone

### Stage 8 - QA, Tests, And Cutover

Goal: switch to the new workspace only after behavior parity is proven.

### Unit and contract coverage to add

1. `src/__tests__/adminChat/`
   - adapter tests for `useAdminChatRceAdapter`
   - mapping tests for sessions -> `ChatList`
   - mapping tests for grouped messages -> `MessageList`
2. keep existing helper tests in:
   - `src/__tests__/adminChat/workspaceHelpers.test.ts`
3. keep route-chrome coverage in:
   - `src/__tests__/adminChat/routeChrome.test.ts`
4. add render tests for:
   - selected session
   - read-only anonymous thread
   - resolved thread
   - detached-thread down button

### Manual QA checklist

1. Open `/admin/chats` with no selected session.
2. Select a live thread from the queue.
3. Confirm realtime messages appear without refresh.
4. Scroll upward and verify new messages do not hijack scroll.
5. Use jump-to-latest and confirm it lands correctly.
6. Load older messages and confirm no layout jump.
7. Send a reply and confirm draft clears.
8. Reopen a resolved thread and confirm composer becomes active again.
9. Open an anonymous session and confirm read-only state.
10. Use mobile layout and confirm queue/thread flow still works.

### Cutover steps

1. switch feature flag default to RCE
2. leave legacy workspace available for one release window
3. remove legacy only after QA and production soak are clean

## 8. Files Most Likely To Change

### Add

- `src/components/admin/chats/rce/AdminChatRceWorkspace.tsx`
- `src/components/admin/chats/rce/AdminChatRceSidebar.tsx`
- `src/components/admin/chats/rce/AdminChatRceThread.tsx`
- `src/components/admin/chats/rce/AdminChatRceDetails.tsx`
- `src/components/admin/chats/rce/AdminChatRceActions.tsx`
- `src/components/admin/chats/rce/useAdminChatRceAdapter.ts`
- `src/components/admin/chats/rce/admin-chat-rce.css`
- adapter-focused tests under `src/__tests__/adminChat/`

### Edit

- `package.json`
- `src/app/layout.tsx` and/or `src/app/globals.css`
- `src/components/admin/chats/index.ts`
- possibly `src/components/admin/chats/useAdminChatWorkspace.ts` only if ref plumbing requires a small contract extension
- possibly `src/components/admin/chats/AdminTeamsWorkspace.tsx` only to preserve it as legacy or rename usage

### Avoid editing unless a blocker appears

- `src/services/admin.ts`
- `src/services/chat.ts`
- `src/lib/admin-chat/workspace.ts`
- `src/app/api/admin/chats/**/*.ts`

## 9. Risks And Mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| React 19 compatibility gap | upstream support is not fully settled | stage 0 package spike, vendor fallback |
| Global CSS collision | upstream stylesheet is global | import once at app level, keep overrides route-scoped |
| Ref mismatch with `MessageList` / `Input` | current hook depends on DOM refs | solve ref plumbing in wrapper, do not fork hook logic |
| Scroll regressions | current thread behavior is stateful and non-trivial | preserve hook scroll logic and verify with real threads |
| Over-customization | easy to drift back into current dashboard fatigue | limit phase 1 CSS to integration fixes only |
| Cutover risk | current screen is still the production route | use a reversible feature flag and keep legacy one release window |

## 10. Final Delivery Standard

This migration is complete only when all of the following are true:

1. `/admin/chats` uses upstream `react-chat-elements` for the inbox rows, transcript, and composer.
2. `useAdminChatWorkspace` remains the single business-logic source of truth.
3. Realtime inbox and thread behavior still work.
4. Older message paging still works.
5. Read-only and resolved-thread states still work.
6. Search, tabs, and URL session selection still work.
7. Mobile triage still works.
8. The route no longer looks like a custom dark-glass dashboard.
9. The result is recognizably upstream-first, not a fresh local rebuild.

## 11. Recommended Execution Order

If I were implementing this next, I would do it in exactly this order:

1. Stage 0 compatibility gate
2. Stage 1 rollout switch
3. Stage 2 adapter hook
4. Stage 3 inbox with `ChatList`
5. Stage 4 thread with `MessageList` and `Input`
6. Stage 5 actions/details
7. Stage 6 mobile cleanup
8. Stage 7 route-scoped CSS pass
9. Stage 8 QA and cutover

That order keeps the risky work in small, reversible slices.

## 12. Source Notes

External sources used for this plan:

- GitHub repo: `https://github.com/Detaysoft/react-chat-elements`
- example app folder: `https://github.com/Detaysoft/react-chat-elements/tree/master/example`
- package listing: `https://www.npmjs.com/package/react-chat-elements`
- docs examples:
  - `https://detaysoft.github.io/docs-react-chat-elements/docs/chatlist/`
  - `https://detaysoft.github.io/docs-react-chat-elements/docs/messagelist/`
  - `https://detaysoft.github.io/docs-react-chat-elements/docs/input/`
- React 19 support issue:
  - `https://github.com/Detaysoft/react-chat-elements/issues/230`
