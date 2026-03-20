'use client';

import { Loader2, SortDesc, SlidersHorizontal, RotateCcw } from 'lucide-react';
import ChatwootConversationItem from './ChatwootConversationItem';
import type { AdminChatSessionRow } from './ChatwootConversationItem';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkspaceProps = Pick<
    {
        sessionRows: AdminChatSessionRow[];
        assignmentFilter: 'mine' | 'unassigned' | 'all';
        setAssignmentFilter: (value: 'mine' | 'unassigned' | 'all') => void;
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
    | 'assignmentFilter'
    | 'setAssignmentFilter'
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

type TabKey = 'mine' | 'unassigned' | 'all';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'mine', label: 'Δικά μου' },
    { key: 'unassigned', label: 'Χωρίς ανάθεση' },
    { key: 'all', label: 'Όλα' },
];

export default function ChatwootInboxPanel({ workspace }: ChatwootInboxPanelProps) {
    const {
        sessionRows,
        assignmentFilter,
        setAssignmentFilter,
        sessionsCursor,
        hasMoreSessions,
        isLoadingSessions,
        isLoadingMoreSessions,
        selectSession,
        fetchSessions,
    } = workspace;

    return (
        <div className="w-[300px] flex-shrink-0 h-full bg-[var(--cw-bg-sidebar)] border-r border-[var(--cw-border)] flex flex-col">
            {/* Top header row — title + icon actions */}
            <div className="h-14 flex-shrink-0 px-4 flex items-center justify-between border-b border-[var(--cw-border)]">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-semibold text-[var(--cw-text-1)]">
                        Συνομιλίες
                    </span>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[var(--cw-text-3)] border border-[var(--cw-border)] whitespace-nowrap">
                        Ανοιχτά
                    </span>
                </div>
                <div className="flex items-center gap-0.5">
                    {([SortDesc, SlidersHorizontal, RotateCcw] as const).map((Icon, i) => (
                        <button
                            key={i}
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.06] transition-colors"
                        >
                            <Icon size={13} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Mine / Unassigned / All tabs */}
            <div className="flex border-b border-[var(--cw-border)] flex-shrink-0">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setAssignmentFilter(key)}
                        className={[
                            'px-3 h-9 text-[11px] font-medium border-b-2 -mb-px transition-colors',
                            assignmentFilter === key
                                ? 'text-[var(--cw-accent)] border-[var(--cw-accent)]'
                                : 'text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] border-transparent',
                        ].join(' ')}
                    >
                        {label}
                        {key === 'all' && (
                            <span className="ml-1 text-[9px] rounded bg-white/[0.08] px-1">
                                {sessionRows.length}
                            </span>
                        )}
                    </button>
                ))}
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
