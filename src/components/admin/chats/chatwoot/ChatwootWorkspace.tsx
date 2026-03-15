'use client';

import { useRef } from 'react';
import { useAdminChatWorkspace } from '../useAdminChatWorkspace';
import ChatwootNavSidebar from './ChatwootNavSidebar';
import ChatwootInboxPanel from './ChatwootInboxPanel';
import ChatwootThread from './ChatwootThread';
import { ChatwootContextPanel } from './ChatwootContextPanel';
import './chatwoot-workspace.css';

export function ChatwootWorkspace() {
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadScrollerRef = useRef<HTMLDivElement>(null);

  const workspace = useAdminChatWorkspace({ composerRef, threadScrollerRef });

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

      {/* Nav sidebar — 200px */}
      <ChatwootNavSidebar workspace={workspace} />

      {/* Inbox panel — 300px */}
      <ChatwootInboxPanel workspace={workspace} />

      {/* Thread — flex-1 */}
      <ChatwootThread
        workspace={workspace}
        composerRef={composerRef}
        threadScrollerRef={threadScrollerRef}
      />

      {/* Context panel — 260px */}
      <ChatwootContextPanel workspace={workspace} />
    </div>
  );
}
