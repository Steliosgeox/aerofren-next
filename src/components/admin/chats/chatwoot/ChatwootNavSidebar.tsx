'use client';

import { useState } from 'react';
import { MessageCircle, ChevronUp, Search, PenLine } from 'lucide-react';
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
// Conversations group children — maps our statusTab to Chatwoot's nav items
// ---------------------------------------------------------------------------

const CONVERSATION_CHILDREN: { label: string; value: AdminChatWorkspaceTab }[] = [
    { label: 'Όλες οι συνομιλίες', value: 'all' },
    { label: 'Ανοιχτά', value: 'open' },
    { label: 'Αναμένει απάντηση', value: 'waiting_on_admin' },
    { label: 'Σε εξέλιξη', value: 'in_progress' },
    { label: 'Λύθηκαν', value: 'resolved' },
];

// ---------------------------------------------------------------------------
// Component
// Mechanical Vue→React translation of:
//   Sidebar.vue        (wrapper, brand, search row, nav, profile footer)
//   SidebarGroup.vue   (expandable group with children)
//   SidebarGroupHeader.vue (h-8, icon, label, chevron)
//   SidebarGroupLeaf.vue   (child item with tree lines via .child-item CSS)
//
// Width: w-[200px] — exact match to Chatwoot source
//   class="w-[200px] md:w-auto ... bg-n-background"
// ---------------------------------------------------------------------------

