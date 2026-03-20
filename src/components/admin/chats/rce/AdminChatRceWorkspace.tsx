'use client';

import { useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAdminChatWorkspace } from '../useAdminChatWorkspace';
import { useAdminChatRceAdapter } from './useAdminChatRceAdapter';
import { AdminChatRceSidebar } from './AdminChatRceSidebar';
import { AdminChatRceThread } from './AdminChatRceThread';
import { AdminChatRceDetails } from './AdminChatRceDetails';
import './admin-chat-rce.css';

export function AdminChatRceWorkspace() {
    const composerRef = useRef<HTMLTextAreaElement>(null);
    const threadScrollerRef = useRef<HTMLDivElement>(null);
    const workspace = useAdminChatWorkspace({ composerRef, threadScrollerRef });
    const { chatListItems, messageListItems } = useAdminChatRceAdapter(workspace);

    return (
        <div className="h-screen pt-[100px] overflow-hidden flex flex-col admin-chat-rce admin-teams-theme">
            {/* ── Slim top bar (~48px) ─────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center gap-3 px-3 h-9 border-b border-white/[0.05] bg-white/[0.015]">
                <span className="text-[11px] font-semibold text-white/40 leading-none tracking-wide uppercase">
                    Συνομιλίες
                </span>

                {workspace.queueInsights.waitingOnAdmin > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[18px] px-1 py-0.5 rounded bg-[var(--theme-accent)]/15 border border-[var(--theme-accent)]/25 text-[var(--theme-accent)] text-[9px] font-bold">
                        {workspace.queueInsights.waitingOnAdmin}
                    </span>
                ) : null}

                <div className="flex-1" />

                <button
                    type="button"
                    aria-label="Ανανέωση"
                    title="Ανανέωση"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/[0.10] bg-white/[0.05] text-white/60 cursor-pointer transition-colors duration-150 hover:bg-white/[0.08] hover:text-white/80 disabled:opacity-40"
                    onClick={() => void workspace.refreshSessions()}
                    disabled={workspace.isLoadingSessions}
                >
                    <RefreshCw
                        size={14}
                        className={workspace.isLoadingSessions ? 'animate-spin' : ''}
                    />
                </button>
            </div>

            {/* ── Alerts ──────────────────────────────────────────────── */}
            {workspace.errorMessage ? (
                <div className="flex-shrink-0 mx-1 mt-1 px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/08 text-red-300 text-[11px]">
                    Σφάλμα: {workspace.errorMessage}
                </div>
            ) : null}

            {workspace.successMessage ? (
                <div className="flex-shrink-0 mx-1 mt-1 px-2.5 py-1.5 rounded-lg border border-green-500/20 bg-green-500/08 text-green-400 text-[11px]">
                    {workspace.successMessage}
                </div>
            ) : null}

            {/* ── Three-column layout ──────────────────────────────────── */}
            <div
                className={[
                    'flex-1 overflow-hidden grid gap-[1px] p-[3px]',
                    'grid-cols-[200px_minmax(0,1fr)_165px]',
                    'max-xl:grid-cols-[200px_minmax(0,1fr)]',
                    'max-lg:grid-cols-1 max-lg:p-1.5 max-lg:gap-1.5',
                ].join(' ')}
            >
                {/* Sidebar */}
                <aside
                    className={[
                        'h-full overflow-hidden flex flex-col rounded-xl bg-white/[0.03] border border-white/[0.06]',
                        workspace.selectedSessionId ? 'max-lg:hidden' : '',
                    ].filter(Boolean).join(' ')}
                    data-role="teams-surface"
                >
                    <AdminChatRceSidebar
                        workspace={workspace}
                        chatListItems={chatListItems}
                    />
                </aside>

                {/* Thread */}
                <section
                    className={[
                        'h-full overflow-hidden flex flex-col rounded-xl bg-white/[0.03] border border-white/[0.06]',
                        !workspace.selectedSessionId ? 'max-lg:hidden' : '',
                    ].filter(Boolean).join(' ')}
                    data-role="teams-surface"
                >
                    <AdminChatRceThread
                        workspace={workspace}
                        messageListItems={messageListItems}
                        composerRef={composerRef}
                        threadScrollerRef={threadScrollerRef}
                    />
                </section>

                {/* Details — hidden below xl */}
                <aside
                    className={[
                        'h-full overflow-hidden flex flex-col p-3 gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06]',
                        'max-xl:hidden',
                    ].join(' ')}
                    data-role="teams-surface"
                >
                    <AdminChatRceDetails workspace={workspace} />
                </aside>
            </div>
        </div>
    );
}
