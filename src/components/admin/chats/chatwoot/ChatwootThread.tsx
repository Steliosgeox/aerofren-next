'use client';

import React from 'react';
import { Loader2, MessageSquare, AlertTriangle, ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react';
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
    showContextPanel?: boolean;
    onToggleContextPanel?: () => void;
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
    showContextPanel = true,
    onToggleContextPanel,
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
    const isResolved = escalationStatus === 'resolved';

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--cw-bg-main)] min-w-0">
            {/* Thread header — Chatwoot ConversationHeader h-14 */}
            <div className="flex items-center gap-2 px-3 h-14 flex-shrink-0 border-b border-[var(--cw-border)] bg-[var(--cw-bg-main)]">
                {/* Avatar — 32px circle */}
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

                {/* Name + source */}
                <div className="min-w-0 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[13px] font-semibold text-[var(--cw-text-1)] truncate leading-tight">
                            {currentConversationLabel}
                        </span>
                        {/* Warning icon shown when escalated */}
                        {currentConversation?.isEscalated && (
                            <AlertTriangle size={12} className="flex-shrink-0 text-amber-400" />
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[var(--cw-text-3)] leading-tight">
                            Aerofren Chat
                        </span>
                        <SyncIndicator mode={workspace.threadSyncMode} />
                    </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Panel toggle */}
                    {onToggleContextPanel && (
                        <button
                            type="button"
                            title={showContextPanel ? 'Απόκρυψη πλαισίου' : 'Εμφάνιση πλαισίου'}
                            onClick={onToggleContextPanel}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.06] transition-colors"
                        >
                            {showContextPanel ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
                        </button>
                    )}
                    {/* Divider */}
                    <div className="w-px h-5 bg-[var(--cw-border)] mx-1" />
                    {/* Resolve button — Chatwoot: bg-woot-500 (blue), with chevron dropdown */}
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => workspace.handleStatusChange(isResolved ? 'in_progress' : 'resolved')}
                            className="h-8 px-3 rounded-l text-[12px] font-semibold text-white transition-colors"
                            style={{ background: 'var(--cw-accent)' }}
                        >
                            {isResolved ? 'Επαναφορά' : 'Επίλυση'}
                        </button>
                        {/* Chevron dropdown part of the split button */}
                        <button
                            type="button"
                            className="h-8 w-7 rounded-r border-l border-white/20 flex items-center justify-center text-white transition-colors"
                            style={{ background: 'var(--cw-accent)' }}
                            title="Επιλογές"
                        >
                            <ChevronDown size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages scroll area */}
            <div
                ref={threadScrollerRef}
                onScroll={workspace.handleThreadScroll}
                className="flex-1 overflow-y-auto px-0 py-3 flex flex-col [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]"
            >
                {/* Spacer — pushes messages to the bottom when thread is sparse (Chatwoot first:mt-auto pattern) */}
                <div className="flex-1 min-h-0" />

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