export default function ChatwootNavSidebar({ workspace }: ChatwootNavSidebarProps) {
    const { statusTab, queueInsights, searchQuery, setSearchQuery, handleTabChange } = workspace;

    // Default expanded — Chatwoot auto-expands when there's an active child
    const [conversationsExpanded, setConversationsExpanded] = useState(true);

    const waitingCount = queueInsights.waitingOnAdmin;
    const hasActiveChild = CONVERSATION_CHILDREN.some((c) => c.value === statusTab);

    return (
        <aside className="w-[200px] flex-shrink-0 h-full bg-[var(--cw-bg-sidebar)] border-r border-[var(--cw-border)] flex flex-col text-sm pb-px">

            {/* ── Top section ─────────────────────────────────────────────────────────
                Mirrors Sidebar.vue: <section class="mt-1 mb-4 gap-2 grid">           */}
            <section className="mt-1 mb-4 gap-2 grid">

                {/* Brand row: logo + separator + workspace name
                    Mirrors: <div class="flex gap-2 items-center min-w-0 px-2">       */}
                <div className="flex gap-2 items-center min-w-0 px-2">
                    {/* Logo — <div class="grid flex-shrink-0 place-content-center size-6"><Logo /></div> */}
                    <div className="grid flex-shrink-0 place-content-center size-6">
                        <div className="size-4 rounded-sm bg-[var(--cw-accent)] flex items-center justify-center">
                            <span className="text-[7px] font-black text-white leading-none select-none">A</span>
                        </div>
                    </div>
                    {/* Separator — <div class="flex-shrink-0 w-px h-3 bg-n-strong" /> */}
                    <div className="flex-shrink-0 w-px h-3 bg-white/10" />
                    {/* Workspace name — SidebarAccountSwitcher */}
                    <span className="truncate text-[13px] font-semibold text-[var(--cw-text-1)] flex-grow">
                        Aerofren
                    </span>
                    {waitingCount > 0 && (
                        <span className="size-2 rounded-full bg-[var(--cw-accent)] flex-shrink-0" />
                    )}
                </div>

                {/* Search + compose row
                    Mirrors: <div class="flex gap-2 px-2"> + RouterLink search + Button compose */}
                <div className="flex gap-2 px-2">
                    {/* Search: <RouterLink class="flex gap-2 items-center px-2 py-1 w-full h-7 rounded-lg outline outline-1 outline-n-weak bg-n-button-color"> */}
                    <div className="flex items-center gap-2 px-2 w-full h-7 rounded-lg outline outline-1 outline-[var(--cw-border)] bg-white/[0.04] flex-1 cursor-text">
                        <Search size={13} className="flex-shrink-0 text-[var(--cw-text-3)] pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Αναζήτηση..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-grow text-[12px] text-[var(--cw-text-2)] placeholder-[var(--cw-text-3)] bg-transparent outline-none"
                        />
                    </div>
                    {/* Compose button: <Button icon="i-lucide-pen-line" size="sm" class="!h-7 !outline-n-weak"> */}
                    <button
                        type="button"
                        title="Νέα συνομιλία"
                        className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-lg outline outline-1 outline-[var(--cw-border)] bg-white/[0.04] text-[var(--cw-text-2)] hover:bg-white/[0.06] transition-colors"
                    >
                        <PenLine size={13} />
                    </button>
                </div>
            </section>

            {/* ── Nav ─────────────────────────────────────────────────────────────────
                Mirrors Sidebar.vue: <nav class="grid overflow-y-scroll flex-grow gap-2 pb-5 px-2"> */}
            <nav className="overflow-y-auto flex-grow px-2 pb-5 [scrollbar-width:none]">
                <ul className="flex flex-col gap-1 m-0 list-none min-w-0">

                    {/* ── Conversations SidebarGroup ──────────────────────────────────
                        Mirrors: <li class="grid gap-1 text-sm cursor-pointer select-none min-w-0"> */}
                    <li className="grid gap-1 text-sm cursor-pointer select-none min-w-0">

                        {/* SidebarGroupHeader: h-8, gap-2, px-1.5, py-1, rounded-lg
                            Active-child: "text-n-slate-12 font-medium"
                            Inactive:     "text-n-slate-11 hover:bg-n-alpha-2"           */}
                        <button
                            type="button"
                            onClick={() => setConversationsExpanded(!conversationsExpanded)}
                            className={[
                                'flex items-center gap-2 px-1.5 py-1 rounded-lg h-8 min-w-0 w-full text-left',
                                hasActiveChild
                                    ? 'text-[var(--cw-text-1)] font-medium'
                                    : 'text-[var(--cw-text-2)] hover:bg-white/[0.08]',
                            ].join(' ')}
                        >
                            {/* <div class="relative flex items-center gap-2"><Icon /></div> */}
                            <MessageCircle size={16} className="flex-shrink-0" />

                            {/* <div class="flex items-center gap-1.5 flex-grow min-w-0 flex-1"> */}
                            <div className="flex items-center gap-1.5 flex-grow min-w-0 flex-1">
                                <span className="truncate text-[13px]">Συνομιλίες</span>
                                {/* Count badge when collapsed */}
                                {waitingCount > 0 && !conversationsExpanded && (
                                    <span className="rounded-md text-[10px] leading-5 font-medium px-1 outline outline-1 outline-white/20 text-[var(--cw-text-2)] flex-shrink-0">
                                        {waitingCount > 99 ? '99+' : waitingCount}
                                    </span>
                                )}
                            </div>

                            {/* Chevron: v-show="isExpanded" class="i-lucide-chevron-up size-3" */}
                            <ChevronUp
                                size={12}
                                className={`flex-shrink-0 text-[var(--cw-text-3)] transition-transform duration-150 ${
                                    conversationsExpanded ? '' : 'rotate-180'
                                }`}
                            />
                        </button>

                        {/* SidebarGroup children: <ul class="grid m-0 list-none sidebar-group-children min-w-0">
                            v-show="isExpanded || hasActiveChild"                        */}
                        {conversationsExpanded && (
                            <ul className="grid m-0 list-none sidebar-group-children min-w-0">
                                {CONVERSATION_CHILDREN.map((item) => {
                                    const isActive = statusTab === item.value;
                                    return (
                                        // SidebarGroupLeaf: <li class="py-0.5 ltr:pl-2 ltr:ml-3 relative text-n-slate-11 child-item
                                        //   before:bg-n-slate-4 after:bg-transparent after:border-n-slate-4 before:left-0">
                                        <li
                                            key={item.value}
                                            className="py-0.5 pl-2 ml-3 relative text-[var(--cw-text-2)] child-item"
                                        >
                                            {/* <router-link class="flex h-8 items-center gap-2 px-2 py-1 rounded-lg
                                                hover:bg-gradient-to-r from-transparent via-n-slate-3/70 to-n-slate-3/70">
                                                Active: "text-n-slate-12 bg-n-alpha-2"                                */}
                                            <button
                                                type="button"
                                                onClick={() => handleTabChange(item.value)}
                                                title={item.label}
                                                className={[
                                                    'flex h-8 items-center gap-2 px-2 py-1 rounded-lg w-full text-left min-w-0',
                                                    isActive
                                                        ? 'text-[var(--cw-text-1)] bg-white/[0.08]'
                                                        : 'hover:bg-gradient-to-r from-transparent via-white/[0.04] to-white/[0.04]',
                                                ].join(' ')}
                                            >
                                                <div className="flex-1 truncate min-w-0 text-[12px]">
                                                    {item.label}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </li>

                </ul>
            </nav>

            {/* ── Bottom: profile ──────────────────────────────────────────────────────
                Mirrors Sidebar.vue: <div class="px-1 py-1.5 flex-shrink-0 flex w-full z-50 gap-2 items-center border-t border-n-weak"> */}
            <section className="flex-shrink-0 border-t border-[var(--cw-border)] px-1 py-1.5 flex items-center gap-2">
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
