'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageCircle,
    ChevronUp,
    Search,
    PenLine,
    Inbox,
    FolderOpen,
    Users,
    Hash,
    Plus,
    X,
    Check,
    Trash2,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminChatWorkspaceTab = 'open' | 'waiting_on_admin' | 'in_progress' | 'resolved' | 'all';

type FolderDef = { id: string; name: string; filter: Record<string, string | null> };

interface WorkspaceNavProps {
    statusTab: AdminChatWorkspaceTab;
    queueInsights: { waitingOnAdmin: number };
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    handleTabChange: (tab: AdminChatWorkspaceTab) => void;
    handleTabKeyDown: (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => void;
    teams: { id: string; name: string }[];
    teamFilter: string | null;
    setTeamFilter: (id: string | null) => void;
    refreshTeams: () => Promise<void>;
    folders: FolderDef[];
    activeFolder: FolderDef | null;
    setActiveFolder: (folder: FolderDef | null) => void;
    refreshFolders: () => Promise<void>;
    createFolder: (name: string) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    userEmail: string | null;
}

interface ChatwootNavSidebarProps {
    workspace: WorkspaceNavProps;
    onNavigate?: () => void;
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionHeaderProps {
    icon: React.ReactNode;
    label: string;
    expanded: boolean;
    onToggle: () => void;
    badge?: number;
    onAdd?: () => void;
}

function SectionHeader({ icon, label, expanded, onToggle, badge, onAdd }: SectionHeaderProps) {
    return (
        <div className="flex items-center gap-0 min-w-0 w-full">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center gap-2 px-1.5 py-1 rounded-r-md h-8 min-w-0 flex-1 text-left text-[var(--cw-text-2)] hover:bg-white/[0.05] transition-colors"
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
            {onAdd && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAdd(); }}
                    className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.05] transition-colors"
                    title="Προσθήκη"
                >
                    <Plus size={11} />
                </button>
            )}
        </div>
    );
}

interface LeafItemProps {
    label: string;
    active: boolean;
    onClick: () => void;
    onDelete?: () => void;
}

