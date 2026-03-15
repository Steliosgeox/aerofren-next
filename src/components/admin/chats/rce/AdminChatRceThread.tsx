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
    'inline-flex items-center gap-1.5 min-h-[30px] px-3 rounded-full border border-white/[0.12] bg-white/[0.06] text-white/75 text-xs font-semibold cursor-pointer transition-colors duration-150 hover:bg-white/[0.10] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed';

const pill =
    'inline-flex items-center gap-1.5 min-h-[22px] px-2.5 rounded-full border text-[10px] font-bold tracking-[0.04em] uppercase';

const neutralPill = `${pill} bg-white/[0.05] border-white/[0.10] text-white/40`;

const quickReplyBtn =
    'inline-flex items-center justify-center min-h-7 px-2.5 rounded-full border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-[var(--theme-accent)]/20';

function getStatusPillClass(status?: string | null): string {
    if (status === 'resolved') return 'bg-green-600/10 border-green-600/20 text-green-400';
    if (status === 'in_progress') return 'bg-[var(--theme-accent)]/10 border-[var(--theme-accent)]/20 text-[var(--theme-accent)]';
    if (status === 'pending') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-white/[0.05] border-white/[0.10] text-white/40';
}

function getStatusLabel(status?: string | null): string {
    if (status === 'resolved') return 'Ολοκληρωμένο';
    if (status === 'in_progress') return 'Σε εξέλιξη';
    if (status === 'pending') return 'Σε αναμονή';
    return 'Άγνωστο';
}

