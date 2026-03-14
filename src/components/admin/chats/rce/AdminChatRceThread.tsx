'use client';

import Image from 'next/image';
import { MessageList } from '@/vendor/react-chat-elements';
import { buildInitials } from '@/lib/chat/session-metadata';
import { buildFallbackAvatar } from './adapter-helpers';
import { AdminChatRceDetails } from './AdminChatRceDetails';
import type { AdminChatWorkspaceState } from './adapter-helpers';
import type { MessageType } from '@/vendor/react-chat-elements';

interface AdminChatRceThreadProps {
    workspace: AdminChatWorkspaceState;
    messageListItems: MessageType[];
    composerRef: React.RefObject<HTMLTextAreaElement | null>;
    threadScrollerRef: React.RefObject<HTMLDivElement | null>;
}

const btn =
    'inline-flex items-center gap-2 min-h-[42px] px-3.5 rounded-full border border-slate-300/25 bg-white text-slate-900 text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:border-blue-600/30 hover:text-blue-700 disabled:opacity-55 disabled:cursor-not-allowed';

const pill =
    'inline-flex items-center gap-1.5 min-h-7 px-2.5 rounded-full border text-[11px] font-bold tracking-[0.04em] uppercase';

const neutralPill = `${pill} bg-slate-50 border-slate-200 text-slate-500`;

const quickReplyBtn =
    'inline-flex items-center justify-center min-h-8 px-3 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-blue-100';

function getStatusPillClass(status?: string | null): string {
    if (status === 'resolved') return 'bg-green-600/10 border-green-600/20 text-green-700';
    if (status === 'in_progress') return 'bg-blue-600/10 border-blue-600/15 text-blue-700';
    if (status === 'pending') return 'bg-amber-500/10 border-amber-500/20 text-amber-700';
    return 'bg-slate-50 border-slate-200 text-slate-500';
}

