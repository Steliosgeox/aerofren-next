'use client';

import { Search } from 'lucide-react';
import { ChatList } from '@/vendor/react-chat-elements';
import { WORKSPACE_TABS } from '@/lib/admin-chat/workspace';
import type { AdminChatWorkspaceState } from './adapter-helpers';
import type { IChatItemProps } from '@/vendor/react-chat-elements';

interface AdminChatRceSidebarProps {
    workspace: AdminChatWorkspaceState;
    chatListItems: IChatItemProps[];
}

const btn =
    'inline-flex items-center gap-1.5 min-h-[30px] px-3 rounded-full border border-white/[0.10] bg-white/[0.05] text-white/60 text-xs font-semibold cursor-pointer transition-colors duration-150 hover:bg-white/[0.08] hover:text-white/80 disabled:opacity-40';

export function AdminChatRceSidebar({
    workspace,
    chatListItems,
}: AdminChatRceSidebarProps) {
    return (
        <>
            {/* ── Sidebar header ────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5 px-2.5 pb-2 pt-2.5 border-b border-white/[0.06]">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/40">
                        ΕΙΣΕΡΧΟΜΕΝΑ
                    </span>
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-white/50 text-[9px] font-bold">
                        {workspace.sessions.length}
                    </span>
                </div>

                {/* ── Search input ──────────────────────────────────── */}
                <label
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.07]"
                    aria-label="Αναζήτηση συνομιλιών"
                >
                    <Search size={13} className="text-white/30 shrink-0" />
                    <input
                        type="search"
                        className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[var(--theme-text)] text-xs placeholder:text-white/30"
                        placeholder="Αναζήτηση..."
                        value={workspace.searchQuery}
                        onChange={(e) => workspace.setSearchQuery(e.target.value)}
                    />
                </label>

                {/* ── Queue tabs ──────────────────────────────────────── */}
                <div
                    className="flex gap-1 overflow-x-auto pb-0.5"
                    role="radiogroup"
                    aria-label="Φίλτρα συνομιλιών"
                >
                    {WORKSPACE_TABS.map((tab, index) => {
                        const isActive = workspace.statusTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                title={tab.description}
                                onClick={() => workspace.handleTabChange(tab.id)}
                                onKeyDown={(event) =>
                                    workspace.handleTabKeyDown(event, index)
                                }
                                className={[
                                    'inline-flex items-center justify-center min-h-[26px] px-2 rounded border text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors duration-100',
                                    isActive
                                        ? 'bg-[var(--theme-accent)]/15 border-[var(--theme-accent)]/30 text-[var(--theme-accent)]'
                                        : 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.07] hover:text-white/70',
                                ].join(' ')}
                            >
                                {tab.shortLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Chat list ─────────────────────────────────────────── */}
            <div className="min-h-0 flex-1 px-1.5 pt-1.5 pb-2 overflow-y-auto">
                {chatListItems.length > 0 ? (
                    <ChatList
                        id="admin-chat-rce-list"
                        lazyLoadingImage=""
                        dataSource={chatListItems}
                        onClick={(item) => workspace.selectSession(String(item.id))}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center p-8 text-center text-white/30 text-sm">
                        Δεν βρέθηκαν συνομιλίες.
                    </div>
                )}
            </div>

            {/* ── Load more footer ──────────────────────────────────── */}
            {workspace.hasMoreSessions ? (
                <div className="flex justify-center px-3 py-2 pb-3 border-t border-white/[0.07]">
                    <button
                        type="button"
                        className={btn}
                        onClick={() =>
                            void workspace.fetchSessions({
                                append: true,
                                cursor: workspace.sessionsCursor,
                            })
                        }
                        disabled={workspace.isLoadingMoreSessions}
                    >
                        {workspace.isLoadingMoreSessions ? 'Φόρτωση...' : 'Περισσότερα'}
                    </button>
                </div>
            ) : null}
        </>
    );
}
