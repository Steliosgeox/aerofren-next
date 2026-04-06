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

  // Panel closed by default — user opens via toggle button.
  // Prevents mobile overlay from appearing on load.
  const [showPanel, setShowPanel] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const workspace = useAdminChatWorkspace({ composerRef, threadScrollerRef });
  const hasSession = !!workspace.selectedSessionId;

  return (
    <div
      className="fixed inset-0 z-[100] flex max-lg:flex-col chatwoot-workspace overflow-hidden"
      style={{ background: 'var(--cw-bg-main)' }}
    >
      {/* ── Toasts ─────────────────────────────────────────────────── */}
      {workspace.errorMessage && (
        <div className="absolute top-4 max-lg:top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 z-[110] max-w-xs rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: '#ef4444' }}>
          {workspace.errorMessage}
        </div>
      )}
      {workspace.successMessage && (
        <div className="absolute top-4 max-lg:top-[calc(1rem+env(safe-area-inset-top,0px))] right-4 z-[110] max-w-xs rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg"
          style={{ background: 'var(--cw-accent)' }}>
          {workspace.successMessage}
        </div>
      )}

      {/* ── Nav sidebar backdrop — always in DOM, fades in/out ───── */}
      <div
        className={[
          'fixed inset-0 z-[101] lg:hidden bg-black/50 transition-opacity duration-300',
          mobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* ── Nav sidebar — desktop: inline, mobile: slide-from-left ─ */}
      <aside
        className={[
          'flex-shrink-0 h-full z-[102]',
          'max-lg:fixed max-lg:inset-y-0 max-lg:left-0',
          'max-lg:bg-[var(--cw-bg-sidebar)] cw-panel-safe',
          'max-lg:transform max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out',
          mobileNavOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        ].join(' ')}
      >
        <ChatwootNavSidebar
          workspace={workspace}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </aside>

      {/* ── Inbox panel — desktop: 300px, mobile: full-width ───── */}
      <div
        className={[
          'max-lg:flex-1 max-lg:w-full max-lg:min-h-0',
          hasSession ? 'max-lg:hidden' : '',
        ].filter(Boolean).join(' ')}
      >
        <ChatwootInboxPanel
          workspace={workspace}
          onOpenNav={() => setMobileNavOpen(true)}
        />
      </div>

      {/* ── Thread — desktop: flex-1, mobile: full-width ─────────── */}
      <div
        className={[
          'flex-1 min-w-0 max-lg:min-h-0',
          !hasSession ? 'max-lg:hidden' : '',
        ].filter(Boolean).join(' ')}
      >
        <ChatwootThread
          workspace={workspace}
          composerRef={composerRef}
          threadScrollerRef={threadScrollerRef}
          showContextPanel={showPanel}
          onToggleContextPanel={() => setShowPanel((p) => !p)}
          onBack={() => { workspace.clearSelection(); setShowPanel(false); }}
          onOpenNav={() => setMobileNavOpen(true)}
        />
      </div>

      {/* ── Context panel — Desktop: inline 320px column ─────────── */}
      {showPanel && (
        <div className="max-lg:hidden">
          <ChatwootContextPanel workspace={workspace} onClose={() => setShowPanel(false)} />
        </div>
      )}

      {/* ── Context panel — Mobile: slide-in overlay from right ──── */}
      {/* Always in DOM when session active for smooth slide animation */}
      {hasSession && (
        <>
          <div
            className={[
              'lg:hidden fixed inset-0 z-[103] bg-black/50 transition-opacity duration-300',
              showPanel ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')}
            onClick={() => setShowPanel(false)}
          />
          <div
            className={[
              'lg:hidden fixed inset-y-0 right-0 z-[104]',
              'w-[min(300px,90vw)] bg-[var(--cw-bg-panel)] cw-panel-safe',
              'transform transition-transform duration-300 ease-in-out',
              showPanel ? 'translate-x-0' : 'translate-x-full',
            ].join(' ')}
          >
            <ChatwootContextPanel workspace={workspace} onClose={() => setShowPanel(false)} />
          </div>
        </>
      )}
    </div>
  );
}
