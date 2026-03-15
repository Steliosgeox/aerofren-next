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
            <div className="flex-shrink-0 flex items-center gap-3 px-4 h-12 border-b border-white/[0.07] bg-white/[0.03]">
                <span className="text-sm font-semibold text-[var(--theme-text)] leading-none">
                    Συνομιλίες
                </span>

                {workspace.queueInsights.waitingOnAdmin > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded-full bg-[var(--theme-accent)]/20 border border-[var(--theme-accent)]/30 text-[var(--theme-accent)] text-[10px] font-bold">
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
                <div className="flex-shrink-0 mx-2 mt-2 px-3 py-2 rounded-[12px] border border-red-500/20 bg-red-500/10 text-red-300 text-xs">
                    Σφάλμα: {workspace.errorMessage}
                </div>
            ) : null}

            {workspace.successMessage ? (
                <div className="flex-shrink-0 mx-2 mt-2 px-3 py-2 rounded-[12px] border border-green-500/20 bg-green-500/10 text-green-400 text-xs">
                    {workspace.successMessage}
                </div>
            ) : null}

            {/* ── Three-column layout ──────────────────────────────────── */}
            <div
                className={[
                    'flex-1 overflow-hidden grid gap-2 p-2',
                    'grid-cols-[260px_minmax(0,1fr)_220px]',
                    'max-xl:grid-cols-[240px_minmax(0,1fr)]',
                    'max-lg:grid-cols-1 max-lg:p-1.5 max-lg:gap-1.5',
                ].join(' ')}
            >
                {/* Sidebar */}
                <aside
                    className={[
                        'h-full overflow-hidden flex flex-col rounded-2xl bg-white/[0.04] border border-white/[0.07]',
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
                        'h-full overflow-hidden flex flex-col rounded-2xl bg-white/[0.04] border border-white/[0.07]',
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
                        'h-full overflow-hidden flex flex-col p-4 gap-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]',
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
