'use client';

import React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { ChatwootComposer } from './ChatwootComposer';
import ChatwootMessage from './ChatwootMessage';

type AdminChatStatusTone = 'pending' | 'in_progress' | 'resolved';

interface AdminChatConversation {
    sessionId: string;
    userId?: string | null;
    userEmail?: string | null;
    userName?: string | null;
    userPhotoURL?: string | null;
    messageCount: number;
    lastMessage: string;
    adminUnreadCount?: number;
    customerUnreadCount?: number;
    waitingOn?: 'admin' | 'customer' | 'none' | null;
    isEscalated?: boolean;
    escalationStatus?: AdminChatStatusTone | null;
}

interface AdminChatThreadMessage {
    id: string;
    role: 'user' | 'assistant' | 'admin' | 'system';
    content: string;
    timestamp: string;
    userEmail?: string | null;
    userName?: string | null;
    senderLabel?: string | null;
}

interface AdminChatGroupedMessageDayEntry {
    type: 'day';
    key: string;
    label: string;
}

interface AdminChatGroupedMessageItemEntry {
    type: 'message';
    key: string;
    message: AdminChatThreadMessage;
}

type AdminChatGroupedMessageEntry =
    | AdminChatGroupedMessageDayEntry
    | AdminChatGroupedMessageItemEntry;

interface AdminChatWorkspaceState {
    selectedSessionId: string | null;
    currentConversation: AdminChatConversation | null;
    currentConversationLabel: string;
    groupedMessages: AdminChatGroupedMessageEntry[];
    messagesCursor: string | null;
    hasMoreMessages: boolean;
    isLoadingMessages: boolean;
    isLoadingOlderMessages: boolean;
    threadSyncMode: 'connecting' | 'live' | 'polling';
    hasDetachedThreadMessages: boolean;
    replyDraft: string;
    setReplyDraft: (value: string) => void;
    isSendingReply: boolean;
    canReply: boolean;
    handleStatusChange: (status: AdminChatStatusTone) => Promise<void> | void;
    handleReplySubmit: () => Promise<void> | void;
    fetchOlderMessages: (sessionId: string, cursor: string | null) => Promise<void> | void;
    handleThreadScroll: () => void;
    injectQuickReply: (quickReply: string) => void;
    focusComposer: () => void;
    clearSelection: () => void;
    conversationDetails: Array<{ label: string; value: string; tone?: 'default' | 'muted' | 'success' | 'warning' }>;
    handleCopy: (value: string, successNotice: string) => Promise<void> | void;
    exportToCSV: () => void;
}

interface ChatwootThreadProps {
    workspace: AdminChatWorkspaceState;
    composerRef: React.RefObject<HTMLTextAreaElement | null>;
    threadScrollerRef: React.RefObject<HTMLDivElement | null>;
}

function getInitials(label: string): string {
    return label.slice(0, 2).toUpperCase();
}

