'use client';

import { useState } from 'react';
import {
    MessageCircle,
    ChevronUp,
    Search,
    PenLine,
    Inbox,
    FolderOpen,
    Users,
    Hash,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Nav data
// ---------------------------------------------------------------------------

const CONVERSATION_CHILDREN: { label: string; value: AdminChatWorkspaceTab }[] = [
    { label: 'Όλες οι συνομιλίες', value: 'all' },
    { label: 'Ανοιχτά', value: 'open' },
    { label: 'Αναμένει απάντηση', value: 'waiting_on_admin' },
    { label: 'Σε εξέλιξη', value: 'in_progress' },
    { label: 'Λύθηκαν', value: 'resolved' },
];

const TEAM_ITEMS = ['Aerofren Sales', 'Aerofren Support'];
const CHANNEL_ITEMS = ['Aerofren Chat', 'Aerofren Email'];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
    icon: React.ReactNode;
    label: string;
    expanded: boolean;
    onToggle: () => void;
    badge?: number;
}

function SectionHeader({ icon, label, expanded, onToggle, badge }: SectionHeaderProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 px-1.5 py-1 rounded-lg h-8 min-w-0 w-full text-left text-[var(--cw-text-2)] hover:bg-white/[0.05] transition-colors"
        >
            <span className="flex-shrink-0 text-[var(--cw-text-3)]">{icon}</span>
            <span className="flex-1 truncate text-[12px] font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="text-[9px] leading-4 font-semibold rounded-md px-1 bg-white/[0.08] text-[var(--cw-text-2)] flex-shrink-0">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
            <ChevronUp
                size={11}
                className={`flex-shrink-0 text-[var(--cw-text-3)] transition-transform duration-150 ${expanded ? '' : 'rotate-180'}`}
            />
        </button>
    );
}

interface LeafItemProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

