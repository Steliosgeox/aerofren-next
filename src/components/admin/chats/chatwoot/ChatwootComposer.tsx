'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

type AdminChatStatusTone = 'pending' | 'in_progress' | 'resolved';

interface AdminChatConversationDetail {
    label: string;
    value: string;
    tone?: 'default' | 'muted' | 'success' | 'warning';
}

interface AdminChatWorkspaceState {
    selectedSessionId: string | null;
    currentConversationLabel: string;
    conversationDetails: AdminChatConversationDetail[];
    replyDraft: string;
    setReplyDraft: (value: string) => void;
    isSendingReply: boolean;
    canReply: boolean;
    handleStatusChange: (status: AdminChatStatusTone) => Promise<void> | void;
    handleReplySubmit: () => Promise<void> | void;
    injectQuickReply: (quickReply: string) => void;
    focusComposer: () => void;
    clearSelection: () => void;
    handleCopy: (value: string, successNotice: string) => Promise<void> | void;
    exportToCSV: () => void;
}

interface ChatwootComposerProps {
    workspace: AdminChatWorkspaceState;
    composerRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatwootComposer({ workspace, composerRef }: ChatwootComposerProps) {
    const [tab, setTab] = useState<'reply' | 'note'>('reply');

    const pillTabClass = (active: boolean) =>
        `px-3 h-7 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            active
                ? 'bg-white/[0.08] text-[var(--cw-text-1)]'
                : 'text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.04]'
        }`;

    return (
        <div className="flex-shrink-0 border-t border-[var(--cw-border)] bg-[var(--cw-bg-main)] flex flex-col">
            {/* Tab bar */}
            <div className="flex gap-1 p-1.5">
                <button className={pillTabClass(tab === 'reply')} onClick={() => setTab('reply')}>
                    Απάντηση
                </button>
                <button className={pillTabClass(tab === 'note')} onClick={() => setTab('note')}>
                    Ιδιωτική σημείωση
                </button>
            </div>

            {/* Textarea — amber tint for private note */}
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

            {/* Bottom bar */}
            <div className="flex items-center justify-end px-2.5 pb-2.5 max-lg:pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] pt-1">
                <button
                    type="button"
                    disabled={!workspace.canReply || workspace.isSendingReply}
                    onClick={() => void workspace.handleReplySubmit()}
                    className="px-3 h-7 rounded-lg bg-[var(--cw-accent)] hover:opacity-90 text-white text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5"
                >
                    {workspace.isSendingReply ? (
                        <Loader2 size={11} className="animate-spin" />
                    ) : (
                        <Send size={11} />
                    )}
                    Αποστολή
                    <span className="opacity-50 text-[10px]">↵</span>
                </button>
            </div>
        </div>
    );
}
