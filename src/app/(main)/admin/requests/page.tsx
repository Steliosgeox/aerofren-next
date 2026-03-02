'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Loader2, AlertTriangle, Mail, Search, RefreshCw, CheckCircle,
    Clock, ChevronRight, ExternalLink, Phone, Building2, Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin';
import { useAuth } from '@/contexts/AuthContext';
import {
    EscalatedChat, fetchEscalations, resolveEscalation,
    ContactSubmission, fetchContactSubmissionsPage, updateContactStatus,
} from '@/services/admin';

// ── STATUS CONFIG ──────────────────────────────────────────────────────────
const ESCALATION_STATUS_CONFIG = {
    pending:     { label: 'Σε αναμονή',   classes: 'bg-yellow-500/15 text-yellow-400' },
    in_progress: { label: 'Σε εξέλιξη',   classes: 'bg-[var(--theme-accent)]/15 text-[var(--theme-accent)]' },
    resolved:    { label: 'Ολοκληρώθηκε', classes: 'bg-green-500/15 text-green-400' },
} as const;

const CONTACT_STATUS_CONFIG = {
    new:     { label: 'Νέο',        classes: 'bg-amber-500/15 text-amber-400' },
    read:    { label: 'Διαβάστηκε', classes: 'bg-blue-500/15 text-blue-400' },
    replied: { label: 'Απαντήθηκε', classes: 'bg-green-500/15 text-green-400' },
} as const;

function StatusBadge({ status, type }: { status: string; type: 'escalation' | 'contact' }) {
    const config = type === 'escalation'
        ? ESCALATION_STATUS_CONFIG[status as keyof typeof ESCALATION_STATUS_CONFIG]
        : CONTACT_STATUS_CONFIG[status as keyof typeof CONTACT_STATUS_CONFIG];
    if (!config) return null;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${config.classes}`}>
            {config.label}
        </span>
    );
}

function formatTime(ts: string | Date | null | undefined) {
    const d = typeof ts === 'string' ? new Date(ts) : ts instanceof Date ? ts : new Date();
    return d.toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── ESCALATION DETAIL ──────────────────────────────────────────────────────
function EscalationDetail({ chat, onResolve }: { chat: EscalatedChat; onResolve: () => void }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-5 flex items-start justify-between gap-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                <div>
                    <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{chat.userName || 'Ανώνυμος'}</p>
                    <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{chat.userEmail}</p>
                    <div className="mt-2">
                        <StatusBadge status={chat.status} type="escalation" />
                    </div>
                </div>
                <p className="text-xs shrink-0" style={{ color: 'var(--theme-text-muted)' }}>{formatTime(chat.escalatedAt)}</p>
            </div>
            <div className="p-5 flex flex-col gap-3">
                <Link
                    href={`/admin/chats?session=${chat.sessionId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--theme-accent)', color: 'white' }}
                >
                    <ExternalLink className="w-4 h-4" />
                    Προβολή συνομιλίας
                </Link>
                {chat.status !== 'resolved' && (
                    <button
                        onClick={onResolve}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 bg-green-500/15 text-green-400 hover:bg-green-500/25"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Επίλυση αιτήματος
                    </button>
                )}
                <div className="mt-2 space-y-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    <p><span className="font-medium" style={{ color: 'var(--theme-text)' }}>ID συνεδρίας:</span> {chat.sessionId.slice(0, 20)}...</p>
                    {chat.resolvedBy && <p><span className="font-medium" style={{ color: 'var(--theme-text)' }}>Επιλύθηκε από:</span> {chat.resolvedBy}</p>}
                </div>
            </div>
        </div>
    );
}

