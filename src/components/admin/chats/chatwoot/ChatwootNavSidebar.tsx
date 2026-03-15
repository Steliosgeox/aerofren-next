'use client';

import { Search } from 'lucide-react';
import type { KeyboardEvent } from 'react';

type AdminChatWorkspaceTab = 'open' | 'waiting_on_admin' | 'in_progress' | 'resolved' | 'all';

interface WorkspaceNavProps {
    statusTab: AdminChatWorkspaceTab;
    queueInsights: { waitingOnAdmin: number };
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    handleTabChange: (tab: AdminChatWorkspaceTab) => void;
    handleTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => void;
}

interface ChatwootNavSidebarProps {
    workspace: WorkspaceNavProps;
}

const NAV_ITEMS: { label: string; value: AdminChatWorkspaceTab }[] = [
    { label: 'Όλα', value: 'all' },
    { label: 'Ανοιχτά', value: 'open' },
    { label: 'Αναμένει απάντηση', value: 'waiting_on_admin' },
    { label: 'Σε εξέλιξη', value: 'in_progress' },
    { label: 'Λύθηκαν', value: 'resolved' },
];

export default function ChatwootNavSidebar({ workspace }: ChatwootNavSidebarProps) {
    const { statusTab, queueInsights, searchQuery, setSearchQuery, handleTabChange, handleTabKeyDown } = workspace;

    return (
        <div className="w-[180px] flex-shrink-0 h-full bg-[var(--cw-bg-sidebar)] border-r border-[var(--cw-border)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 h-11 flex-shrink-0 border-b border-[var(--cw-border)]">
                <span className="text-[13px] font-semibold text-[var(--cw-text-1)]">Συνομιλίες</span>
                {queueInsights.waitingOnAdmin > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold">
                        {queueInsights.waitingOnAdmin}
                    </span>
                )}
            </div>

            {/* Search */}
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
                        className="w-full h-7 rounded-md bg-white/[0.06] border border-[var(--cw-border)] pl-6 pr-2 text-[12px] text-[var(--cw-text-1)] placeholder-[var(--cw-text-3)] outline-none focus:border-[var(--cw-accent)]/40 focus:bg-white/[0.08] transition-colors"
                    />
                </div>
            </div>

            {/* Section label */}
            <div className="px-3 pt-2 pb-1 flex-shrink-0">
                <span className="text-[9px] font-semibold text-[var(--cw-text-3)] uppercase tracking-widest">
                    ΟΛΑ ΤΑ INBOXES
                </span>
            </div>

            {/* Vertical nav items */}
            <nav className="flex flex-col flex-shrink-0">
                {NAV_ITEMS.map((item, index) => {
                    const isActive = statusTab === item.value;
                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => handleTabChange(item.value)}
                            onKeyDown={(e) => handleTabKeyDown(e, index)}
                            className={[
                                'h-8 flex items-center px-3 text-[12px] font-medium transition-colors cursor-pointer text-left border-l-2',
                                isActive
                                    ? 'bg-[var(--cw-accent-dim)] text-[var(--cw-accent)] border-[var(--cw-accent)]'
                                    : 'text-[var(--cw-text-2)] border-transparent hover:bg-white/[0.04] hover:text-[var(--cw-text-1)]',
                            ].join(' ')}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
