'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Download, Mail, Phone, Link, Plus } from 'lucide-react';

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

interface ContactCardProps {
    conv: AdminChatConversation | null;
    label: string;
    onCopyEmail: () => void;
}

function ContactCard({ conv, label, onCopyEmail }: ContactCardProps) {
    return (
        <div className="pt-6 pb-4 px-4 flex flex-col items-center text-center border-b border-[var(--cw-border)]">
            {conv?.userPhotoURL ? (
                <img
                    src={conv.userPhotoURL}
                    alt={label}
                    className="w-12 h-12 rounded-full object-cover"
                />
            ) : (
                <div className="w-12 h-12 rounded-full bg-[#2a3a4f] flex items-center justify-center text-[14px] font-bold text-[var(--cw-text-1)]">
                    {getInitials(label)}
                </div>
            )}
            <p className="text-[14px] font-semibold text-[var(--cw-text-1)] mt-3 mb-0.5">
                {label}
            </p>
            {conv?.userEmail && (
                <p className="text-[11px] text-[var(--cw-text-3)]">
                    {conv.userEmail}
                </p>
            )}
            {/* Social action buttons */}
            <div className="flex items-center gap-2 mt-3">
                <button
                    title="Αντιγραφή Email"
                    onClick={onCopyEmail}
                    className="w-7 h-7 rounded-lg border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-[var(--cw-text-2)] transition-colors"
                >
                    <Mail size={13} />
                </button>
                <button
                    title="Τηλέφωνο"
                    className="w-7 h-7 rounded-lg border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-[var(--cw-text-2)] transition-colors"
                >
                    <Phone size={13} />
                </button>
                <button
                    title="Σύνδεσμος"
                    className="w-7 h-7 rounded-lg border border-[var(--cw-border)] flex items-center justify-center text-[var(--cw-text-3)] hover:bg-white/[0.06] hover:text-[var(--cw-text-2)] transition-colors"
                >
                    <Link size={13} />
                </button>
            </div>
        </div>
    );
}

