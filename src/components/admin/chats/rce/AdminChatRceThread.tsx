'use client';

import Image from 'next/image';
import { MessageList } from '@/vendor/react-chat-elements';
import { buildInitials } from '@/lib/chat/session-metadata';
import { buildFallbackAvatar } from './adapter-helpers';
import { AdminChatRceDetails } from './AdminChatRceDetails';
import styles from './admin-chat-rce.module.css';
import type { AdminChatWorkspaceState } from './adapter-helpers';
import type { MessageType } from '@/vendor/react-chat-elements';

interface AdminChatRceThreadProps {
    workspace: AdminChatWorkspaceState;
    messageListItems: MessageType[];
    composerRef: React.RefObject<HTMLTextAreaElement | null>;
    threadScrollerRef: React.RefObject<HTMLDivElement | null>;
}

function getStatusClassName(status?: string | null) {
    if (status === 'resolved') return styles.resolved;
    if (status === 'in_progress') return styles.progress;
    if (status === 'pending') return styles.pending;
    return styles.neutral;
}

export function AdminChatRceThread({
    workspace,
    messageListItems,
    composerRef,
    threadScrollerRef,
}: AdminChatRceThreadProps) {
    if (!workspace.currentConversation) {
        return (
            <div className={styles.emptyState}>
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
            void workspace.fetchOlderMessages(currentConversation.sessionId, workspace.messagesCursor);
        }
    };
    const threadSyncLabel =
        workspace.threadSyncMode === 'live'
            ? 'Live updates active'
            : workspace.threadSyncMode === 'polling'
                ? 'Server sync fallback active'
                : 'Connecting thread updates…';

    return (
        <div className={styles.threadShell}>
            <div className={styles.threadHeader}>
                <div className={styles.threadIdentity}>
                    <div className={styles.threadIdentityTop}>
                        <Image
                            src={avatar}
                            alt={workspace.currentConversationLabel}
                            className={styles.threadAvatar}
                            width={44}
                            height={44}
                            unoptimized={avatar.startsWith('data:image/')}
                        />

                        <div className={styles.threadIdentityText}>
                            <h2>{workspace.currentConversationLabel}</h2>
                            <span>
                                {currentConversation.userEmail ||
                                    currentConversation.sessionId}
                            </span>
                        </div>
                    </div>

                    <div className={styles.pillRow}>
                        <span className={`${styles.pill} ${getStatusClassName(currentConversation.escalationStatus)}`}>
                            {currentConversation.escalationStatus || 'unknown'}
                        </span>
                        <span className={`${styles.pill} ${styles.neutral}`}>
                            waiting on {currentConversation.waitingOn || 'none'}
                        </span>
                        <span className={`${styles.pill} ${styles.neutral}`}>
                            {currentConversation.messageCount} messages
                        </span>
                    </div>
                </div>

                <div className={styles.threadActions}>
                    <button
                        type="button"
                        className={`${styles.headerButton} ${styles.mobileOnly}`}
                        onClick={workspace.clearSelection}
                    >
                        Back to inbox
                    </button>

                    {workspace.canReply ? (
                        <button
                            type="button"
                            className={styles.headerButton}
                            onClick={workspace.focusComposer}
                        >
                            Reply
                        </button>
                    ) : null}

                    {currentConversation.escalationStatus !== 'in_progress' &&
                    currentConversation.escalationStatus !== 'resolved' ? (
                        <button
                            type="button"
                            className={styles.headerButton}
                            onClick={() => void workspace.handleStatusChange('in_progress')}
                        >
                            Mark in progress
                        </button>
                    ) : null}

                    {currentConversation.escalationStatus === 'resolved' ? (
                        <button
                            type="button"
                            className={styles.headerButton}
                            onClick={() => void workspace.handleStatusChange('pending')}
                        >
                            Reopen
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.headerButton}
                            onClick={() => void workspace.handleStatusChange('resolved')}
                        >
                            Resolve
                        </button>
                    )}
                </div>
            </div>

            {workspace.hasMoreMessages ? (
                <div className={styles.messageTools}>
                    <button
                        type="button"
                        className={styles.headerButton}
                        onClick={() =>
                            void workspace.fetchOlderMessages(
                                currentConversation.sessionId,
                                workspace.messagesCursor,
                            )
                        }
                        disabled={workspace.isLoadingOlderMessages}
                    >
                        {workspace.isLoadingOlderMessages ? 'Loading older…' : 'Load older messages'}
                    </button>
                </div>
            ) : null}

            <div className={styles.messagePane}>
                {workspace.isLoadingMessages ? (
                    <div className={styles.threadEmptyState}>Loading conversation…</div>
                ) : messageListItems.length === 0 ? (
                    <div className={styles.threadEmptyState}>
                        No messages were loaded for this thread yet.
                    </div>
                ) : (
                    <div className={styles.messageListWrap}>
                        <MessageList
                            referance={threadScrollerRef}
                            className="admin-chat-rce__message-list"
                            lockable={true}
                            toBottomHeight={240}
                            downButton={true}
                            downButtonBadge={workspace.hasDetachedThreadMessages ? 1 : undefined}
                            dataSource={messageListItems}
                            onScroll={handleThreadScroll}
                        />
                    </div>
                )}
            </div>

            <div className={styles.composerSection}>
                {!currentConversation.userId ? (
                    <div className={styles.notice}>
                        Anonymous sessions remain read-only. In-app replies are only available for
                        authenticated customers.
                    </div>
                ) : currentConversation.escalationStatus === 'resolved' ? (
                    <div className={`${styles.notice} ${styles.noticeStrong}`}>
                        This conversation is resolved. Reopen it before sending a new human reply.
                    </div>
                ) : !currentConversation.isEscalated ? (
                    <div className={styles.notice}>
                        Human reply is only available for escalated support threads.
                    </div>
                ) : (
                    <>
                        <div className={styles.composerMeta}>
                            <span className={styles.composerHint}>
                                Enter sends. Shift+Enter inserts a new line.
                            </span>
                            <span>{threadSyncLabel}</span>
                        </div>

                        <div className={styles.quickReplies}>
                            <button
                                type="button"
                                className={styles.quickReplyButton}
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
                                className={styles.quickReplyButton}
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
                                className={styles.quickReplyButton}
                                onClick={() =>
                                    workspace.injectQuickReply(
                                        'You can also call us directly at 210 3461645 for immediate assistance.',
                                    )
                                }
                            >
                                Share phone
                            </button>
                        </div>

                        <div className={styles.composerCard}>
                            <textarea
                                ref={composerRef}
                                value={workspace.replyDraft}
                                placeholder="Type a human reply to the customer..."
                                className={styles.composerInput}
                                rows={1}
                                maxLength={5000}
                                onChange={(event) => workspace.setReplyDraft(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        void workspace.handleReplySubmit();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className={styles.sendButton}
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

                <AdminChatRceDetails workspace={workspace} mobile={true} />
            </div>
        </div>
    );
}
