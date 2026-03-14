'use client';

import { ChatList } from '@/vendor/react-chat-elements';
import { WORKSPACE_TABS } from '@/lib/admin-chat/workspace';
import type { AdminChatWorkspaceState } from './adapter-helpers';
import type { IChatItemProps } from '@/vendor/react-chat-elements';

interface AdminChatRceSidebarProps {
    workspace: AdminChatWorkspaceState;
    chatListItems: IChatItemProps[];
}

const btn =
    'inline-flex items-center gap-2 min-h-[42px] px-3.5 rounded-full border border-slate-300/25 bg-white text-slate-900 text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:border-blue-600/30 hover:text-blue-700 disabled:opacity-55 disabled:cursor-not-allowed';

export function AdminChatRceSidebar({
    workspace,
    chatListItems,
}: AdminChatRceSidebarProps) {
    return (
        <>
            {/* ── Sidebar header ────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-5 pb-4 pt-5 border-b border-slate-200/90">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">
                            Inbox
                        </span>
                        <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900 leading-tight">
                            Admin conversations
                        </h2>
                        <span className="text-[13px] text-slate-500">
                            {workspace.inboxSummary}
                        </span>
                    </div>

                    <div className="inline-flex flex-col items-end justify-center gap-0.5 min-w-[68px] px-3 py-2.5 rounded-[18px] bg-slate-50 border border-slate-200/95 shrink-0">
                        <span className="text-lg font-bold text-slate-900">
                            {workspace.sessions.length}
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Threads
                        </span>
                    </div>
                </div>

                {/* ── Queue tabs ──────────────────────────────────────── */}
                <div
                    className="flex gap-2 overflow-x-auto pb-1"
                    role="radiogroup"
                    aria-label="Chat queue tabs"
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
                                    'inline-flex items-center justify-center min-h-[38px] px-3.5 rounded-full border text-xs font-bold whitespace-nowrap cursor-pointer transition-colors duration-150',
                                    isActive
                                        ? 'border-blue-600/25 bg-blue-100 text-blue-700'
                                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-600/20 hover:text-blue-800',
                                ].join(' ')}
                            >
                                {tab.shortLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Chat list ─────────────────────────────────────────── */}
            <div className="min-h-0 flex-1 px-2.5 pt-2.5 pb-3">
                {chatListItems.length > 0 ? (
                    <ChatList
                        id="admin-chat-rce-list"
                        lazyLoadingImage=""
                        dataSource={chatListItems}
                        onClick={(item) => workspace.selectSession(String(item.id))}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500 text-sm">
                        No conversations match the active filters. Adjust the search or queue
                        tab.
                    </div>
                )}
            </div>

            {/* ── Load more footer ──────────────────────────────────── */}
            {workspace.hasMoreSessions ? (
                <div className="flex justify-center px-3 py-2 pb-3.5 border-t border-slate-200/75">
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
                        {workspace.isLoadingMoreSessions ? 'Loading…' : 'Load more threads'}
                    </button>
                </div>
            ) : null}
        </>
    );
}