export function ChatwootContextPanel({ workspace }: ChatwootContextPanelProps) {
    const [activeTab, setActiveTab] = useState<'conversation' | 'contact'>('conversation');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        details: true,
        actions: true,
        contactDetails: true,
    });

    const toggleSection = (key: string) =>
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

    const tabClass = (active: boolean) =>
        `h-10 px-4 text-[11px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
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

    return (
        <div className="w-[320px] flex-shrink-0 h-full bg-[var(--cw-bg-panel)] border-l border-[var(--cw-border)] flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-[var(--cw-border)]">
                <button
                    className={tabClass(activeTab === 'conversation')}
                    onClick={() => setActiveTab('conversation')}
                >
                    Πληροφορίες
                </button>
                <button
                    className={tabClass(activeTab === 'contact')}
                    onClick={() => setActiveTab('contact')}
                >
                    Επικοινωνία
                </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                {activeTab === 'conversation' ? (
                    <>
                        {/* Contact card */}
                        <ContactCard
                            conv={conv}
                            label={workspace.currentConversationLabel}
                            onCopyEmail={() =>
                                void workspace.handleCopy(
                                    conv?.userEmail ?? '',
                                    'Email αντιγράφηκε'
                                )
                            }
                        />

                        {/* Section: Στοιχεία Συνομιλίας */}
                        <div>
                            <button
                                className="flex items-center justify-between w-full px-4 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-[var(--cw-border)]"
                                onClick={() => toggleSection('details')}
                            >
                                <span className="text-[10px] font-semibold text-[var(--cw-text-2)] uppercase tracking-wider">
                                    Στοιχεία Συνομιλίας
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)]">
                                        <Plus size={12} />
                                    </span>
                                    {openSections.details ? (
                                        <ChevronDown size={12} className="text-[var(--cw-text-3)]" />
                                    ) : (
                                        <ChevronRight size={12} className="text-[var(--cw-text-3)]" />
                                    )}
                                </div>
                            </button>
                            {openSections.details && (
                                <div>
                                    {workspace.conversationDetails.map((detail) => (
                                        <div
                                            key={detail.label}
                                            className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--cw-border)] last:border-b-0"
                                        >
                                            <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                                {detail.label}
                                            </span>
                                            <span className={`text-[12px] font-medium ${toneClass(detail.tone)}`}>
                                                {detail.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section: Ενέργειες Συνομιλίας */}
                        <div>
                            <button
                                className="flex items-center justify-between w-full px-4 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-[var(--cw-border)]"
                                onClick={() => toggleSection('actions')}
                            >
                                <span className="text-[10px] font-semibold text-[var(--cw-text-2)] uppercase tracking-wider">
                                    Ενέργειες Συνομιλίας
                                </span>
                                {openSections.actions ? (
                                    <ChevronDown size={12} className="text-[var(--cw-text-3)]" />
                                ) : (
                                    <ChevronRight size={12} className="text-[var(--cw-text-3)]" />
                                )}
                            </button>
                            {openSections.actions && (
                                <div className="px-3 py-2 flex flex-col gap-2">
                                    {/* Assignee placeholder */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider px-1">
                                            Ανάθεση σε
                                        </span>
                                        <button className={selectPlaceholderClass}>
                                            <span>Χωρίς ανάθεση</span>
                                            <ChevronDown size={12} />
                                        </button>
                                    </div>
                                    {/* Team placeholder */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider px-1">
                                            Ομάδα
                                        </span>
                                        <button className={selectPlaceholderClass}>
                                            <span>Χωρίς ομάδα</span>
                                            <ChevronDown size={12} />
                                        </button>
                                    </div>
                                    {/* Action buttons */}
                                    <div className="flex flex-col gap-1 pt-1 border-t border-[var(--cw-border)]">
                                        <button
                                            onClick={() =>
                                                void workspace.handleCopy(
                                                    conv?.sessionId ?? '',
                                                    'Session ID αντιγράφηκε'
                                                )
                                            }
                                            className="flex items-center gap-2 text-[11px] text-[var(--cw-text-2)] hover:text-[var(--cw-text-1)] transition-colors w-full text-left py-0.5"
                                        >
                                            <Copy size={12} /> Αντιγραφή Session ID
                                        </button>
                                        <button
                                            onClick={() =>
                                                void workspace.handleCopy(
                                                    conv?.userEmail ?? '',
                                                    'Email αντιγράφηκε'
                                                )
                                            }
                                            className="flex items-center gap-2 text-[11px] text-[var(--cw-text-2)] hover:text-[var(--cw-text-1)] transition-colors w-full text-left py-0.5"
                                        >
                                            <Copy size={12} /> Αντιγραφή Email
                                        </button>
                                        <button
                                            onClick={workspace.exportToCSV}
                                            className="flex items-center gap-2 text-[11px] text-[var(--cw-text-2)] hover:text-[var(--cw-text-1)] transition-colors w-full text-left py-0.5"
                                        >
                                            <Download size={12} /> Εξαγωγή CSV
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Contact tab */
                    <>
                        <ContactCard
                            conv={conv}
                            label={workspace.currentConversationLabel}
                            onCopyEmail={() =>
                                void workspace.handleCopy(
                                    conv?.userEmail ?? '',
                                    'Email αντιγράφηκε'
                                )
                            }
                        />

                        {/* Section: Επικοινωνία Στοιχεία */}
                        <div>
                            <button
                                className="flex items-center justify-between w-full px-4 py-2.5 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-[var(--cw-border)]"
                                onClick={() => toggleSection('contactDetails')}
                            >
                                <span className="text-[10px] font-semibold text-[var(--cw-text-2)] uppercase tracking-wider">
                                    Επικοινωνία Στοιχεία
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[var(--cw-text-3)] hover:text-[var(--cw-text-2)]">
                                        <Plus size={12} />
                                    </span>
                                    {openSections.contactDetails ? (
                                        <ChevronDown size={12} className="text-[var(--cw-text-3)]" />
                                    ) : (
                                        <ChevronRight size={12} className="text-[var(--cw-text-3)]" />
                                    )}
                                </div>
                            </button>
                            {openSections.contactDetails && (
                                <div>
                                    {conv?.userEmail && (
                                        <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--cw-border)]">
                                            <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                                Email
                                            </span>
                                            <span className="text-[12px] font-medium text-[var(--cw-text-1)]">
                                                {conv.userEmail}
                                            </span>
                                        </div>
                                    )}
                                    {conv?.userId && (
                                        <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--cw-border)]">
                                            <span className="text-[10px] text-[var(--cw-text-3)] uppercase tracking-wider">
                                                User ID
                                            </span>
                                            <span className="text-[12px] font-medium text-[var(--cw-text-1)] truncate max-w-[160px]">
                                                {conv.userId}
                                            </span>
                                        </div>
                                    )}
                                    {!conv?.userEmail && !conv?.userId && (
                                        <div className="px-4 py-3 text-[11px] text-[var(--cw-text-3)]">
                                            Δεν υπάρχουν στοιχεία επικοινωνίας.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
