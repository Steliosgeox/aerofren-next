'use client';

import { useRef, useState } from 'react';
import { useAdminChatWorkspace } from '../useAdminChatWorkspace';
import ChatwootNavSidebar from './ChatwootNavSidebar';
import ChatwootInboxPanel from './ChatwootInboxPanel';
import ChatwootThread from './ChatwootThread';
import { ChatwootContextPanel } from './ChatwootContextPanel';
import './chatwoot-workspace.css';

export function ChatwootWorkspace() {
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadScrollerRef = useRef<HTMLDivElement>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const workspace = useAdminChatWorkspace({ composerRef, threadScrollerRef });

  const hasSession = !!workspace.selectedSessionId;

  return (
    <div
      className="fixed inset-0 z-[100] flex chatwoot-workspace overflow-hidden"
      style={{ background: 'var(--cw-bg-main)' }}
    >
      {/* Error toast */}
      {workspace.errorMessage && (
        <div
          className="absolute top-4 right-4 z-[110] max-w-xs rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: '#ef4444' }}
        >
          {workspace.errorMessage}
        </div>
      )}

      {/* Success toast */}
      {workspace.successMessage && (
        <div
          className="absolute top-4 right-4 z-[110] max-w-xs rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: 'var(--cw-accent)' }}
        >
          {workspace.successMessage}
        </div>
      )}

      {/* ── Mobile nav overlay backdrop ────────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[101] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── Nav sidebar ────────────────────────────────────────────── */}
      {/* Desktop: inline 220px column. Mobile: slide-in overlay from left */}
      <aside
        className={[
          'flex-shrink-0 h-full z-[102]',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:transform max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out',
          mobileNavOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        ].join(' ')}
      >
        <ChatwootNavSidebar
          workspace={workspace}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </aside>

      {/* ── Inbox panel ────────────────────────────────────────────── */}
      {/* Desktop: 300px column. Mobile: full-width, hidden when session selected */}
      <div
        className={[
          'max-lg:flex-1 max-lg:w-full',
          hasSession ? 'max-lg:hidden' : '',
        ].filter(Boolean).join(' ')}
      >
        <ChatwootInboxPanel
          workspace={workspace}
          onOpenNav={() => setMobileNavOpen(true)}
        />
      </div>

      {/* ── Thread ─────────────────────────────────────────────────── */}
      {/* Desktop: flex-1. Mobile: full-width, hidden when no session */}
      <div
        className={[
          'flex-1 min-w-0',
          !hasSession ? 'max-lg:hidden' : '',
        ].filter(Boolean).join(' ')}
      >
        <ChatwootThread
          workspace={workspace}
          composerRef={composerRef}
          threadScrollerRef={threadScrollerRef}
          showContextPanel={showPanel}
          onToggleContextPanel={() => setShowPanel((p) => !p)}
          onBack={workspace.clearSelection}
          onOpenNav={() => setMobileNavOpen(true)}
        />
      </div>

      {/* ── Context panel ──────────────────────────────────────────── */}
      {showPanel && (
        <>
          {/* Desktop: inline 320px column */}
          <div className="max-lg:hidden">
            <ChatwootContextPanel workspace={workspace} onClose={() => setShowPanel(false)} />
          </div>

          {/* Mobile: slide-in overlay from right */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[101]"
            onClick={() => setShowPanel(false)}
          />
          <div className="lg:hidden fixed inset-y-0 right-0 z-[102] w-[min(320px,85vw)] transform transition-transform duration-300 ease-in-out">
            <ChatwootContextPanel workspace={workspace} onClose={() => setShowPanel(false)} />
          </div>
        </>
      )}
    </div>
  );
}
