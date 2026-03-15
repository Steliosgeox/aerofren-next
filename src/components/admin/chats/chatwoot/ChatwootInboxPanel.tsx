'use client';

import { Loader2, Search } from 'lucide-react';
import ChatwootConversationItem from './ChatwootConversationItem';
import type { AdminChatSessionRow } from './ChatwootConversationItem';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminChatWorkspaceTab = 'open' | 'waiting_on_admin' | 'in_progress' | 'resolved' | 'all';

type WorkspaceProps = Pick<
    {
        sessionRows: AdminChatSessionRow[];
        sessionsCursor: string | null;
        hasMoreSessions: boolean;
        isLoadingSessions: boolean;
        isLoadingMoreSessions: boolean;
        selectedSessionId: string | null;
        statusTab: AdminChatWorkspaceTab;
        queueInsights: { waitingOnAdmin: number };
        inboxSummary: string;
        searchQuery: string;
        setSearchQuery: (value: string) => void;
        handleTabChange: (tab: AdminChatWorkspaceTab) => void;
        handleTabKeyDown: (
            event: React.KeyboardEvent<HTMLButtonElement>,
            currentIndex: number,
        ) => void;
        selectSession: (sessionId: string) => void;
        fetchSessions: (
            options?: { append?: boolean; cursor?: string | null },
        ) => Promise<void> | void;
        refreshSessions: () => Promise<void> | void;
    },
    | 'sessionRows'
    | 'sessionsCursor'
    | 'hasMoreSessions'
    | 'isLoadingSessions'
    | 'isLoadingMoreSessions'
    | 'statusTab'
    | 'queueInsights'
    | 'searchQuery'
    | 'setSearchQuery'
    | 'handleTabChange'
    | 'handleTabKeyDown'
    | 'selectSession'
    | 'fetchSessions'
>;

interface ChatwootInboxPanelProps {
    workspace: WorkspaceProps;
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS: { label: string; value: AdminChatWorkspaceTab }[] = [
    { label: 'Όλα', value: 'all' },
    { label: 'Ανοιχτά', value: 'open' },
    { label: 'Αναμένει', value: 'waiting_on_admin' },
    { label: 'Σε εξέλιξη', value: 'in_progress' },
    { label: 'Λύθηκαν', value: 'resolved' },
];

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
        statusTab,
        queueInsights,
        searchQuery,
        setSearchQuery,
        handleTabChange,
        handleTabKeyDown,
        selectSession,
        fetchSessions,
    } = workspace;

    return (
        <div className="w-[300px] flex-shrink-0 h-full bg-[var(--cw-bg-sidebar)] border-r border-[var(--cw-border)] flex flex-col">
            {/* 1. Header bar */}
            <div className="flex items-center justify-between px-3 h-11 flex-shrink-0 border-b border-[var(--cw-border)]">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--cw-text-1)]">
                        Συνομιλίες
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-[var(--cw-text-3)] bg-white/[0.06]">
                        Ανοιχτά
                    </span>
                </div>
                {queueInsights.waitingOnAdmin > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold">
                        {queueInsights.waitingOnAdmin}
                    </span>
                )}
            </div>

            {/* 2. Search bar */}
            <div className="px-2 py-1.5 flex-shrink-0 border-b border-[var(--cw-border)]">
                <div className="relative">
                    <Search
                        size={12}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--cw-text-3)] pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Αναζήτηση..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-7 rounded-md bg-white/[0.06] border border-[var(--cw-border)] pl-6 pr-2.5 text-[12px] text-[var(--cw-text-1)] placeholder-[var(--cw-text-3)] outline-none focus:border-[var(--cw-accent)]/40 focus:bg-white/[0.08] transition-colors"
                    />
                </div>
            </div>

            {/* 3. Status tabs */}
            <div className="flex flex-shrink-0 border-b border-[var(--cw-border)]">
                {TABS.map((tab, index) => {
                    const isActive = statusTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => handleTabChange(tab.value)}
                            onKeyDown={(e) => handleTabKeyDown(e, index)}
                            className={[
                                'flex-1 h-8 text-[11px] font-medium transition-colors cursor-pointer border-b-2 -mb-px',
                                isActive
                                    ? 'text-[var(--cw-accent)] border-[var(--cw-accent)]'
                                    : 'text-[var(--cw-text-3)] border-transparent hover:text-[var(--cw-text-2)]',
                            ].join(' ')}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* 4. Session list */}
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

            {/* 5. Load more button */}
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
