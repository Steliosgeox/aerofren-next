'use client';

import { Loader2 } from 'lucide-react';
import ChatwootConversationItem from './ChatwootConversationItem';
import type { AdminChatSessionRow } from './ChatwootConversationItem';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkspaceProps = Pick<
    {
        sessionRows: AdminChatSessionRow[];
        sessionsCursor: string | null;
        hasMoreSessions: boolean;
        isLoadingSessions: boolean;
        isLoadingMoreSessions: boolean;
        selectSession: (sessionId: string) => void;
        fetchSessions: (
            options?: { append?: boolean; cursor?: string | null },
        ) => Promise<void> | void;
    },
    | 'sessionRows'
    | 'sessionsCursor'
    | 'hasMoreSessions'
    | 'isLoadingSessions'
    | 'isLoadingMoreSessions'
    | 'selectSession'
    | 'fetchSessions'
>;

interface ChatwootInboxPanelProps {
    workspace: WorkspaceProps;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatwootInboxPanel({ workspace }: ChatwootInboxPanelProps) {
    const {
        sessionRows,
        sessionsCursor,
        hasMoreSessions,
        isLoadingSessions,
        isLoadingMoreSessions,
        selectSession,
        fetchSessions,
    } = workspace;

    return (
        <div className="w-[300px] flex-shrink-0 h-full bg-[var(--cw-bg-sidebar)] border-r border-[var(--cw-border)] flex flex-col">
            {/* Thin header — session count */}
            <div className="flex items-center px-3 h-8 flex-shrink-0 border-b border-[var(--cw-border)]">
                <span className="text-[10px] text-[var(--cw-text-3)] font-medium">
                    {sessionRows.length} συνομιλίες
                </span>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                {isLoadingSessions ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2
                            size={16}
                            className="animate-spin text-[var(--cw-text-3)]"
                        />
                    </div>
                ) : sessionRows.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-[11px] text-[var(--cw-text-3)]">
                            Δεν βρέθηκαν συνομιλίες
                        </span>
                    </div>
                ) : (
                    sessionRows.map((row) => (
                        <ChatwootConversationItem
                            key={row.sessionId}
                            row={row}
                            onClick={() => selectSession(row.sessionId)}
                        />
                    ))
                )}
            </div>

            {/* Load more button */}
            {hasMoreSessions && (
                <div className="flex-shrink-0 border-t border-[var(--cw-border)] p-2">
                    <button
                        type="button"
                        onClick={() => fetchSessions({ append: true, cursor: sessionsCursor })}
                        className="w-full h-7 text-[11px] text-[var(--cw-text-2)] hover:text-[var(--cw-text-1)] bg-white/[0.03] hover:bg-white/[0.06] rounded transition-colors flex items-center justify-center"
                    >
                        {isLoadingMoreSessions ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            'Φόρτωση περισσότερων...'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