function LeafItem({ label, active, onClick, onDelete }: LeafItemProps) {
    return (
        <li className="py-px pl-2 ml-3 relative child-item group/leaf">
            <button
                type="button"
                onClick={onClick}
                title={label}
                className={[
                    'flex h-7 items-center px-2 py-1 rounded-r-md w-full text-left min-w-0 transition-colors',
                    active
                        ? 'text-[var(--cw-text-1)] bg-[var(--cw-accent-dim)] font-medium border-l-2 border-l-[var(--cw-accent)]'
                        : 'text-[var(--cw-text-2)] hover:bg-white/[0.05]',
                ].join(' ')}
            >
                <span className="flex-1 truncate text-[12px]">{label}</span>
                {onDelete && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="opacity-0 group-hover/leaf:opacity-100 w-4 h-4 flex items-center justify-center rounded text-[var(--cw-text-3)] hover:text-red-400 transition-all flex-shrink-0"
                        title="Διαγραφή"
                    >
                        <Trash2 size={10} />
                    </button>
                )}
            </button>
        </li>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ChatwootNavSidebar({ workspace, onNavigate }: ChatwootNavSidebarProps) {
    const {
        statusTab, queueInsights, searchQuery, setSearchQuery, handleTabChange,
        teams, teamFilter, setTeamFilter,
        folders, activeFolder, setActiveFolder,
        createFolder, deleteFolder,
        userEmail,
    } = workspace;
    const router = useRouter();

    const [conversationsExpanded, setConversationsExpanded] = useState(true);
    const [foldersExpanded, setFoldersExpanded] = useState(true);
    const [teamsExpanded, setTeamsExpanded] = useState(true);
    const [channelsExpanded, setChannelsExpanded] = useState(true);

    const [creatingFolder, setCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [savingFolder, setSavingFolder] = useState(false);

    const waitingCount = queueInsights.waitingOnAdmin;

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setSavingFolder(true);
        try {
            await createFolder(newFolderName.trim());
            setNewFolderName('');
            setCreatingFolder(false);
        } catch {
            // ignore
        } finally {
            setSavingFolder(false);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        try {
            await deleteFolder(id);
        } catch {
            // ignore
        }
    };

    // Display name in footer — show first part of email or "Admin"
    const displayName = userEmail ? userEmail.split('@')[0] ?? 'Admin' : 'Admin';
    const displayDomain = userEmail ? userEmail.split('@')[1] ?? 'aerofren.gr' : 'aerofren.gr';

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
                            onClick={() => { handleTabChange('waiting_on_admin'); onNavigate?.(); }}
                            className={[
                                'flex items-center gap-2 px-1.5 py-1 rounded-r-md h-8 min-w-0 w-full text-left transition-colors',
                                statusTab === 'waiting_on_admin' && !teamFilter && !activeFolder
                                    ? 'text-[var(--cw-text-1)] bg-[var(--cw-accent-dim)] border-l-2 border-l-[var(--cw-accent)]'
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
                                        active={statusTab === item.value && !teamFilter && !activeFolder}
                                        onClick={() => { setTeamFilter(null); setActiveFolder(null); handleTabChange(item.value); onNavigate?.(); }}
                                    />
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Folders group */}
                    <li className="grid gap-0.5 select-none min-w-0">
                        <SectionHeader
                            icon={<FolderOpen size={14} />}
                            label="Φάκελοι"
                            expanded={foldersExpanded}
                            onToggle={() => setFoldersExpanded(!foldersExpanded)}
                            onAdd={() => { setFoldersExpanded(true); setCreatingFolder(true); }}
                        />
                        {foldersExpanded && (
                            <ul className="grid m-0 list-none sidebar-group-children min-w-0">
                                {folders.length === 0 && !creatingFolder && (
                                    <li className="py-px pl-2 ml-3">
                                        <span className="flex h-7 items-center px-2 text-[11px] text-[var(--cw-text-3)] italic">
                                            Δεν υπάρχουν φάκελοι
                                        </span>
                                    </li>
                                )}
                                {folders.map((folder) => (
                                    <LeafItem
                                        key={folder.id}
                                        label={folder.name}
                                        active={activeFolder?.id === folder.id}
                                        onClick={() => {
                                            setActiveFolder(activeFolder?.id === folder.id ? null : folder);
                                            setTeamFilter(null);
                                            onNavigate?.();
                                        }}
                                        onDelete={() => void handleDeleteFolder(folder.id)}
                                    />
                                ))}
                                {creatingFolder && (
                                    <li className="py-px pl-2 ml-3">
                                        <div className="flex items-center gap-1 h-7 px-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') void handleCreateFolder();
                                                    if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); }
                                                }}
                                                placeholder="Όνομα φακέλου..."
                                                className="flex-1 min-w-0 text-[11px] bg-transparent outline-none text-[var(--cw-text-1)] placeholder-[var(--cw-text-3)] border-b border-[var(--cw-border)]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => void handleCreateFolder()}
                                                disabled={savingFolder || !newFolderName.trim()}
                                                className="w-4 h-4 flex items-center justify-center text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                                            >
                                                <Check size={10} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setCreatingFolder(false); setNewFolderName(''); }}
                                                className="w-4 h-4 flex items-center justify-center text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)]"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    </li>
                                )}
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
                                {teams.length === 0 && (
                                    <li className="py-px pl-2 ml-3">
                                        <span className="flex h-7 items-center px-2 text-[11px] text-[var(--cw-text-3)] italic">
                                            Δεν υπάρχουν ομάδες
                                        </span>
                                    </li>
                                )}
                                {teams.map((team) => (
                                    <LeafItem
                                        key={team.id}
                                        label={team.name}
                                        active={teamFilter === team.id}
                                        onClick={() => {
                                            setTeamFilter(teamFilter === team.id ? null : team.id);
                                            setActiveFolder(null);
                                            onNavigate?.();
                                        }}
                                    />
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
                                <LeafItem
                                    label="Aerofren Chat"
                                    active={statusTab === 'all' && !teamFilter && !activeFolder}
                                    onClick={() => { setTeamFilter(null); setActiveFolder(null); handleTabChange('all'); onNavigate?.(); }}
                                />
                                <li className="py-px pl-2 ml-3 relative child-item">
                                    <button
                                        type="button"
                                        className="flex h-7 items-center px-2 rounded-r-md w-full text-left text-[var(--cw-text-3)] opacity-40 cursor-not-allowed"
                                    >
                                        <span className="flex-1 truncate text-[12px]">Aerofren Email</span>
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                </ul>
            </nav>

            {/* ── Profile footer ────────────────────────────────────────── */}
            <section className="flex-shrink-0 border-t border-[var(--cw-border)] px-2 py-2 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    title="Πίνακας διαχείρισης"
                    className="w-7 h-7 rounded-full bg-[var(--cw-accent)] flex items-center justify-center text-white text-[10px] font-bold select-none flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                    {displayName[0]?.toUpperCase() ?? 'A'}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[var(--cw-text-1)] truncate leading-tight">{displayName}</p>
                    <p className="text-[10px] text-[var(--cw-text-3)] truncate leading-tight">{displayDomain}</p>
                </div>
            </section>
        </aside>
    );
}