// ── CONTACT DETAIL ─────────────────────────────────────────────────────────
function ContactDetail({ contact, onStatusChange }: {
    contact: ContactSubmission;
    onStatusChange: (status: ContactSubmission['status']) => void;
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-5" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{contact.name}</p>
                        <p className="text-sm" style={{ color: 'var(--theme-accent)' }}>{contact.email}</p>
                    </div>
                    <StatusBadge status={contact.status} type="contact" />
                </div>
                {contact.subject && (
                    <p className="mt-3 font-semibold" style={{ color: 'var(--theme-text)' }}>{contact.subject}</p>
                )}
                <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>{formatTime(contact.submittedAt)}</p>
            </div>
            <div className="p-5 flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-4 mb-4 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    {contact.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone}
                        </span>
                    )}
                    {contact.company && (
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {contact.company}
                        </span>
                    )}
                </div>
                <div
                    className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--theme-glass-border)',
                        color: 'var(--theme-text)',
                    }}
                >
                    {contact.message}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                    <a
                        href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Επικοινωνία AEROFREN')}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold hover:-translate-y-0.5 transition-all"
                        style={{ background: 'var(--theme-accent)', color: 'white' }}
                        onClick={() => onStatusChange('replied')}
                    >
                        <Mail className="w-4 h-4" />
                        Απάντηση μέσω email
                    </a>
                    {contact.status !== 'replied' && (
                        <div className="flex gap-2">
                            {contact.status === 'new' && (
                                <button
                                    onClick={() => onStatusChange('read')}
                                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                                >
                                    Σήμανση ως διαβασμένο
                                </button>
                            )}
                            <button
                                onClick={() => onStatusChange('replied')}
                                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors bg-green-500/15 text-green-400 hover:bg-green-500/25"
                            >
                                Σήμανση ως απαντημένο
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
type Tab = 'escalations' | 'contacts';

function RequestsPageContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<Tab>(
        (searchParams.get('tab') as Tab) ?? 'escalations'
    );
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [escalations, setEscalations] = useState<EscalatedChat[]>([]);
    const [selectedEscalation, setSelectedEscalation] = useState<EscalatedChat | null>(null);

    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const [escs, contactsPage] = await Promise.all([
                fetchEscalations(user),
                fetchContactSubmissionsPage(user, { limit: 50 }),
            ]);
            setEscalations(escs);
            setContacts(contactsPage.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Αποτυχία φόρτωσης δεδομένων.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Auto-mark contact as read when selected
    const handleContactStatusChange = useCallback(async (id: string, status: ContactSubmission['status']) => {
        if (!user) return;
        await updateContactStatus(user, id, status);
        setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
        setSelectedContact((prev) => prev?.id === id ? { ...prev, status } : prev);
    }, [user]);

    useEffect(() => {
        if (selectedContact && selectedContact.status === 'new') {
            handleContactStatusChange(selectedContact.id, 'read');
        }
    }, [selectedContact?.id, selectedContact?.status, handleContactStatusChange]);

    const handleResolveEscalation = async (sessionId: string) => {
        if (!user) return;
        await resolveEscalation(user, sessionId);
        await fetchAll();
        setSelectedEscalation(null);
    };

    const filteredEscalations = escalations.filter((e) =>
        !search ||
        e.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        e.userName?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredContacts = contacts.filter((c) =>
        !search ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const pendingEscalations = escalations.filter((e) => e.status === 'pending').length;
    const newContacts = contacts.filter((c) => c.status === 'new').length;

    const refreshButton = (
        <button
            onClick={fetchAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all text-[var(--theme-text)] border border-[var(--theme-glass-border)] hover:bg-white/5 disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Ανανέωση
        </button>
    );

    return (
        <AdminLayout title="Αιτήματα" headerRight={refreshButton}>
            {error && (
                <div
                    className="mb-5 p-4 rounded-xl text-sm bg-[var(--theme-accent)]/10"
                    style={{ border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)', color: 'var(--theme-text)' }}
                >
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
                {([
                    { tab: 'escalations' as Tab, label: 'Κλιμακώσεις AI', count: pendingEscalations, icon: <AlertTriangle className="w-4 h-4" /> },
                    { tab: 'contacts' as Tab, label: 'Φόρμα Επικοινωνίας', count: newContacts, icon: <Mail className="w-4 h-4" /> },
                ] as const).map(({ tab, label, count, icon }) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedEscalation(null); setSelectedContact(null); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: activeTab === tab
                                ? 'linear-gradient(135deg, var(--theme-accent), var(--theme-accent-hover))'
                                : 'var(--theme-glass-bg)',
                            color: activeTab === tab ? 'white' : 'var(--theme-text-muted)',
                            border: activeTab === tab ? 'none' : '1px solid var(--theme-glass-border)',
                        }}
                    >
                        {icon}
                        {label}
                        {count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === tab ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* 3-column: list + detail */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* List panel */}
                <div
                    className="lg:col-span-1 rounded-xl overflow-hidden"
                    style={{
                        background: 'var(--theme-glass-bg)',
                        border: '1px solid var(--theme-glass-border)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="p-4" style={{ borderBottom: '1px solid var(--theme-glass-border)' }}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--theme-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Αναζήτηση..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-transparent outline-none border border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
                            />
                        </div>
                    </div>

                    <div className="divide-y max-h-[60vh] overflow-y-auto" style={{ borderColor: 'var(--theme-glass-border)' }}>
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-accent)]" />
                            </div>
                        ) : activeTab === 'escalations' ? (
                            filteredEscalations.length === 0 ? (
                                <div className="py-10 text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                                    Δεν υπάρχουν κλιμακώσεις.
                                </div>
                            ) : filteredEscalations.map((esc) => (
                                <button
                                    key={esc.sessionId}
                                    onClick={() => setSelectedEscalation(esc)}
                                    className="w-full p-4 text-left transition-colors hover:bg-white/3"
                                    style={{
                                        background: selectedEscalation?.sessionId === esc.sessionId
                                            ? 'color-mix(in srgb, var(--theme-accent) 15%, transparent)'
                                            : 'transparent',
                                        borderLeft: selectedEscalation?.sessionId === esc.sessionId
                                            ? '3px solid var(--theme-accent)'
                                            : '3px solid transparent',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>
                                            {esc.userName || esc.userEmail || 'Ανώνυμος'}
                                        </span>
                                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-text-muted)' }} />
                                    </div>
                                    {esc.userEmail && (
                                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                                            {esc.userEmail}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <StatusBadge status={esc.status} type="escalation" />
                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                            <Clock className="w-3 h-3" />{formatTime(esc.escalatedAt)}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            filteredContacts.length === 0 ? (
                                <div className="py-10 text-center text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                                    Δεν υπάρχουν μηνύματα.
                                </div>
                            ) : filteredContacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className="w-full p-4 text-left transition-colors hover:bg-white/3"
                                    style={{
                                        background: selectedContact?.id === contact.id
                                            ? 'color-mix(in srgb, var(--theme-accent) 15%, transparent)'
                                            : 'transparent',
                                        borderLeft: selectedContact?.id === contact.id
                                            ? '3px solid var(--theme-accent)'
                                            : '3px solid transparent',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm truncate" style={{ color: 'var(--theme-text)' }}>
                                            {contact.name}
                                        </span>
                                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-text-muted)' }} />
                                    </div>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--theme-text)' }}>
                                        {contact.subject || contact.message.slice(0, 40)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StatusBadge status={contact.status} type="contact" />
                                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                            <Clock className="w-3 h-3" />{formatTime(contact.submittedAt)}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail panel */}
                <div
                    className="lg:col-span-2 rounded-xl overflow-hidden"
                    style={{
                        background: 'var(--theme-glass-bg)',
                        border: '1px solid var(--theme-glass-border)',
                        backdropFilter: 'blur(20px)',
                        minHeight: '400px',
                    }}
                >
                    {activeTab === 'escalations' && selectedEscalation ? (
                        <EscalationDetail
                            chat={selectedEscalation}
                            onResolve={() => handleResolveEscalation(selectedEscalation.sessionId)}
                        />
                    ) : activeTab === 'contacts' && selectedContact ? (
                        <ContactDetail
                            contact={selectedContact}
                            onStatusChange={(status) => handleContactStatusChange(selectedContact.id, status)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--theme-text-muted)' }}>
                            <Inbox className="w-12 h-12 mb-3 opacity-40" />
                            <p className="text-sm">Επιλέξτε ένα αίτημα για να δείτε τις λεπτομέρειες.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default function RequestsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
                </div>
            }
        >
            <RequestsPageContent />
        </Suspense>
    );
}
