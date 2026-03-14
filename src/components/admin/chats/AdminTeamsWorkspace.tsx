'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Bot,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    Copy,
    Download,
    Inbox,
    Loader2,
    LogOut,
    Mail,
    MoreHorizontal,
    RefreshCw,
    Reply,
    Search,
    Send,
    Settings,
    Sparkles,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { buildInitials } from '@/lib/chat/session-metadata';
import { formatTimeOnly } from '@/utils/format';
import { QUICK_REPLIES, ROLE_COPY, STATUS_COPY, WORKSPACE_TABS } from '@/lib/admin-chat/workspace';
import { useAdminChatWorkspace } from './useAdminChatWorkspace';

type LocalTab = 'conversation' | 'details';

function TeamsStatusBadge({ status }: { status?: keyof typeof STATUS_COPY }) {
    if (!status) return null;

    const styles =
        status === 'pending'
            ? 'bg-amber-500/12 text-amber-200 border-amber-400/20'
            : status === 'in_progress'
                ? 'bg-indigo-500/12 text-indigo-200 border-indigo-400/20'
                : 'bg-emerald-500/12 text-emerald-200 border-emerald-400/20';

    return (
        <span className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold', styles)}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {STATUS_COPY[status]}
        </span>
    );
}

function WaitingBadge({ label, tone }: { label: string | null; tone: 'amber' | 'emerald' | 'slate' }) {
    if (!label) return null;

    const styles =
        tone === 'amber'
            ? 'bg-amber-500/10 text-amber-100 border-amber-400/15'
            : tone === 'emerald'
                ? 'bg-emerald-500/10 text-emerald-100 border-emerald-400/15'
                : 'bg-white/5 text-[var(--theme-text-muted)] border-white/10';

    return (
        <span className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium', styles)}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}

function RailItem({
    href,
    label,
    icon,
    active,
    badge,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    badge?: number;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'group relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl border text-[11px] transition-all',
                active
                    ? 'border-indigo-400/40 bg-indigo-500/18 text-white shadow-[0_10px_30px_rgba(79,70,229,0.22)]'
                    : 'border-transparent text-[var(--theme-text-muted)] hover:border-white/10 hover:bg-white/6 hover:text-white',
            )}
            aria-current={active ? 'page' : undefined}
            title={label}
        >
            {icon}
            {badge && badge > 0 ? (
                <span className="absolute right-1.5 top-1.5 min-w-[18px] rounded-full bg-amber-500 px-1.5 text-center text-[10px] font-bold text-white">
                    {badge > 99 ? '99+' : badge}
                </span>
            ) : null}
        </Link>
    );
}

function MessageBubble({
    message,
    sessionInitials,
}: {
    message: ReturnType<typeof useAdminChatWorkspace>['messages'][number];
    sessionInitials: string;
}) {
    if (message.role === 'system') {
        return (
            <div className="flex justify-center py-2">
                <div className="inline-flex max-w-xl items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-[var(--theme-text-muted)]">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                    <span>{message.content}</span>
                </div>
            </div>
        );
    }

    const isAdmin = message.role === 'admin';
    const isUser = message.role === 'user';
    const bubbleClass = isAdmin
        ? 'ml-auto bg-[linear-gradient(180deg,rgba(79,70,229,0.18),rgba(79,70,229,0.12))] border border-indigo-400/15'
        : isUser
            ? 'bg-white/6 border border-white/10'
            : 'bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(255,255,255,0.04))] border border-white/10';

    return (
        <div className={cn('flex gap-3 py-2', isAdmin ? 'justify-end' : 'justify-start')}>
            {!isAdmin ? (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[11px] font-semibold text-white">
                    {message.role === 'assistant' ? <Sparkles className="h-3.5 w-3.5 text-indigo-200" /> : sessionInitials}
                </div>
            ) : null}

            <div className={cn('max-w-[min(720px,82%)] rounded-2xl px-4 py-3', bubbleClass)}>
                <div className="mb-1.5 flex items-center gap-2 text-[11px] text-[var(--theme-text-muted)]">
                    <span className="font-semibold text-[var(--theme-text)]">
                        {message.senderLabel || ROLE_COPY[message.role]}
                    </span>
                    <span>{formatTimeOnly(message.timestamp)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--theme-text)]">
                    {message.content}
                </p>
            </div>
        </div>
    );
}

