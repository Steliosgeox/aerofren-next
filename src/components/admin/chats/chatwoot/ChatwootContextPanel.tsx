'use client';

import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Copy,
    Download,
    Mail,
    Phone,
    Globe,
    MapPin,
    Building2,
    Plus,
    Facebook,
    Twitter,
    Linkedin,
    MessageSquare,
    Edit2,
    Link2,
    Trash2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types (inline — matching workspace hook shape)
// ---------------------------------------------------------------------------

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

interface ChatwootContextPanelProps {
    workspace: AdminChatWorkspaceState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toneClass(tone?: 'default' | 'muted' | 'success' | 'warning'): string {
    switch (tone) {
        case 'warning': return 'text-amber-400';
        case 'success': return 'text-emerald-400';
        case 'muted':   return 'text-[var(--cw-text-3)]';
        default:        return 'text-[var(--cw-text-1)]';
    }
}

function getInitials(label: string): string {
    return label
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

// ---------------------------------------------------------------------------
// Accordion section component
// ---------------------------------------------------------------------------

function AccordionSection({
    title,
    open,
    onToggle,
    children,
    showPlus = true,
}: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    showPlus?: boolean;
}) {
    return (
        <div className="border-b border-[var(--cw-border)]">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
                <span className="text-[11px] font-semibold text-[var(--cw-text-1)]">{title}</span>
                <div className="flex items-center gap-1.5">
                    {showPlus && (
                        <Plus size={12} className="text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)]" />
                    )}
                    {open ? (
                        <ChevronDown size={12} className="text-[var(--cw-text-3)]" />
                    ) : (
                        <ChevronRight size={12} className="text-[var(--cw-text-3)]" />
                    )}
                </div>
            </button>
            {open && <div>{children}</div>}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Contact detail row
// ---------------------------------------------------------------------------

function DetailRow({
    icon,
    label,
    value,
    onCopy,
}: {
    icon: React.ReactNode;
    label?: string;
    value: string;
    onCopy?: () => void;
}) {
    return (
        <div className="flex items-center gap-2 px-4 py-1.5 group">
            <span className="flex-shrink-0 text-[var(--cw-text-3)] w-4">{icon}</span>
            <div className="flex-1 min-w-0">
                {label && (
                    <p className="text-[9px] text-[var(--cw-text-3)] uppercase tracking-wider leading-none mb-0.5">
                        {label}
                    </p>
                )}
                <p className="text-[12px] text-[var(--cw-text-1)] truncate leading-tight">{value}</p>
            </div>
            {onCopy && (
                <button
                    type="button"
                    onClick={onCopy}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all"
                    title="Αντιγραφή"
                >
                    <Copy size={11} />
                </button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatwootContextPanel({ workspace }: ChatwootContextPanelProps) {
    const [activeTab, setActiveTab] = useState<'contact' | 'copilot'>('contact');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        actions: true,
        participants: false,
        macros: false,
        attributes: false,
        info: true,
        previous: false,
    });

    const toggleSection = (key: string) =>
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

    const tabClass = (active: boolean) =>
        `flex-1 h-10 text-[11px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            active
                ? 'text-[var(--cw-accent)] border-[var(--cw-accent)]'
                : 'text-[var(--cw-text-3)] border-transparent hover:text-[var(--cw-text-2)]'
        }`;

    const selectPlaceholderClass =
        'flex items-center justify-between px-3 py-2 rounded border border-[var(--cw-border)] text-[11px] text-[var(--cw-text-3)] bg-white/[0.02] w-full cursor-pointer hover:bg-white/[0.04] transition-colors';

    if (!workspace.selectedSessionId) {
        return (
            <div className="w-[320px] flex-shrink-0 h-full bg-[var(--cw-bg-panel)] border-l border-[var(--cw-border)] flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-[11px] text-[var(--cw-text-3)]">Καμία επιλογή</p>
                </div>
            </div>
        );
    }

    const conv = workspace.currentConversation;
    const label = workspace.currentConversationLabel;

    return (
        <div className="w-[320px] flex-shrink-0 h-full bg-[var(--cw-bg-panel)] border-l border-[var(--cw-border)] flex flex-col">

            {/* ── Tab bar ───────────────────────────────────────────────── */}
            <div className="flex border-b border-[var(--cw-border)] flex-shrink-0">
                <button className={tabClass(activeTab === 'contact')} onClick={() => setActiveTab('contact')}>
                    Επικοινωνία
                </button>
                <button className={tabClass(activeTab === 'copilot')} onClick={() => setActiveTab('copilot')}>
                    Copilot
                </button>
            </div>

            {/* ── Content ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                {activeTab === 'contact' ? (
                    <>
                        {/* ── Contact card ─────────────────────────────── */}
                        <div className="px-4 pt-6 pb-4 flex flex-col items-center text-center border-b border-[var(--cw-border)]">
                            {/* Avatar */}
                            {conv?.userPhotoURL ? (
                                <img
                                    src={conv.userPhotoURL}
                                    alt={label}
                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--cw-border)]"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-[#2a3a4f] flex items-center justify-center text-[16px] font-bold text-[var(--cw-text-1)] ring-2 ring-[var(--cw-border)]">
                                    {getInitials(label)}
                                </div>
                            )}

                            {/* Name */}
                            <p className="text-[15px] font-semibold text-[var(--cw-text-1)] mt-3 leading-tight">
                                {label}
                            </p>

                            {/* Action icons row */}
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    type="button"
                                    title="Αντιγραφή Email"
                                    onClick={() => void workspace.handleCopy(conv?.userEmail ?? '', 'Email αντιγράφηκε')}
                                    className="w-8 h-8 rounded-full border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-[var(--cw-text-2)] transition-colors"
                                >
                                    <MessageSquare size={14} />
                                </button>
                                <button
                                    type="button"
                                    title="Επεξεργασία"
                                    className="w-8 h-8 rounded-full border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-[var(--cw-text-2)] transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    title="Σύνδεσμος"
                                    className="w-8 h-8 rounded-full border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-[var(--cw-text-2)] transition-colors"
                                >
                                    <Link2 size={14} />
                                </button>
                                <button
                                    type="button"
                                    title="Διαγραφή"
                                    className="w-8 h-8 rounded-full border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* ── Contact details rows ──────────────────────── */}
                        <div className="border-b border-[var(--cw-border)] py-1">
                            {conv?.userEmail && (
                                <DetailRow
                                    icon={<Mail size={13} />}
                                    value={conv.userEmail}
                                    onCopy={() => void workspace.handleCopy(conv.userEmail ?? '', 'Email αντιγράφηκε')}
                                />
                            )}
                            <DetailRow
                                icon={<Phone size={13} />}
                                value="—"
                            />
                            <DetailRow
                                icon={<Building2 size={13} />}
                                value="—"
                            />
                            <DetailRow
                                icon={<MapPin size={13} />}
                                value="—"
                            />
                            <DetailRow
                                icon={<Globe size={13} />}
                                value="aerofren.com"
                                onCopy={() => void workspace.handleCopy('aerofren.com', 'URL αντιγράφηκε')}
                            />
                        </div>

                        {/* ── Social icons ──────────────────────────────── */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--cw-border)]">
                            <button
                                type="button"
                                className="w-7 h-7 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                                title="Facebook"
                            >
                                <Facebook size={13} />
                            </button>
                            <button
                                type="button"
                                className="w-7 h-7 rounded-full bg-[#1da1f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                                title="Twitter"
                            >
                                <Twitter size={13} />
                            </button>
                            <button
                                type="button"
                                className="w-7 h-7 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                                title="LinkedIn"
                            >
                                <Linkedin size={13} />
                            </button>
                        </div>

                        {/* ── Conversation Actions ──────────────────────── */}
                        <AccordionSection
                            title="Conversation Actions"
                            open={openSections.actions}
                            onToggle={() => toggleSection('actions')}
                        >
                            <div className="px-4 pb-3 flex flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                        Ανάθεση σε
                                    </span>
                                    <button className={selectPlaceholderClass}>
                                        <span>Χωρίς ανάθεση</span>
                                        <ChevronDown size={11} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                        Ομάδα
                                    </span>
                                    <button className={selectPlaceholderClass}>
                                        <span>Χωρίς ομάδα</span>
                                        <ChevronDown size={11} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                        Ετικέτες συνομιλίας
                                    </span>
                                    <button className={selectPlaceholderClass}>
                                        <span>Προσθήκη ετικέτας</span>
                                        <Plus size={11} />
                                    </button>
                                </div>
                            </div>
                        </AccordionSection>

                        {/* ── Conversation participants ─────────────────── */}
                        <AccordionSection
                            title="Conversation participants"
                            open={openSections.participants}
                            onToggle={() => toggleSection('participants')}
                        >
                            <div className="px-4 pb-3">
                                <p className="text-[11px] text-[var(--cw-text-3)]">Δεν υπάρχουν συμμετέχοντες.</p>
                            </div>
                        </AccordionSection>

                        {/* ── Macros ────────────────────────────────────── */}
                        <AccordionSection
                            title="Macros"
                            open={openSections.macros}
                            onToggle={() => toggleSection('macros')}
                        >
                            <div className="px-4 pb-3">
                                <p className="text-[11px] text-[var(--cw-text-3)]">Δεν υπάρχουν macros.</p>
                            </div>
                        </AccordionSection>

                        {/* ── Contact Attributes ───────────────────────── */}
                        <AccordionSection
                            title="Contact Attributes"
                            open={openSections.attributes}
                            onToggle={() => toggleSection('attributes')}
                        >
                            <div className="px-4 pb-3">
                                <p className="text-[11px] text-[var(--cw-text-3)]">Δεν υπάρχουν attributes.</p>
                            </div>
                        </AccordionSection>

                        {/* ── Conversation Information ──────────────────── */}
                        <AccordionSection
                            title="Conversation Information"
                            open={openSections.info}
                            onToggle={() => toggleSection('info')}
                            showPlus={false}
                        >
                            <div>
                                {workspace.conversationDetails.map((detail) => (
                                    <div
                                        key={detail.label}
                                        className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--cw-border)] last:border-b-0"
                                    >
                                        <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                            {detail.label}
                                        </span>
                                        <span className={`text-[11px] font-medium ${toneClass(detail.tone)}`}>
                                            {detail.value}
                                        </span>
                                    </div>
                                ))}
                                {conv?.sessionId && (
                                    <div className="flex items-center justify-between px-4 py-1.5">
                                        <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                            Session ID
                                        </span>
                                        <button
                                            onClick={() => void workspace.handleCopy(conv.sessionId, 'Session ID αντιγράφηκε')}
                                            className="flex items-center gap-1 text-[11px] font-medium text-[var(--cw-text-2)] hover:text-[var(--cw-text-1)] transition-colors"
                                        >
                                            <span className="font-mono text-[10px] truncate max-w-[120px]">
                                                {conv.sessionId.slice(0, 8)}…
                                            </span>
                                            <Copy size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </AccordionSection>

                        {/* ── Previous Conversations ────────────────────── */}
                        <AccordionSection
                            title="Previous Conversations"
                            open={openSections.previous}
                            onToggle={() => toggleSection('previous')}
                        >
                            <div className="px-4 pb-3">
                                <p className="text-[11px] text-[var(--cw-text-3)]">Δεν υπάρχουν προηγούμενες συνομιλίες.</p>
                            </div>
                        </AccordionSection>

                        {/* ── Export ───────────────────────────────────── */}
                        <div className="px-4 py-3">
                            <button
                                onClick={workspace.exportToCSV}
                                className="flex items-center gap-2 text-[11px] text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)] transition-colors w-full text-left"
                            >
                                <Download size={12} />
                                Εξαγωγή CSV
                            </button>
                        </div>
                    </>
                ) : (
                    /* Copilot tab */
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                            <MessageSquare size={18} className="text-[var(--cw-text-3)]" />
                        </div>
                        <p className="text-[13px] font-medium text-[var(--cw-text-2)]">Copilot</p>
                        <p className="text-[11px] text-[var(--cw-text-3)]">
                            Ο AI βοηθός θα είναι σύντομα διαθέσιμος.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