export function AdminChatRceThread({
    workspace,
    messageListItems,
    composerRef,
    threadScrollerRef,
}: AdminChatRceThreadProps) {
    if (!workspace.currentConversation) {
        return (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-white/30 text-sm">
                Επίλεξε συνομιλία από τα εισερχόμενα.
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
            ? 'Ζωντανά'
            : workspace.threadSyncMode === 'polling'
              ? 'Polling fallback'
              : 'Σύνδεση...';

    return (
        <div className="flex flex-col min-h-0 flex-1">
            {/* ── Thread header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-white/[0.07] max-sm:flex-col max-sm:items-start max-sm:px-3">
                {/* Identity block */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <Image
                        src={avatar}
                        alt={workspace.currentConversationLabel}
                        className="w-8 h-8 rounded-full object-cover border border-white/[0.12] bg-white/[0.10] shrink-0"
                        width={32}
                        height={32}
                        unoptimized={avatar.startsWith('data:image/')}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-[var(--theme-text)] leading-tight truncate">
                            {workspace.currentConversationLabel}
                        </span>
                        <span className="text-[11px] text-white/50 truncate">
                            {currentConversation.userEmail ||
                                currentConversation.sessionId}
                        </span>
                    </div>
                </div>

                {/* Status pills + actions row */}
                <div className="flex flex-wrap items-center gap-2 max-sm:w-full">
                    {/* Status pills */}
                    <span
                        className={`${pill} ${getStatusPillClass(currentConversation.escalationStatus)}`}
                    >
                        {getStatusLabel(currentConversation.escalationStatus)}
                    </span>
                    <span className={neutralPill}>
                        αναμένει: {currentConversation.waitingOn || 'κανένας'}
                    </span>
                    <span className={neutralPill}>
                        {currentConversation.messageCount} μηνύματα
                    </span>

                    {/* Action buttons */}
                    <button
                        type="button"
                        className={`${btn} lg:hidden`}
                        onClick={workspace.clearSelection}
                    >
                        Πίσω
                    </button>

                    {workspace.canReply ? (
                        <button
                            type="button"
                            className={btn}
                            onClick={workspace.focusComposer}
                        >
                            Απάντηση
                        </button>
                    ) : null}

                    {currentConversation.escalationStatus !== 'in_progress' &&
                    currentConversation.escalationStatus !== 'resolved' ? (
                        <button
                            type="button"
                            className={btn}
                            onClick={() => void workspace.handleStatusChange('in_progress')}
                        >
                            Σε εξέλιξη
                        </button>
                    ) : null}

                    {currentConversation.escalationStatus === 'resolved' ? (
                        <button
                            type="button"
                            className={btn}
                            onClick={() => void workspace.handleStatusChange('pending')}
                        >
                            Επαναφορά
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={btn}
                            onClick={() => void workspace.handleStatusChange('resolved')}
                        >
                            Κλείσιμο
                        </button>
                    )}
                </div>
            </div>

            {/* ── Load older messages ───────────────────────────────── */}
            {workspace.hasMoreMessages ? (
                <div className="flex items-center justify-center px-4 pt-2.5">
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
                            ? 'Φόρτωση...'
                            : 'Παλαιότερα μηνύματα'}
                    </button>
                </div>
            ) : null}

            {/* ── Message list ──────────────────────────────────────── */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {workspace.isLoadingMessages ? (
                    <div className="flex items-center justify-center min-h-[200px] text-white/40 text-sm">
                        Φόρτωση συνομιλίας...
                    </div>
                ) : messageListItems.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[200px] text-white/40 text-sm">
                        Δεν υπάρχουν μηνύματα.
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
            <div className="flex-shrink-0 flex flex-col gap-2 px-3 pt-2 pb-3 border-t border-white/[0.07] bg-white/[0.02]">
                {!currentConversation.userId ? (
                    <div className="px-3 py-2.5 rounded-[14px] border border-white/[0.07] bg-white/[0.04] text-white/50 text-xs leading-relaxed">
                        Ανώνυμες συνομιλίες είναι μόνο για ανάγνωση.
                    </div>
                ) : currentConversation.escalationStatus === 'resolved' ? (
                    <div className="px-3 py-2.5 rounded-[14px] border border-green-500/20 bg-green-500/10 text-green-400 text-xs leading-relaxed">
                        Η συνομιλία έχει κλείσει. Επαναφέρετε για νέο μήνυμα.
                    </div>
                ) : !currentConversation.isEscalated ? (
                    <div className="px-3 py-2.5 rounded-[14px] border border-white/[0.07] bg-white/[0.04] text-white/50 text-xs leading-relaxed">
                        Οι απαντήσεις είναι διαθέσιμες μόνο σε κλιμακωμένες συνομιλίες.
                    </div>
                ) : (
                    <>
                        {/* Meta row */}
                        <div className="flex items-center justify-between gap-3 text-xs max-sm:flex-col max-sm:items-start">
                            <span className="font-medium text-white/40">
                                Enter αποστολή · Shift+Enter νέα γραμμή
                            </span>
                            <span className="text-white/30">{threadSyncLabel}</span>
                        </div>

                        {/* Quick replies */}
                        <div className="flex flex-wrap gap-1.5 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pb-1">
                            <button
                                type="button"
                                className={quickReplyBtn}
                                onClick={() =>
                                    workspace.injectQuickReply(
                                        'We received your request and are checking it now.',
                                    )
                                }
                            >
                                Επιβεβαίωση
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
                                Αίτηση κωδικού
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
                                Αποστολή τηλεφώνου
                            </button>
                        </div>

                        {/* Composer card */}
                        <div className="flex items-end gap-2.5 px-3 py-2 border border-white/[0.12] rounded-[16px] bg-white/[0.05] max-sm:flex-col max-sm:items-stretch">
                            <textarea
                                ref={composerRef}
                                value={workspace.replyDraft}
                                placeholder="Γράψε απάντηση..."
                                className="flex-1 min-w-0 min-h-[38px] max-h-[120px] border-0 outline-none resize-none bg-transparent text-[var(--theme-text)] text-sm leading-relaxed placeholder:text-white/25 py-2 px-1"
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
                                className="inline-flex items-center justify-center min-w-[68px] min-h-[34px] px-3 rounded-full bg-[var(--theme-accent)] text-white text-xs font-bold cursor-pointer transition-colors duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed max-sm:w-full"
                                disabled={
                                    !workspace.replyDraft.trim() ||
                                    workspace.isSendingReply ||
                                    !workspace.canReply
                                }
                                onClick={() => void workspace.handleReplySubmit()}
                            >
                                {workspace.isSendingReply ? 'Αποστολή...' : 'Αποστολή'}
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
