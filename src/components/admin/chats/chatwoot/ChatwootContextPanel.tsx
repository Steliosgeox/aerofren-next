'use client';

import React, { useState } from 'react';
import { ChevronRight, Copy, Download } from 'lucide-react';

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

export function ChatwootContextPanel({ workspace }: ChatwootContextPanelProps) {
    const [activeTab, setActiveTab] = useState<'contact' | 'info'>('contact');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        details: true,
        actions: true,
    });

    const toggleSection = (key: string) =>
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

    const tabClass = (active: boolean) =>
        `px-3 h-8 text-[11px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            active
                ? 'text-[var(--cw-accent)] border-[var(--cw-accent)]'
                : 'text-[var(--cw-text-3)] border-transparent hover:text-[var(--cw-text-2)]'
        }`;

    if (!workspace.selectedSessionId) {
        return (
            <div className="w-[260px] flex-shrink-0 h-full bg-[var(--cw-bg-panel)] border-l border-[var(--cw-border)] flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-[11px] text-[var(--cw-text-3)]">Καμία επιλογή</p>
                </div>
            </div>
        );
    }

    const conv = workspace.currentConversation;

    return (
        <div className="w-[260px] flex-shrink-0 h-full bg-[var(--cw-bg-panel)] border-l border-[var(--cw-border)] flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-[var(--cw-border)]">
                <button
                    className={tabClass(activeTab === 'contact')}
                    onClick={() => setActiveTab('contact')}
                >
                    Επικοινωνία
                </button>
                <button
                    className={tabClass(activeTab === 'info')}
                    onClick={() => setActiveTab('info')}
                >
                    Πληροφορίες
                </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
                {activeTab === 'contact' ? (
                    <>
                        {/* User card */}
                        <div className="pt-3 pb-2 px-3 flex flex-col items-center text-center border-b border-[var(--cw-border)]">
                            {conv?.userPhotoURL ? (
                                <img
                                    src={conv.userPhotoURL}
                                    alt={workspace.currentConversationLabel}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#2a3a4f] flex items-center justify-center text-[13px] font-bold text-[var(--cw-text-1)]">
                                    {getInitials(workspace.currentConversationLabel)}
                                </div>
                            )}
                            <p className="text-[13px] font-semibold text-[var(--cw-text-1)] mt-2">
                                {workspace.currentConversationLabel}
                            </p>
                            {conv?.userEmail && (
                                <p className="text-[11px] text-[var(--cw-text-3)]">
                                    {conv.userEmail}
                                </p>
                            )}
                        </div>

                        {/* Section: Στοιχεία Συνομιλίας */}
                        <div>
                            <button
                                className="flex items-center justify-between w-full px-3 py-2 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-[var(--cw-border)]"
                                onClick={() => toggleSection('details')}
                            >
                                <span className="text-[11px] font-semibold text-[var(--cw-text-2)] uppercase tracking-wider">
                                    Στοιχεία Συνομιλίας
                                </span>
                                <ChevronRight
                                    size={12}
                                    className={`text-[var(--cw-text-3)] transition-transform ${
                                        openSections.details ? 'rotate-90' : ''
                                    }`}
                                />
                            </button>
                            {openSections.details && (
                                <div>
                                    {workspace.conversationDetails.map((detail) => (
                                        <div
                                            key={detail.label}
                                            className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--cw-border)] last:border-b-0"
                                        >
                                            <span className="text-[11px] text-[var(--cw-text-3)]">
                                                {detail.label}
                                            </span>
                                            <span className={`text-[11px] font-medium ${toneClass(detail.tone)}`}>
                                                {detail.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section: Ενέργειες */}
                        <div>
                            <button
                                className="flex items-center justify-between w-full px-3 py-2 cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-[var(--cw-border)]"
                                onClick={() => toggleSection('actions')}
                            >
                                <span className="text-[11px] font-semibold text-[var(--cw-text-2)] uppercase tracking-wider">
                                    Ενέργειες
                                </span>
                                <ChevronRight
                                    size={12}
                                    className={`text-[var(--cw-text-3)] transition-transform ${
                                        openSections.actions ? 'rotate-90' : ''
                                    }`}
                                />
                            </button>
                            {openSections.actions && (
                                <div className="px-3 py-2 flex flex-col gap-1.5">
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
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <p className="text-[11px] text-[var(--cw-text-3)] text-center">
                            Δεν υπάρχουν επιπλέον πληροφορίες.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