export function AdminChatRceThread({
    workspace,
    messageListItems,
    composerRef,
    threadScrollerRef,
}: AdminChatRceThreadProps) {
    if (!workspace.currentConversation) {
        return (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500 text-sm">
                Select a conversation from the queue to open the live support thread.
            </div>
        );
    }

    const currentConversation = workspace.currentConversation;
    const avatar =
        currentConversation.userPhotoURL ||
        buildFallbackAvatar(
            buildInitials(currentConversation.userName, currentConversation.userEmail),
            '#475569',
        );

    const handleThreadScroll = (event: React.UIEvent<HTMLElement>) => {
        workspace.handleThreadScroll();
        const target = event.currentTarget as HTMLDivElement;
        if (
            target.scrollTop <= 24 &&
            workspace.hasMoreMessages &&
            !workspace.isLoadingOlderMessages &&
            workspace.messagesCursor
        ) {
            void workspace.fetchOlderMessages(
                currentConversation.sessionId,
                workspace.messagesCursor,
            );
        }
    };

    const threadSyncLabel =
        workspace.threadSyncMode === 'live'
            ? 'Live updates active'
            : workspace.threadSyncMode === 'polling'
              ? 'Server sync fallback active'
              : 'Connecting thread updates…';

    return (
        <div className="flex flex-col min-h-0 flex-1">
            {/* ── Thread header ─────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 px-[22px] pb-4 pt-5 border-b border-slate-200/85 max-sm:flex-col max-sm:px-4">
                {/* Identity block */}
                <div className="flex flex-col gap-2.5 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <Image
                            src={avatar}
                            alt={workspace.currentConversationLabel}
                            className="w-11 h-11 rounded-full object-cover border border-slate-300/20 bg-slate-300 shrink-0"
                            width={44}
                            height={44}
                            unoptimized={avatar.startsWith('data:image/')}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h2 className="m-0 text-xl font-bold tracking-tight text-slate-900 leading-tight truncate">
                                {workspace.currentConversationLabel}
                            </h2>
                            <span className="text-[13px] text-slate-500 truncate">
                                {currentConversation.userEmail ||
                                    currentConversation.sessionId}
                            </span>
                        </div>
                    </div>

                    {/* Status pills */}
                    <div className="flex flex-wrap gap-2">
                        <span
                            className={`${pill} ${getStatusPillClass(currentConversation.escalationStatus)}`}
                        >
                            {currentConversation.escalationStatus || 'unknown'}
                        </span>
                        <span className={neutralPill}>
                            waiting on {currentConversation.waitingOn || 'none'}
                        </span>
                        <span className={neutralPill}>
                            {currentConversation.messageCount} messages
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap justify-end gap-2.5 max-sm:w-full max-sm:justify-start">
                    <button
                        type="button"
                        className={`${btn} lg:hidden`}
                        onClick={workspace.clearSelection}
                    >
                        Back to inbox
                    </button>

                    {workspace.canReply ? (
                        <button
                            type="button"
                            className={btn}
                            onClick={workspace.focusComposer}
                        >
                            Reply
                        </button>
                    ) : null}

                    {currentConversation.escalationStatus !== 'in_progress' &&
                    currentConversation.escalationStatus !== 'resolved' ? (
                        <button
                            type="button"
                            className={btn}
                            onClick={() => void workspace.handleStatusChange('in_progress')}
                        >
                            Mark in progress
                        </button>
                    ) : null}

                    {currentConversation.escalationStatus === 'resolved' ? (
                        <button
                            type="button"
                            className={btn}
                            onClick={() => void workspace.handleStatusChange('pending')}
                        >
                            Reopen
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={btn}
                            onClick={() => void workspace.handleStatusChange('resolved')}
                        >
                            Resolve
                        </button>
                    )}
                </div>
            </div>

            {/* ── Load older messages ───────────────────────────────── */}
            {workspace.hasMoreMessages ? (
                <div className="flex items-center justify-center px-4 pt-3">
                    <button
                        type="button"
                        className={btn}
                        onClick={() =>
                            void workspace.fetchOlderMessages(
                                currentConversation.sessionId,
                                workspace.messagesCursor,
                            )
                        }
                        disabled={workspace.isLoadingOlderMessages}
                    >
                        {workspace.isLoadingOlderMessages
                            ? 'Loading older…'
                            : 'Load older messages'}
                    </button>
                </div>
            ) : null}

            {/* ── Message list ──────────────────────────────────────── */}
            <div className="relative min-h-0 flex-1 flex flex-col">
                {workspace.isLoadingMessages ? (
                    <div className="flex items-center justify-center min-h-[260px] p-6 text-center text-slate-500 text-sm">
                        Loading conversation…
                    </div>
                ) : messageListItems.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[260px] p-6 text-center text-slate-500 text-sm">
                        No messages were loaded for this thread yet.
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 flex">
                        <MessageList
                            referance={threadScrollerRef}
                            className="admin-chat-rce__message-list"
                            lockable={true}
                            toBottomHeight={240}
                            downButton={true}
                            downButtonBadge={
                                workspace.hasDetachedThreadMessages ? 1 : undefined
                            }
                            dataSource={messageListItems}
                            onScroll={handleThreadScroll}
                        />
                    </div>
                )}
            </div>

            {/* ── Composer ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-[18px] pt-4 pb-[18px] border-t border-slate-200/85 bg-slate-50">
                {!currentConversation.userId ? (
                    <div className="px-4 py-3.5 rounded-[18px] border border-slate-200/90 bg-white text-slate-500 text-sm leading-relaxed">
                        Anonymous sessions remain read-only. In-app replies are only
                        available for authenticated customers.
                    </div>
                ) : currentConversation.escalationStatus === 'resolved' ? (
                    <div className="px-4 py-3.5 rounded-[18px] border border-green-600/20 bg-green-50/60 text-green-800 text-sm leading-relaxed">
                        This conversation is resolved. Reopen it before sending a new human
                        reply.
                    </div>
                ) : !currentConversation.isEscalated ? (
                    <div className="px-4 py-3.5 rounded-[18px] border border-slate-200/90 bg-white text-slate-500 text-sm leading-relaxed">
                        Human reply is only available for escalated support threads.
                    </div>
                ) : (
                    <>
                        {/* Meta row */}
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 max-sm:flex-col max-sm:items-start">
                            <span className="font-semibold">
                                Enter sends. Shift+Enter inserts a new line.
                            </span>
                            <span>{threadSyncLabel}</span>
                        </div>

                        {/* Quick replies */}
                        <div className="flex flex-wrap gap-2 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pb-1">
                            <button
                                type="button"
                                className={quickReplyBtn}
                                onClick={() =>
                                    workspace.injectQuickReply(
                                        'We received your request and are checking it now.',
                                    )
                                }
                            >
                                Acknowledge
                            </button>
                            <button
                                type="button"
                                className={quickReplyBtn}
                                onClick={() =>
                                    workspace.injectQuickReply(
                                        'Please send the product code or a photo so we can verify the exact item.',
                                    )
                                }
                            >
                                Ask for product code
                            </button>
                            <button
                                type="button"
                                className={quickReplyBtn}
                                onClick={() =>
                                    workspace.injectQuickReply(
                                        'You can also call us directly at 210 3461645 for immediate assistance.',
                                    )
                                }
                            >
                                Share phone
                            </button>
                        </div>

                        {/* Composer card */}
                        <div className="flex items-end gap-3 px-3 py-2.5 border border-blue-200/95 rounded-[20px] bg-white shadow-[0_12px_30px_rgba(148,163,184,0.12)] max-sm:flex-col max-sm:items-stretch">
                            <textarea
                                ref={composerRef}
                                value={workspace.replyDraft}
                                placeholder="Type a human reply to the customer..."
                                className="flex-1 min-w-0 min-h-[44px] max-h-[140px] border-0 outline-none resize-none bg-transparent text-slate-900 text-sm leading-relaxed placeholder:text-slate-400 pt-2.5 pb-1.5 px-1"
                                rows={1}
                                maxLength={5000}
                                onChange={(event) =>
                                    workspace.setReplyDraft(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        void workspace.handleReplySubmit();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="inline-flex items-center justify-center min-w-[72px] min-h-[38px] px-4 rounded-full bg-blue-600 text-white text-xs font-bold cursor-pointer transition-colors duration-150 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full"
                                disabled={
                                    !workspace.replyDraft.trim() ||
                                    workspace.isSendingReply ||
                                    !workspace.canReply
                                }
                                onClick={() => void workspace.handleReplySubmit()}
                            >
                                {workspace.isSendingReply ? 'Sending…' : 'Send'}
                            </button>
                        </div>
                    </>
                )}

                {/* Inline details panel — visible below xl breakpoint */}
                <AdminChatRceDetails workspace={workspace} mobile={true} />
            </div>
        </div>
    );
}