function SyncIndicator({ mode }: { mode: 'connecting' | 'live' | 'polling' }) {
    if (mode === 'connecting') {
        return (
            <span className="flex items-center gap-1 text-[9px] text-amber-400 font-medium">
                <span>●</span>
                <span>Σύνδεση...</span>
            </span>
        );
    }
    if (mode === 'live') {
        return (
            <span className="flex items-center gap-1 text-[9px] text-green-400 font-medium">
                <span>●</span>
                <span>Live</span>
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 text-[9px] text-blue-400 font-medium">
            <span>●</span>
            <span>Polling</span>
        </span>
    );
}

function StatusPill({ status }: { status: AdminChatStatusTone }) {
    const config: Record<AdminChatStatusTone, { bg: string; label: string }> = {
        pending: { bg: 'bg-amber-500', label: 'Αναμονή' },
        in_progress: { bg: 'bg-blue-500', label: 'Σε εξέλιξη' },
        resolved: { bg: 'bg-green-500', label: 'Λύθηκε' },
    };
    const { bg, label } = config[status];
    return (
        <span className={`${bg} px-2 py-0.5 rounded-full text-[10px] font-semibold text-white`}>
            {label}
        </span>
    );
}

export default function ChatwootThread({
    workspace,
    composerRef,
    threadScrollerRef,
}: ChatwootThreadProps) {
    if (!workspace.selectedSessionId) {
        return (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--cw-bg-main)] min-w-0 items-center justify-center gap-2">
                <MessageSquare size={32} className="text-[var(--cw-text-3)]" />
                <p className="text-[13px] text-[var(--cw-text-3)]">Επιλέξτε μια συνομιλία</p>
            </div>
        );
    }

    const { currentConversation, currentConversationLabel } = workspace;
    const escalationStatus = currentConversation?.escalationStatus ?? null;
    const photoURL = currentConversation?.userPhotoURL ?? null;
    const userEmail = currentConversation?.userEmail ?? null;
    const isResolved = escalationStatus === 'resolved';

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--cw-bg-main)] min-w-0">
            {/* Thread header */}
            <div className="flex items-center gap-2.5 px-3 h-11 flex-shrink-0 border-b border-[var(--cw-border)]">
                {/* Avatar */}
                {photoURL ? (
                    <img
                        src={photoURL}
                        alt={currentConversationLabel}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2a3a4f] flex items-center justify-center text-[11px] font-bold text-[var(--cw-text-1)] flex-shrink-0">
                        {getInitials(currentConversationLabel)}
                    </div>
                )}

                {/* Name + email */}
                <div className="min-w-0 flex flex-col">
                    <span className="text-[14px] font-semibold text-[var(--cw-text-1)] truncate leading-tight">
                        {currentConversationLabel}
                    </span>
                    {userEmail && (
                        <span className="text-[11px] text-[var(--cw-text-3)] truncate leading-tight">
                            {userEmail}
                        </span>
                    )}
                </div>

                {/* Right side controls */}
                <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                    <SyncIndicator mode={workspace.threadSyncMode} />

                    {escalationStatus && <StatusPill status={escalationStatus} />}

                    <button
                        onClick={() => workspace.handleStatusChange('resolved')}
                        disabled={isResolved}
                        className="px-2.5 py-1 rounded bg-[var(--cw-accent)] text-white text-[11px] font-medium hover:bg-[var(--cw-accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Κλείσιμο
                    </button>

                    {isResolved && (
                        <button
                            onClick={() => workspace.handleStatusChange('in_progress')}
                            className="px-2.5 py-1 rounded border border-[var(--cw-border)] text-[var(--cw-text-2)] text-[11px] hover:bg-white/[0.05] transition-colors"
                        >
                            Επαναφορά
                        </button>
                    )}
                </div>
            </div>

            {/* Messages scroll area */}
            <div
                ref={threadScrollerRef}
                onScroll={workspace.handleThreadScroll}
                className="flex-1 overflow-y-auto px-3 py-2 flex flex-col [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]"
            >
                {/* Load older messages button */}
                {workspace.hasMoreMessages && (
                    <button
                        onClick={() =>
                            workspace.fetchOlderMessages(
                                workspace.selectedSessionId!,
                                workspace.messagesCursor,
                            )
                        }
                        className="self-center mb-2 px-3 py-1 rounded text-[11px] text-[var(--cw-text-3)] border border-[var(--cw-border)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.04] transition-colors flex items-center gap-1.5"
                    >
                        {workspace.isLoadingOlderMessages ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            'Παλαιότερα μηνύματα'
                        )}
                    </button>
                )}

                {/* Loading spinner */}
                {workspace.isLoadingMessages && (
                    <div className="flex-1 flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-[var(--cw-text-3)]" />
                    </div>
                )}

                {/* Grouped messages */}
                {workspace.groupedMessages.map((entry, i) => (
                    <ChatwootMessage
                        key={entry.key}
                        entry={entry}
                        prevEntry={workspace.groupedMessages[i - 1]}
                    />
                ))}

                {/* New messages badge */}
                {workspace.hasDetachedThreadMessages && (
                    <div className="sticky bottom-2 flex justify-center">
                        <button
                            onClick={() => workspace.focusComposer()}
                            className="px-3 py-1 rounded-full bg-[var(--cw-accent)] text-white text-[11px] shadow-lg"
                        >
                            Νέα μηνύματα ↓
                        </button>
                    </div>
                )}
            </div>

            {/* Composer */}
            <ChatwootComposer workspace={workspace} composerRef={composerRef} />
        </div>
    );
}