function LeafItem({ label, active, onClick }: LeafItemProps) {
    return (
        <li className="py-px pl-2 ml-3 relative child-item">
            <button
                type="button"
                onClick={onClick}
                title={label}
                className={[
                    'flex h-7 items-center px-2 py-1 rounded-lg w-full text-left min-w-0 transition-colors',
                    active
                        ? 'text-[var(--cw-text-1)] bg-[var(--cw-accent-dim)] font-medium'
                        : 'text-[var(--cw-text-2)] hover:bg-white/[0.05]',
                ].join(' ')}
            >
                <span className="flex-1 truncate text-[12px]">{label}</span>
            </button>
        </li>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ChatwootNavSidebar({ workspace }: ChatwootNavSidebarProps) {
    const { statusTab, queueInsights, searchQuery, setSearchQuery, handleTabChange } = workspace;

    const [conversationsExpanded, setConversationsExpanded] = useState(true);
    const [foldersExpanded, setFoldersExpanded] = useState(false);
    const [teamsExpanded, setTeamsExpanded] = useState(true);
    const [channelsExpanded, setChannelsExpanded] = useState(true);

    const waitingCount = queueInsights.waitingOnAdmin;

    return (
        <aside className="w-[220px] flex-shrink-0 h-full bg-[var(--cw-bg-sidebar)] border-r border-[var(--cw-border)] flex flex-col text-sm">

            {/* ── Top section ─────────────────────────────────────────────── */}
            <section className="pt-2 pb-1.5 px-2 flex flex-col gap-1.5 flex-shrink-0">

                {/* Brand row */}
                <div className="flex gap-2 items-center min-w-0 px-1 h-8">
                    <div className="grid flex-shrink-0 place-content-center size-6">
                        <div className="size-5 rounded bg-[var(--cw-accent)] flex items-center justify-center">
                            <span className="text-[8px] font-black text-white leading-none select-none">A</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 w-px h-3 bg-white/10" />
                    <span className="truncate text-[13px] font-semibold text-[var(--cw-text-1)] flex-grow">
                        Aerofren
                    </span>
                    {waitingCount > 0 && (
                        <span className="size-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                </div>

                {/* Search + compose */}
                <div className="flex gap-1.5 px-1">
                    <div className="flex items-center gap-1.5 px-2 h-8 rounded-lg border border-[var(--cw-border)] bg-white/[0.03] flex-1 cursor-text">
                        <Search size={12} className="flex-shrink-0 text-[var(--cw-text-3)] pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Αναζήτηση..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-grow text-[12px] text-[var(--cw-text-2)] placeholder-[var(--cw-text-3)] bg-transparent outline-none"
                        />
                    </div>
                    <button
                        type="button"
                        title="Νέα συνομιλία"
                        className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-[var(--cw-border)] bg-white/[0.03] text-[var(--cw-text-2)] hover:bg-white/[0.06] transition-colors"
                    >
                        <PenLine size={13} />
                    </button>
                </div>
            </section>

            {/* ── Nav ────────────────────────────────────────────────────── */}
            <nav className="overflow-y-auto flex-grow px-2 pb-4 [scrollbar-width:none]">
                <ul className="flex flex-col gap-0.5 m-0 list-none min-w-0">

                    {/* My Inbox — standalone flat item */}
                    <li>
                        <button
                            type="button"
                            onClick={() => handleTabChange('waiting_on_admin')}
                            className={[
                                'flex items-center gap-2 px-1.5 py-1 rounded-lg h-8 min-w-0 w-full text-left transition-colors',
                                statusTab === 'waiting_on_admin'
                                    ? 'text-[var(--cw-text-1)] bg-[var(--cw-accent-dim)]'
                                    : 'text-[var(--cw-text-2)] hover:bg-white/[0.05]',
                            ].join(' ')}
                        >
                            <Inbox size={14} className="flex-shrink-0 text-[var(--cw-text-3)]" />
                            <span className="flex-1 truncate text-[12px] font-medium">Τα εισερχόμενά μου</span>
                            {waitingCount > 0 && (
                                <span className="text-[9px] leading-4 font-semibold rounded-md px-1.5 bg-[var(--cw-accent-dim)] text-[var(--cw-accent)] flex-shrink-0">
                                    {waitingCount > 99 ? '99+' : waitingCount}
                                </span>
                            )}
                        </button>
                    </li>

                    {/* Conversations group */}
                    <li className="grid gap-0.5 cursor-pointer select-none min-w-0">
                        <SectionHeader
                            icon={<MessageCircle size={14} />}
                            label="Συνομιλίες"
                            expanded={conversationsExpanded}
                            onToggle={() => setConversationsExpanded(!conversationsExpanded)}
                            badge={waitingCount}
                        />
                        {conversationsExpanded && (
                            <ul className="grid m-0 list-none sidebar-group-children min-w-0">
                                {CONVERSATION_CHILDREN.map((item) => (
                                    <LeafItem
                                        key={item.value}
                                        label={item.label}
                                        active={statusTab === item.value}
                                        onClick={() => handleTabChange(item.value)}
                                    />
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Folders group */}
                    <li className="grid gap-0.5 cursor-pointer select-none min-w-0">
                        <SectionHeader
                            icon={<FolderOpen size={14} />}
                            label="Φάκελοι"
                            expanded={foldersExpanded}
                            onToggle={() => setFoldersExpanded(!foldersExpanded)}
                        />
                        {foldersExpanded && (
                            <ul className="grid m-0 list-none sidebar-group-children min-w-0">
                                <li className="py-px pl-2 ml-3">
                                    <span className="flex h-7 items-center px-2 text-[11px] text-[var(--cw-text-3)] italic">
                                        Δεν υπάρχουν φάκελοι
                                    </span>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Teams group */}
                    <li className="grid gap-0.5 cursor-pointer select-none min-w-0">
                        <SectionHeader
                            icon={<Users size={14} />}
                            label="Ομάδες"
                            expanded={teamsExpanded}
                            onToggle={() => setTeamsExpanded(!teamsExpanded)}
                        />
                        {teamsExpanded && (
                            <ul className="grid m-0 list-none sidebar-group-children min-w-0">
                                {TEAM_ITEMS.map((team) => (
                                    <li key={team} className="py-px pl-2 ml-3 relative child-item">
                                        <button
                                            type="button"
                                            className="flex h-7 items-center px-2 rounded-lg w-full text-left text-[var(--cw-text-2)] hover:bg-white/[0.05] transition-colors"
                                        >
                                            <span className="flex-1 truncate text-[12px]">{team}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Channels group */}
                    <li className="grid gap-0.5 cursor-pointer select-none min-w-0">
                        <SectionHeader
                            icon={<Hash size={14} />}
                            label="Κανάλια"
                            expanded={channelsExpanded}
                            onToggle={() => setChannelsExpanded(!channelsExpanded)}
                        />
                        {channelsExpanded && (
                            <ul className="grid m-0 list-none sidebar-group-children min-w-0">
                                {CHANNEL_ITEMS.map((ch) => (
                                    <li key={ch} className="py-px pl-2 ml-3 relative child-item">
                                        <button
                                            type="button"
                                            className="flex h-7 items-center px-2 rounded-lg w-full text-left text-[var(--cw-text-2)] hover:bg-white/[0.05] transition-colors"
                                        >
                                            <span className="flex-1 truncate text-[12px]">{ch}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                </ul>
            </nav>

            {/* ── Profile footer ────────────────────────────────────────── */}
            <section className="flex-shrink-0 border-t border-[var(--cw-border)] px-2 py-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--cw-accent)] flex items-center justify-center text-white text-[10px] font-bold select-none flex-shrink-0">
                    A
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[var(--cw-text-1)] truncate leading-tight">Admin</p>
                    <p className="text-[10px] text-[var(--cw-text-3)] truncate leading-tight">aerofren.com</p>
                </div>
            </section>
        </aside>
    );
}