function DetailsDrawer({
    open,
    onClose,
    details,
    email,
    onCopySession,
    onCopyEmail,
    onExport,
}: {
    open: boolean;
    onClose: () => void;
    details: ReturnType<typeof useAdminChatWorkspace>['conversationDetails'];
    email?: string;
    onCopySession: () => void;
    onCopyEmail: () => void;
    onExport: () => void;
}) {
    return (
        <div
            className={cn(
                'pointer-events-none absolute inset-y-0 right-0 z-30 w-full max-w-[320px] border-l border-white/10 bg-[rgba(22,24,33,0.98)] backdrop-blur-xl transition-transform duration-300',
                open ? 'translate-x-0' : 'translate-x-full',
            )}
        >
            <div className="pointer-events-auto flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                        <p className="text-sm font-semibold text-[var(--theme-text)]">Στοιχεία συνομιλίας</p>
                        <p className="text-xs text-[var(--theme-text-muted)]">Metadata και γρήγορες ενέργειες</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--theme-text-muted)] hover:text-white"
                        onClick={onClose}
                        aria-label="Κλείσιμο στοιχείων"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                    {details.map((detail) => (
                        <div key={detail.label} className="rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--theme-text-muted)]">
                                {detail.label}
                            </p>
                            <p className="mt-1 break-all text-sm text-[var(--theme-text)]">{detail.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-2 border-t border-white/10 px-5 py-4">
                    <Button variant="secondary" className="justify-start" onClick={onCopySession}>
                        <Copy className="h-4 w-4" />
                        Αντιγραφή session ID
                    </Button>
                    {email ? (
                        <Button variant="secondary" className="justify-start" onClick={onCopyEmail}>
                            <Mail className="h-4 w-4" />
                            Αντιγραφή email
                        </Button>
                    ) : null}
                    <Button variant="secondary" className="justify-start" onClick={onExport}>
                        <Download className="h-4 w-4" />
                        Εξαγωγή CSV
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function AdminTeamsWorkspace() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { unreadCount } = useNotifications();
    const composerRef = useRef<HTMLTextAreaElement>(null);
    const threadScrollerRef = useRef<HTMLDivElement>(null);
    const workspace = useAdminChatWorkspace({ composerRef, threadScrollerRef });
    const [activeTab, setActiveTab] = useState<LocalTab>('conversation');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [quickRepliesOpen, setQuickRepliesOpen] = useState(true);
    const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

    const railItems = useMemo(() => ([
        { href: '/admin', label: 'Σύνοψη', icon: <TrendingUp className="h-5 w-5" /> },
        { href: '/admin/chats', label: 'Chat', icon: <Bot className="h-5 w-5" /> },
        { href: '/admin/requests', label: 'Αιτήματα', icon: <Inbox className="h-5 w-5" />, badge: unreadCount > 0 ? unreadCount : undefined },
        { href: '/admin/users', label: 'Χρήστες', icon: <Users className="h-5 w-5" /> },
        { href: '/admin/settings', label: 'Ρυθμίσεις', icon: <Settings className="h-5 w-5" /> },
    ]), [unreadCount]);

    const sessionInitials = workspace.currentConversation
        ? buildInitials(workspace.currentConversation.userName, workspace.currentConversation.userEmail)
        : 'A';

    const handlePrimaryAction = async () => {
        if (!workspace.currentConversation) return;

        if (workspace.primaryAction.kind === 'reply') {
            workspace.focusComposer();
            return;
        }

        if (workspace.primaryAction.kind === 'reopen') {
            await workspace.handleStatusChange('pending');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const openDetails = () => {
        setActiveTab('details');
        setDetailsOpen(true);
        setDesktopMenuOpen(false);
    };

    const closeDetails = () => {
        setActiveTab('conversation');
        setDetailsOpen(false);
    };

    return (
        <div className="admin-teams-theme min-h-screen bg-[var(--theme-bg-solid)] text-[var(--theme-text)]">
            <div className="flex h-screen flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-3 border-b border-white/8 bg-[rgba(20,22,31,0.96)] px-4 backdrop-blur-xl lg:px-5">
                    <div className="flex min-w-[120px] items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/18 text-indigo-100">
                            <Bot className="h-4 w-4" />
                        </span>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-white">Chat</p>
                            <p className="text-[11px] text-[var(--theme-text-muted)]">Admin workspace</p>
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-[560px] items-center rounded-xl border border-white/10 bg-white/5 px-3">
                        <Search className="h-4 w-4 text-[var(--theme-text-muted)]" />
                        <Input
                            value={workspace.searchQuery}
                            onChange={(event) => workspace.setSearchQuery(event.target.value)}
                            placeholder="Αναζήτηση συνομιλιών, email ή session"
                            className="h-10 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => void workspace.refreshSessions()} disabled={workspace.isLoadingSessions}>
                            <RefreshCw className={cn('h-4 w-4', workspace.isLoadingSessions && 'animate-spin')} />
                            <span className="hidden lg:inline">Ανανέωση</span>
                        </Button>
                        <Badge variant="outline" className="hidden rounded-full border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[var(--theme-text-muted)] lg:inline-flex">
                            {workspace.queueInsights.waitingOnAdmin} σε αναμονή
                        </Badge>
                    </div>
                </header>

                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <aside className="hidden w-[72px] shrink-0 flex-col items-center justify-between border-r border-white/8 bg-[rgba(17,19,28,0.98)] py-3 lg:flex">
                        <div className="flex flex-col items-center gap-2">
                            {railItems.map((item) => (
                                <RailItem
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                    icon={item.icon}
                                    active={item.href === '/admin/chats'}
                                    badge={item.badge}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            {user?.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt=""
                                    width={36}
                                    height={36}
                                    className="h-10 w-10 rounded-full border border-white/10 object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white">
                                    {user?.displayName?.[0] || user?.email?.[0] || 'A'}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-[var(--theme-text-muted)] transition-colors hover:border-white/10 hover:bg-white/6 hover:text-white"
                                aria-label="Αποσύνδεση"
                                title="Αποσύνδεση"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </aside>

                    <section className={cn(
                        'min-h-0 shrink-0 border-r border-white/8 bg-[rgba(25,27,38,0.96)]',
                        workspace.selectedSessionId ? 'hidden lg:flex lg:w-[336px]' : 'flex w-full lg:w-[336px]',
                    )}>
                        <div className="flex min-h-0 w-full flex-col">
                            <div className="border-b border-white/8 px-4 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                                            Συνομιλίες
                                        </p>
                                        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                                            Chat
                                        </h1>
                                        <p className="mt-1 text-sm text-[var(--theme-text-muted)]">
                                            {workspace.inboxSummary}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                                        <p className="text-lg font-semibold text-white">{workspace.sessions.length}</p>
                                        <p className="text-[11px] text-[var(--theme-text-muted)]">νήματα</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {WORKSPACE_TABS.map((tab, index) => {
                                        const active = workspace.statusTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                onClick={() => workspace.handleTabChange(tab.id)}
                                                onKeyDown={(event) => workspace.handleTabKeyDown(event, index)}
                                                className={cn(
                                                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                                                    active
                                                        ? 'border-indigo-400/35 bg-indigo-500/20 text-white'
                                                        : 'border-white/10 bg-white/5 text-[var(--theme-text-muted)] hover:text-white',
                                                )}
                                            >
                                                {tab.shortLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                                {workspace.isLoadingSessions && workspace.sessions.length === 0 ? (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-indigo-200" />
                                    </div>
                                ) : workspace.sessionRows.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-indigo-100">
                                            <Inbox className="h-6 w-6" />
                                        </div>
                                        <p className="mt-4 text-lg font-semibold text-white">Δεν βρέθηκαν συνομιλίες</p>
                                        <p className="mt-2 text-sm text-[var(--theme-text-muted)]">
                                            Αλλάξτε φίλτρο ή δοκιμάστε διαφορετική αναζήτηση.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {workspace.sessionRows.map((session) => (
                                            <button
                                                key={session.sessionId}
                                                type="button"
                                                onClick={() => workspace.selectSession(session.sessionId)}
                                                className={cn(
                                                    'group relative w-full rounded-2xl border px-3 py-3 text-left transition-all',
                                                    session.isSelected
                                                        ? 'border-indigo-400/25 bg-indigo-500/16'
                                                        : 'border-transparent bg-transparent hover:border-white/8 hover:bg-white/[0.045]',
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {session.avatarUrl ? (
                                                        <Image src={session.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-xs font-semibold text-white">
                                                            {session.initials}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                'h-2.5 w-2.5 rounded-full',
                                                                session.stateDotTone === 'amber'
                                                                    ? 'bg-amber-400'
                                                                    : session.stateDotTone === 'emerald'
                                                                        ? 'bg-emerald-400'
                                                                        : 'bg-indigo-400',
                                                            )} />
                                                            <p className="truncate text-sm font-semibold text-white">{session.name}</p>
                                                            <span className="ml-auto shrink-0 text-[11px] text-[var(--theme-text-muted)]">
                                                                {session.timestampLabel}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 truncate text-xs text-[var(--theme-text-muted)]">
                                                            {session.email}
                                                        </p>
                                                        <p className="mt-2 line-clamp-2 text-sm text-[var(--theme-text-muted)]">
                                                            {session.preview}
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                                            <TeamsStatusBadge status={session.statusTone} />
                                                            <WaitingBadge label={session.waitingLabel} tone={session.waitingTone} />
                                                            <span className="text-[11px] text-[var(--theme-text-muted)]">{session.messageCountLabel}</span>
                                                            {session.unreadCount > 0 ? (
                                                                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                                                    {session.unreadCount}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>

                                                <ChevronRight className={cn(
                                                    'absolute right-3 top-3 h-4 w-4 text-[var(--theme-text-muted)] transition-transform',
                                                    session.isSelected ? 'text-indigo-100' : 'group-hover:translate-x-0.5',
                                                )} />
                                            </button>
                                        ))}

                                        {workspace.hasMoreSessions ? (
                                            <Button
                                                variant="secondary"
                                                className="mt-2 w-full justify-center"
                                                onClick={() => void workspace.fetchSessions({ append: true, cursor: workspace.sessionsCursor })}
                                                disabled={workspace.isLoadingMoreSessions}
                                            >
                                                {workspace.isLoadingMoreSessions ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                                Περισσότερες συνομιλίες
                                            </Button>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className={cn(
                        'relative min-h-0 flex-1 bg-[rgba(32,34,46,0.98)]',
                        workspace.selectedSessionId ? 'flex' : 'hidden lg:flex',
                    )}>
                        {!workspace.currentConversation ? (
                            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[28px] border border-white/10 bg-white/6 text-indigo-100">
                                    <Bot className="h-8 w-8" />
                                </div>
                                <p className="mt-5 text-2xl font-semibold text-white">Επιλέξτε συνομιλία</p>
                                <p className="mt-2 max-w-md text-sm text-[var(--theme-text-muted)]">
                                    Ανοίξτε ένα νήμα από το αριστερό pane για να δείτε live ενημερώσεις και να απαντήσετε χωρίς refresh.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex min-h-0 flex-1 flex-col">
                                    <div className="border-b border-white/8 bg-[rgba(32,34,46,0.98)] px-4 py-4 lg:px-6">
                                        <div className="flex items-start gap-3">
                                            <button
                                                type="button"
                                                onClick={workspace.clearSelection}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--theme-text-muted)] hover:text-white lg:hidden"
                                                aria-label="Επιστροφή στη λίστα"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                            </button>

                                            {workspace.currentConversation.userPhotoURL ? (
                                                <Image src={workspace.currentConversation.userPhotoURL} alt="" width={42} height={42} className="h-11 w-11 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-sm font-semibold text-white">
                                                    {sessionInitials}
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="truncate text-xl font-semibold text-white">
                                                        {workspace.currentConversationLabel}
                                                    </h2>
                                                    <TeamsStatusBadge status={workspace.currentConversation.escalationStatus} />
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                                                    <span className="truncate">{workspace.currentConversation.userEmail || 'Χωρίς διαθέσιμο email'}</span>
                                                    <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-block" />
                                                    <span>Τελευταία δραστηριότητα {workspace.conversationDetails[4]?.value}</span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <WaitingBadge
                                                        label={workspace.sessionRows.find((session) => session.sessionId === workspace.currentConversation?.sessionId)?.waitingLabel ?? null}
                                                        tone={workspace.sessionRows.find((session) => session.sessionId === workspace.currentConversation?.sessionId)?.waitingTone ?? 'slate'}
                                                    />
                                                    <Badge variant="outline" className="rounded-full border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[var(--theme-text-muted)]">
                                                        {workspace.messages.length} μηνύματα
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="ml-auto hidden items-center gap-2 lg:flex">
                                                <Button onClick={() => void handlePrimaryAction()} disabled={workspace.primaryAction.kind === 'view'} className="rounded-full px-4">
                                                    <Reply className="h-4 w-4" />
                                                    {workspace.primaryAction.label}
                                                </Button>
                                                {workspace.currentConversation.escalationStatus !== 'resolved' ? (
                                                    <Button variant="secondary" className="rounded-full" onClick={() => void workspace.handleStatusChange('resolved')}>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Επίλυση
                                                    </Button>
                                                ) : null}
                                                {workspace.currentConversation.escalationStatus === 'resolved' ? (
                                                    <Button variant="secondary" className="rounded-full" onClick={() => void workspace.handleStatusChange('pending')}>
                                                        <RefreshCw className="h-4 w-4" />
                                                        Άνοιγμα ξανά
                                                    </Button>
                                                ) : null}
                                                {workspace.currentConversation.escalationStatus !== 'in_progress' && workspace.currentConversation.escalationStatus !== 'resolved' ? (
                                                    <Button variant="secondary" className="rounded-full" onClick={() => void workspace.handleStatusChange('in_progress')}>
                                                        <Clock3 className="h-4 w-4" />
                                                        Σε εξέλιξη
                                                    </Button>
                                                ) : null}
                                                <div className="relative">
                                                    <Button variant="secondary" className="rounded-full" onClick={() => setDesktopMenuOpen((current) => !current)}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        Περισσότερα
                                                    </Button>
                                                    {desktopMenuOpen ? (
                                                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[220px] rounded-2xl border border-white/10 bg-[rgba(26,28,40,0.98)] p-2 shadow-2xl">
                                                            <button type="button" onClick={() => { openDetails(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--theme-text-muted)] hover:bg-white/6 hover:text-white">
                                                                <ChevronRight className="h-4 w-4" />
                                                                Στοιχεία
                                                            </button>
                                                            {workspace.currentConversation.userEmail ? (
                                                                <button type="button" onClick={() => void workspace.handleCopy(workspace.currentConversation!.userEmail!, 'Το email αντιγράφηκε.')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--theme-text-muted)] hover:bg-white/6 hover:text-white">
                                                                    <Mail className="h-4 w-4" />
                                                                    Αντιγραφή email
                                                                </button>
                                                            ) : null}
                                                            <button type="button" onClick={() => void workspace.handleCopy(workspace.currentConversation!.sessionId, 'Το session ID αντιγράφηκε.')} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--theme-text-muted)] hover:bg-white/6 hover:text-white">
                                                                <Copy className="h-4 w-4" />
                                                                Αντιγραφή session ID
                                                            </button>
                                                            <button type="button" onClick={workspace.exportToCSV} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[var(--theme-text-muted)] hover:bg-white/6 hover:text-white">
                                                                <Download className="h-4 w-4" />
                                                                Εξαγωγή CSV
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => workspace.setMobileActionsOpen(true)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--theme-text-muted)] hover:text-white lg:hidden"
                                                aria-label="Περισσότερες ενέργειες"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-center gap-6 border-t border-white/8 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => { setActiveTab('conversation'); closeDetails(); }}
                                                className={cn('pb-2 text-sm font-medium', activeTab === 'conversation' ? 'border-b-2 border-indigo-300 text-white' : 'text-[var(--theme-text-muted)]')}
                                            >
                                                Συζήτηση
                                            </button>
                                            <button
                                                type="button"
                                                onClick={detailsOpen ? closeDetails : openDetails}
                                                className={cn('pb-2 text-sm font-medium', activeTab === 'details' ? 'border-b-2 border-indigo-300 text-white' : 'text-[var(--theme-text-muted)]')}
                                            >
                                                Στοιχεία
                                            </button>
                                        </div>
                                    </div>

                                    <div ref={threadScrollerRef} onScroll={workspace.handleThreadScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-8">
                                        {workspace.isLoadingMessages ? (
                                            <div className="flex h-full items-center justify-center">
                                                <Loader2 className="h-7 w-7 animate-spin text-indigo-200" />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {workspace.hasMoreMessages ? (
                                                    <div className="flex justify-center pb-4">
                                                        <Button variant="secondary" onClick={() => void workspace.fetchOlderMessages(workspace.currentConversation!.sessionId, workspace.messagesCursor)} disabled={workspace.isLoadingOlderMessages}>
                                                            {workspace.isLoadingOlderMessages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                                                            Φόρτωση παλαιότερων
                                                        </Button>
                                                    </div>
                                                ) : null}

                                                {workspace.groupedMessages.map((entry) => entry.type === 'day' ? (
                                                    <div key={entry.key} className="flex justify-center py-3">
                                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-[var(--theme-text-muted)]">
                                                            {entry.label}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <MessageBubble
                                                        key={entry.key}
                                                        message={entry.message}
                                                        sessionInitials={sessionInitials}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {workspace.hasDetachedThreadMessages ? (
                                        <div className="px-4 pb-2 lg:px-8">
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => workspace.scrollThreadToLatest()}
                                                    className="rounded-full border border-indigo-400/20 bg-indigo-500/12 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-500/20"
                                                >
                                                    Νέα μηνύματα • Μετάβαση στο πιο πρόσφατο
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="border-t border-white/8 bg-[rgba(26,28,40,0.98)] px-4 py-3 lg:px-6">
                                        {!workspace.currentConversation.userId ? (
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--theme-text-muted)]">
                                                Οι ανώνυμες συνεδρίες παραμένουν μόνο για ανάγνωση. Δεν υποστηρίζεται in-app απάντηση.
                                            </div>
                                        ) : workspace.currentConversation.escalationStatus === 'resolved' ? (
                                            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                                                Η συνομιλία έχει ολοκληρωθεί. Χρησιμοποιήστε «Άνοιγμα ξανά» για να ενεργοποιήσετε ξανά την απάντηση.
                                            </div>
                                        ) : !workspace.currentConversation.isEscalated ? (
                                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--theme-text-muted)]">
                                                Η απάντηση ενεργοποιείται μόνο σε κλιμακωμένες συνομιλίες.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickRepliesOpen((current) => !current)}
                                                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)] hover:text-white"
                                                    >
                                                        <ChevronDown className={cn('h-4 w-4 transition-transform', quickRepliesOpen ? 'rotate-0' : '-rotate-90')} />
                                                        Quick replies
                                                    </button>
                                                    <span className="text-xs text-[var(--theme-text-muted)]">Enter για αποστολή, Shift + Enter για νέα γραμμή</span>
                                                </div>

                                                {quickRepliesOpen ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {QUICK_REPLIES.map((quickReply) => (
                                                            <button
                                                                key={quickReply}
                                                                type="button"
                                                                onClick={() => workspace.injectQuickReply(quickReply)}
                                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[var(--theme-text-muted)] transition-colors hover:text-white"
                                                            >
                                                                {quickReply}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : null}

                                                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-3">
                                                    <Textarea
                                                        ref={composerRef}
                                                        value={workspace.replyDraft}
                                                        onChange={(event) => workspace.setReplyDraft(event.target.value)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                                event.preventDefault();
                                                                void workspace.handleReplySubmit();
                                                            }
                                                        }}
                                                        placeholder="Γράψτε απάντηση προς τον πελάτη…"
                                                        className="min-h-[88px] border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
                                                    />
                                                    <div className="flex items-center justify-between gap-3 border-t border-white/8 px-2 pt-3">
                                                        <span className="text-xs text-[var(--theme-text-muted)]">Live thread ενεργό</span>
                                                        <Button onClick={() => void workspace.handleReplySubmit()} disabled={!workspace.replyDraft.trim() || workspace.isSendingReply || !workspace.canReply} className="rounded-full px-5">
                                                            {workspace.isSendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                                            Αποστολή
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DetailsDrawer
                                    open={detailsOpen}
                                    onClose={closeDetails}
                                    details={workspace.conversationDetails}
                                    email={workspace.currentConversation.userEmail}
                                    onCopySession={() => void workspace.handleCopy(workspace.currentConversation!.sessionId, 'Το session ID αντιγράφηκε.')}
                                    onCopyEmail={() => void workspace.handleCopy(workspace.currentConversation!.userEmail!, 'Το email αντιγράφηκε.')}
                                    onExport={workspace.exportToCSV}
                                />
                            </>
                        )}
                    </section>
                </div>

                {workspace.mobileActionsOpen && workspace.currentConversation ? (
                    <div className="fixed inset-0 z-[90] flex items-end bg-black/60 lg:hidden">
                        <button type="button" className="absolute inset-0" aria-label="Κλείσιμο ενεργειών" onClick={() => workspace.setMobileActionsOpen(false)} />
                        <div className="relative z-10 w-full rounded-t-[28px] border border-white/10 bg-[rgba(26,28,40,0.98)] p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-[0_-24px_60px_rgba(0,0,0,0.42)]">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-semibold text-white">Ενέργειες συνομιλίας</p>
                                <button type="button" onClick={() => workspace.setMobileActionsOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[var(--theme-text-muted)]">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid gap-3">
                                <Button onClick={() => { workspace.setMobileActionsOpen(false); void handlePrimaryAction(); }} disabled={workspace.primaryAction.kind === 'view'} className="justify-start">
                                    <Reply className="h-4 w-4" />
                                    {workspace.primaryAction.label}
                                </Button>
                                {workspace.currentConversation.escalationStatus !== 'in_progress' && workspace.currentConversation.escalationStatus !== 'resolved' ? (
                                    <Button variant="secondary" onClick={() => void workspace.handleStatusChange('in_progress')} className="justify-start">
                                        <Clock3 className="h-4 w-4" />
                                        Σήμανση σε εξέλιξη
                                    </Button>
                                ) : null}
                                {workspace.currentConversation.escalationStatus === 'resolved' ? (
                                    <Button variant="secondary" onClick={() => void workspace.handleStatusChange('pending')} className="justify-start">
                                        <RefreshCw className="h-4 w-4" />
                                        Άνοιγμα ξανά
                                    </Button>
                                ) : (
                                    <Button variant="secondary" onClick={() => void workspace.handleStatusChange('resolved')} className="justify-start">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Επίλυση
                                    </Button>
                                )}
                                {workspace.currentConversation.userEmail ? (
                                    <Button variant="secondary" onClick={() => void workspace.handleCopy(workspace.currentConversation!.userEmail!, 'Το email αντιγράφηκε.')} className="justify-start">
                                        <Mail className="h-4 w-4" />
                                        Αντιγραφή email
                                    </Button>
                                ) : null}
                                <Button variant="secondary" onClick={() => void workspace.handleCopy(workspace.currentConversation!.sessionId, 'Το session ID αντιγράφηκε.')} className="justify-start">
                                    <Copy className="h-4 w-4" />
                                    Αντιγραφή session ID
                                </Button>
                                <Button variant="secondary" onClick={workspace.exportToCSV} className="justify-start">
                                    <Download className="h-4 w-4" />
                                    Εξαγωγή CSV
                                </Button>
                                <Button variant="secondary" onClick={() => { workspace.setMobileActionsOpen(false); openDetails(); }} className="justify-start">
                                    <ChevronRight className="h-4 w-4" />
                                    Στοιχεία
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
