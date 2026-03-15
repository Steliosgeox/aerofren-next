'use client';

import React, { useState } from 'react';
import {
    Paperclip,
    Smile,
    Send,
    Loader2,
    Bold,
    Italic,
    Strikethrough,
    Link2,
    Quote,
    Code2,
    Undo2,
    Redo2,
    List,
    ListOrdered,
    Image,
} from 'lucide-react';

type AdminChatStatusTone = 'pending' | 'in_progress' | 'resolved';

interface AdminChatConversationDetail {
    label: string;
    value: string;
    tone?: 'default' | 'muted' | 'success' | 'warning';
}

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

interface AdminChatWorkspaceState {
    selectedSessionId: string | null;
    currentConversation: AdminChatConversation | null;
    currentConversationLabel: string;
    conversationDetails: AdminChatConversationDetail[];
    replyDraft: string;
    setReplyDraft: (value: string) => void;
    isSendingReply: boolean;
    canReply: boolean;
    handleReplySubmit: () => Promise<void> | void;
    injectQuickReply: (quickReply: string) => void;
    handleCopy: (value: string, successNotice: string) => Promise<void> | void;
    exportToCSV: () => void;
}

interface ChatwootComposerProps {
    workspace: AdminChatWorkspaceState;
    composerRef: React.RefObject<HTMLTextAreaElement | null>;
}

const rteDivider = (
    <div className="w-px h-4 bg-[var(--cw-border)] mx-0.5" />
);

export function ChatwootComposer({ workspace, composerRef }: ChatwootComposerProps) {
    const [tab, setTab] = useState<'reply' | 'note'>('reply');

    const pillTabClass = (active: boolean) =>
        `px-3 h-7 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            active
                ? 'bg-[var(--cw-accent-dim)] text-[var(--cw-accent)]'
                : 'text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.04]'
        }`;

    const iconBtnClass =
        'inline-flex items-center justify-center w-7 h-7 rounded text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.06] transition-colors cursor-pointer';

    const rteBtnClass =
        'w-6 h-6 rounded flex items-center justify-center text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.06] transition-colors';

    return (
        <div className="flex-shrink-0 border-t border-[var(--cw-border)] bg-[var(--cw-bg-main)] flex flex-col">
            {/* Pill tab bar */}
            <div className="flex gap-1 p-1.5 bg-[var(--cw-bg-main)]">
                <button
                    className={pillTabClass(tab === 'reply')}
                    onClick={() => setTab('reply')}
                >
                    Απάντηση
                </button>
                <button
                    className={pillTabClass(tab === 'note')}
                    onClick={() => setTab('note')}
                >
                    Ιδιωτικό σημείωμα
                </button>
            </div>

            {/* RTE toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[var(--cw-border)]">
                <button className={rteBtnClass} title="Έντονα"><Bold size={13} /></button>
                <button className={rteBtnClass} title="Πλάγια"><Italic size={13} /></button>
                <button className={rteBtnClass} title="Διαγραφή"><Strikethrough size={13} /></button>
                {rteDivider}
                <button className={rteBtnClass} title="Σύνδεσμος"><Link2 size={13} /></button>
                <button className={rteBtnClass} title="Παράθεση"><Quote size={13} /></button>
                <button className={rteBtnClass} title="Κώδικας"><Code2 size={13} /></button>
                {rteDivider}
                <button className={rteBtnClass} title="Αναίρεση"><Undo2 size={13} /></button>
                <button className={rteBtnClass} title="Επαναφορά"><Redo2 size={13} /></button>
                {rteDivider}
                <button className={rteBtnClass} title="Λίστα"><List size={13} /></button>
                <button className={rteBtnClass} title="Αριθμημένη λίστα"><ListOrdered size={13} /></button>
                {rteDivider}
                <button className={rteBtnClass} title="Εικόνα"><Image size={13} /></button>
            </div>

            {/* Textarea wrapper — amber tint for note tab */}
            <div className={tab === 'note' ? 'bg-amber-950/20' : 'bg-transparent'}>
                <textarea
                    ref={composerRef}
                    rows={3}
                    value={workspace.replyDraft}
                    onChange={(e) => workspace.setReplyDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (workspace.canReply && !workspace.isSendingReply) {
                                void workspace.handleReplySubmit();
                            }
                        }
                    }}
                    placeholder={
                        workspace.canReply
                            ? 'Γράψτε μια απάντηση...'
                            : 'Αυτή η συνομιλία δεν μπορεί να απαντηθεί.'
                    }
                    disabled={!workspace.canReply || workspace.isSendingReply}
                    className="w-full resize-none px-3 pt-2 pb-1 bg-transparent text-[13px] text-[var(--cw-text-1)] placeholder-[var(--cw-text-3)] outline-none disabled:opacity-40 min-h-[80px] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]"
                />
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-2.5 pb-2 gap-2">
                {/* Left: icon buttons */}
                <div className="flex items-center gap-0.5">
                    <button className={iconBtnClass} title="Επισύναψη">
                        <Paperclip size={16} />
                    </button>
                    <button className={iconBtnClass} title="Emoji">
                        <Smile size={16} />
                    </button>
                    <button
                        className={`${iconBtnClass} text-[11px] font-mono`}
                        title="Κεφ. απαντήσεις"
                        onClick={() => workspace.injectQuickReply('')}
                    >
                        /
                    </button>
                </div>

                {/* Right: hint + send */}
                <div className="flex items-center">
                    <span className="text-[9px] text-[var(--cw-text-3)] mr-2 hidden sm:block">
                        Shift+Enter για νέα γραμμή
                    </span>
                    <button
                        disabled={
                            !workspace.canReply ||
                            workspace.isSendingReply ||
                            !workspace.replyDraft.trim()
                        }
                        onClick={() => void workspace.handleReplySubmit()}
                        className="px-3 h-7 rounded bg-[var(--cw-accent)] hover:bg-[var(--cw-accent)]/90 text-white text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                        {workspace.isSendingReply ? (
                            <Loader2 size={11} className="animate-spin" />
                        ) : (
                            <Send size={11} />
                        )}
                        Αποστολή <span className="opacity-60 ml-0.5 text-[10px]">↵</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
