import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { AdminChatSession } from '@/services/admin';
import type { ChatHistoryMessage, ChatSessionSummary } from '@/services/chat';
import {
    buildInitials,
    getConversationPrimaryLabel,
    isOpenEscalationStatus,
} from '@/lib/chat/session-metadata';
import type {
    AdminChatStatusFilter,
    ChatEscalationStatus,
    ChatMessageRole,
    ChatWaitingOn,
} from '@/lib/chat/types';
import { formatChatDay, formatTime, formatTimeOnly } from '@/utils/format';

export type WorkspaceTab = 'open' | 'waiting_on_admin' | 'in_progress' | 'resolved' | 'all';
export type ThreadPanelTab = 'conversation' | 'details';

export interface WorkspaceTabConfig {
    id: WorkspaceTab;
    label: string;
    shortLabel: string;
    description: string;
}

export interface QueueInsights {
    active: number;
    waitingOnAdmin: number;
    inProgress: number;
    resolved: number;
    unread: number;
}

export interface GroupedMessageDayEntry {
    type: 'day';
    key: string;
    label: string;
}

export interface GroupedMessageItemEntry {
    type: 'message';
    key: string;
    message: ChatHistoryMessage;
}

export type GroupedMessageEntry = GroupedMessageDayEntry | GroupedMessageItemEntry;

export interface SessionRowViewModel {
    sessionId: string;
    name: string;
    initials: string;
    email: string;
    preview: string;
    timestampLabel: string;
    unreadCount: number;
    messageCountLabel: string;
    waitingLabel: string | null;
    statusLabel: string;
    statusTone: 'pending' | 'in_progress' | 'resolved';
    stateDotTone: 'amber' | 'indigo' | 'emerald';
    waitingTone: 'amber' | 'emerald' | 'slate';
    isSelected: boolean;
    avatarUrl?: string;
}

export interface ConversationDetailsItem {
    label: string;
    value: string;
    tone?: 'default' | 'muted' | 'success' | 'warning';
}

export interface PrimaryActionDescriptor {
    kind: 'reply' | 'resolve' | 'reopen' | 'view';
    label: string;
}

export const STATUS_COPY: Record<ChatEscalationStatus, string> = {
    pending: 'Σε αναμονή',
    in_progress: 'Σε εξέλιξη',
    resolved: 'Ολοκληρωμένη',
};

export const ROLE_COPY: Record<ChatMessageRole, string> = {
    user: 'Πελάτης',
    assistant: 'AI AEROFREN',
    admin: 'Ομάδα AEROFREN',
    system: 'Σύστημα',
};

export const QUICK_REPLIES = [
    'Λάβαμε το αίτημά σας και το εξετάζουμε.',
    'Στείλτε μας κωδικό προϊόντος ή φωτογραφία.',
    'Μπορείτε να μας καλέσετε στο 210 3461645.',
];

export const ADMIN_CHAT_DRAFT_PREFIX = 'admin-chat-draft:';
export const ADMIN_CHAT_DRAFT_INDEX_KEY = 'admin-chat-draft-index';
export const ADMIN_CHAT_SEARCH_LIMIT = 100;
export const MAX_STORED_DRAFTS = 20;
export const SESSIONS_PAGE_SIZE = 40;
export const HISTORY_PAGE_SIZE = 50;
export const SEARCH_DEBOUNCE_MS = 300;
export const SESSION_ID_SEARCH_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const OPEN_ESCALATION_STATUSES: ChatEscalationStatus[] = ['pending', 'in_progress'];

export const WORKSPACE_TABS: WorkspaceTabConfig[] = [
    { id: 'open', label: 'Ενεργές', shortLabel: 'Ενεργές', description: 'Όλες οι ενεργές, μη ολοκληρωμένες συνομιλίες' },
    { id: 'waiting_on_admin', label: 'Χρειάζεται απάντηση', shortLabel: 'Απάντηση', description: 'Ενεργές συνομιλίες που περιμένουν την ομάδα' },
    { id: 'in_progress', label: 'Σε εξέλιξη', shortLabel: 'Σε εξέλιξη', description: 'Συνομιλίες που ήδη χειρίζεται η ομάδα' },
    { id: 'resolved', label: 'Ολοκληρωμένα', shortLabel: 'Ολοκληρωμένα', description: 'Συνομιλίες που έχουν κλείσει' },
    { id: 'all', label: 'Όλες', shortLabel: 'Όλες', description: 'Ανοιχτές και ολοκληρωμένες συνομιλίες' },
];

function getTimestampMillis(timestamp?: string): number {
    if (!timestamp) return 0;
    const millis = new Date(timestamp).getTime();
    return Number.isFinite(millis) ? millis : 0;
}

export function mergeThreadMessages(...slices: ChatHistoryMessage[][]): ChatHistoryMessage[] {
    const deduped = new Map<string, ChatHistoryMessage>();

    for (const slice of slices) {
        for (const message of slice) {
            deduped.set(message.id, message);
        }
    }

    return [...deduped.values()].sort((left, right) => {
        const leftMillis = getTimestampMillis(left.timestamp);
        const rightMillis = getTimestampMillis(right.timestamp);

        if (leftMillis === rightMillis) {
            return left.id.localeCompare(right.id);
        }

        return leftMillis - rightMillis;
    });
}

export function isThreadNearBottom(scroller: HTMLDivElement | null): boolean {
    if (!scroller) return true;

    const distanceFromBottom =
        scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight);

    return distanceFromBottom <= 120;
}

export function getWorkspaceStatusFilter(statusTab: WorkspaceTab): AdminChatStatusFilter {
    if (statusTab === 'open') return 'open';
    if (statusTab === 'waiting_on_admin') return 'open';
    if (statusTab === 'in_progress') return 'in_progress';
    if (statusTab === 'resolved') return 'resolved';
    return 'all';
}

export function tabNeedsReply(statusTab: WorkspaceTab): boolean {
    return statusTab === 'waiting_on_admin';
}

export function buildQueueInsights(sessions: AdminChatSession[]): QueueInsights {
    return {
        active: sessions.filter((session) => isOpenEscalationStatus(session.escalationStatus)).length,
        waitingOnAdmin: sessions.filter((session) => session.waitingOn === 'admin' && isOpenEscalationStatus(session.escalationStatus)).length,
        inProgress: sessions.filter((session) => session.escalationStatus === 'in_progress').length,
        resolved: sessions.filter((session) => session.escalationStatus === 'resolved').length,
        unread: sessions.filter((session) => (session.adminUnreadCount ?? 0) > 0).length,
    };
}

export function getInboxHeadline(statusTab: WorkspaceTab): string {
    switch (statusTab) {
        case 'waiting_on_admin':
            return 'Συνομιλίες που χρειάζονται απάντηση';
        case 'in_progress':
            return 'Συνομιλίες που χειρίζεται η ομάδα';
        case 'resolved':
            return 'Ιστορικό ολοκληρωμένων συνομιλιών';
        case 'all':
            return 'Ολόκληρη η ροή συνομιλιών';
        default:
            return 'Ενεργές συνομιλίες πελατών';
    }
}

export function getInboxSummary(activeWorkspaceTab: WorkspaceTabConfig, debouncedSearch: string): string {
    if (debouncedSearch) {
        return `Αποτελέσματα για “${debouncedSearch}”`;
    }

    return activeWorkspaceTab.description;
}

export function getWaitingLabel(waitingOn?: ChatWaitingOn, status?: ChatEscalationStatus): string | null {
    if (!status || status === 'resolved') return null;
    if (waitingOn === 'admin') return 'Αναμένει ομάδα';
    if (waitingOn === 'customer') return 'Αναμένει πελάτη';
    return null;
}

export function getWaitingTone(waitingOn?: ChatWaitingOn): 'amber' | 'emerald' | 'slate' {
    if (waitingOn === 'admin') return 'amber';
    if (waitingOn === 'customer') return 'emerald';
    return 'slate';
}

export function getChannelLabel(session: AdminChatSession): string {
    return session.userId ? 'In-app reply' : 'Read only';
}

export function buildPrimaryAction(session: AdminChatSession | null): PrimaryActionDescriptor {
    if (!session) {
        return { kind: 'view', label: 'Επιλέξτε συνομιλία' };
    }

    if (session.escalationStatus === 'resolved') {
        return { kind: 'reopen', label: 'Άνοιγμα ξανά' };
    }

    if (session.userId && isOpenEscalationStatus(session.escalationStatus)) {
        return { kind: 'reply', label: 'Απάντηση' };
    }

    return { kind: 'view', label: 'Προβολή' };
}

export function buildConversationDetails(session: AdminChatSession | null, messageCount: number): ConversationDetailsItem[] {
    if (!session) {
        return [];
    }

    return [
        { label: 'Κατάσταση', value: session.escalationStatus ? STATUS_COPY[session.escalationStatus] : 'Χωρίς κατάσταση' },
        { label: 'Ροή', value: getWaitingLabel(session.waitingOn, session.escalationStatus) ?? 'Χωρίς εκκρεμότητα', tone: session.waitingOn === 'admin' ? 'warning' : session.waitingOn === 'customer' ? 'success' : 'muted' },
        { label: 'Κανάλι', value: getChannelLabel(session), tone: session.userId ? 'default' : 'muted' },
        { label: 'Μηνύματα', value: `${messageCount}` },
        { label: 'Τελευταία δραστηριότητα', value: formatTime(session.lastMessage), tone: 'muted' },
        { label: 'Session ID', value: session.sessionId, tone: 'muted' },
    ];
}

export function buildSessionRowViewModel(session: AdminChatSession, isSelected: boolean): SessionRowViewModel {
    const name = getConversationPrimaryLabel({
        sessionId: session.sessionId,
        userName: session.userName,
        userEmail: session.userEmail,
    });
    const previewRole =
        session.lastMessageRole === 'admin'
            ? 'Ομάδα'
            : session.lastMessageRole === 'assistant'
                ? 'AI'
                : session.lastMessageRole === 'user'
                    ? 'Πελάτης'
                    : null;
    const preview = session.lastMessagePreview
        ? previewRole
            ? `${previewRole}: ${session.lastMessagePreview}`
            : session.lastMessagePreview
        : 'Δεν υπάρχει ακόμη προεπισκόπηση μηνύματος.';

    return {
        sessionId: session.sessionId,
        name,
        initials: buildInitials(session.userName, session.userEmail),
        email: session.userEmail ?? 'Χωρίς διαθέσιμο email',
        preview,
        timestampLabel: formatTimeOnly(session.lastMessage),
        unreadCount: session.adminUnreadCount ?? 0,
        messageCountLabel: `${session.messageCount} μηνύματα`,
        waitingLabel: getWaitingLabel(session.waitingOn, session.escalationStatus),
        statusLabel: session.escalationStatus ? STATUS_COPY[session.escalationStatus] : 'Χωρίς κατάσταση',
        statusTone: session.escalationStatus ?? 'pending',
        stateDotTone:
            session.escalationStatus === 'resolved'
                ? 'emerald'
                : session.escalationStatus === 'in_progress'
                    ? 'indigo'
                    : 'amber',
        waitingTone: getWaitingTone(session.waitingOn),
        isSelected,
        avatarUrl: session.userPhotoURL,
    };
}

export function groupMessagesByDay(messages: ChatHistoryMessage[]): GroupedMessageEntry[] {
    const items: GroupedMessageEntry[] = [];
    let lastDayKey: string | null = null;

    for (const message of messages) {
        const messageTimestamp = message.timestamp;
        const dayKey = messageTimestamp ? new Date(messageTimestamp).toDateString() : null;

        if (dayKey && dayKey !== lastDayKey) {
            items.push({ type: 'day', key: `day-${dayKey}`, label: formatChatDay(messageTimestamp) });
            lastDayKey = dayKey;
        }

        items.push({ type: 'message', key: message.id, message });
    }

    return items;
}

export function matchesRealtimeInboxStatus(
    session: AdminChatSession,
    status: AdminChatStatusFilter,
): boolean {
    if (status === 'all') return true;
    if (status === 'open') return isOpenEscalationStatus(session.escalationStatus);
    return session.escalationStatus === status;
}

export function matchesRealtimeInboxNeedsReply(
    session: AdminChatSession,
    needsReply: boolean,
): boolean {
    if (!needsReply) return true;
    return session.waitingOn === 'admin' && isOpenEscalationStatus(session.escalationStatus);
}

export function matchesRealtimeInboxSearch(
    session: AdminChatSession,
    normalizedSearch: string,
): boolean {
    if (!normalizedSearch) return true;

    if (session.sessionId.toLowerCase() === normalizedSearch) return true;

    if (normalizedSearch.includes('@')) {
        return session.userEmailNormalized?.startsWith(normalizedSearch) ?? false;
    }

    return (
        session.userNameNormalized?.startsWith(normalizedSearch) === true ||
        session.userEmailLocalPartNormalized?.startsWith(normalizedSearch) === true
    );
}

export function sortInboxSessionsByLastMessage(
    left: AdminChatSession,
    right: AdminChatSession,
): number {
    const leftMillis = new Date(left.lastMessage).getTime();
    const rightMillis = new Date(right.lastMessage).getTime();
    if (leftMillis === rightMillis) {
        return left.sessionId.localeCompare(right.sessionId);
    }
    return rightMillis - leftMillis;
}

export function mergeInboxSessions(
    ...collections: AdminChatSession[][]
): AdminChatSession[] {
    const merged = new Map<string, AdminChatSession>();

    for (const batch of collections) {
        for (const session of batch) {
            const current = merged.get(session.sessionId);
            merged.set(session.sessionId, current ? { ...current, ...session } : session);
        }
    }

    return [...merged.values()].sort(sortInboxSessionsByLastMessage);
}

export function patchInboxSessions(
    sessions: AdminChatSession[],
    sessionId: string,
    patch: Partial<AdminChatSession>,
): AdminChatSession[] {
    return sessions.map((session) =>
        session.sessionId === sessionId ? { ...session, ...patch } : session,
    );
}

export function mapRealtimeThreadMessage(messageDoc: QueryDocumentSnapshot): ChatHistoryMessage {
    const data = messageDoc.data();
    const role = (data.role as ChatMessageRole | undefined) ?? 'assistant';

    return {
        id: messageDoc.id,
        role,
        content: (data.content as string | undefined) ?? '',
        timestamp: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        userEmail: data.userEmail as string | undefined,
        userName: data.userName as string | undefined,
        senderLabel:
            role === 'admin'
                ? (data.senderLabel as string | undefined) ?? 'Ομάδα AEROFREN'
                : role === 'assistant'
                    ? 'AI AEROFREN'
                    : role === 'system'
                        ? 'Σύστημα'
                        : (data.userName as string | undefined) ?? (data.userEmail as string | undefined),
    };
}

export function mapRealtimeSessionSummary(
    sessionId: string,
    data: Record<string, unknown>,
): ChatSessionSummary {
    const lastMessageAt = data.lastMessageAt as { toDate?: () => Date } | undefined;
    const escalationStatus = data.escalationStatus as ChatEscalationStatus | undefined;

    return {
        sessionId,
        userId: data.userId as string | undefined,
        userEmail: data.userEmail as string | undefined,
        userName: data.userName as string | undefined,
        userPhotoURL: data.userPhotoURL as string | undefined,
        escalationStatus,
        waitingOn: data.waitingOn as ChatSessionSummary['waitingOn'],
        lastMessageAt: lastMessageAt?.toDate?.()?.toISOString() ?? undefined,
        lastMessagePreview: data.lastMessagePreview as string | undefined,
        lastMessageRole: data.lastMessageRole as ChatMessageRole | undefined,
        messageCount: (data.messageCount as number | undefined) ?? 0,
        adminUnreadCount: (data.adminUnreadCount as number | undefined) ?? 0,
        customerUnreadCount: (data.customerUnreadCount as number | undefined) ?? 0,
        isEscalated:
            escalationStatus !== undefined
                ? isOpenEscalationStatus(escalationStatus)
                : Boolean(data.isEscalated),
    };
}

export function buildSessionPatchFromSummary(session: ChatSessionSummary): Partial<AdminChatSession> {
    return {
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        userPhotoURL: session.userPhotoURL,
        messageCount: session.messageCount ?? 0,
        lastMessage: session.lastMessageAt ?? new Date().toISOString(),
        lastMessagePreview: session.lastMessagePreview,
        lastMessageRole: session.lastMessageRole,
        adminUnreadCount: session.adminUnreadCount ?? 0,
        customerUnreadCount: session.customerUnreadCount ?? 0,
        waitingOn: session.waitingOn,
        isEscalated: session.isEscalated,
        escalationStatus: session.escalationStatus,
    };
}

export function buildSummaryPatchFromSessionPatch(
    patch: Partial<AdminChatSession>,
): Partial<ChatSessionSummary> {
    return {
        ...(patch.userId !== undefined ? { userId: patch.userId } : {}),
        ...(patch.userEmail !== undefined ? { userEmail: patch.userEmail } : {}),
        ...(patch.userName !== undefined ? { userName: patch.userName } : {}),
        ...(patch.userPhotoURL !== undefined ? { userPhotoURL: patch.userPhotoURL } : {}),
        ...(patch.lastMessage !== undefined ? { lastMessageAt: patch.lastMessage } : {}),
        ...(patch.lastMessagePreview !== undefined
            ? { lastMessagePreview: patch.lastMessagePreview }
            : {}),
        ...(patch.lastMessageRole !== undefined ? { lastMessageRole: patch.lastMessageRole } : {}),
        ...(patch.messageCount !== undefined ? { messageCount: patch.messageCount } : {}),
        ...(patch.adminUnreadCount !== undefined ? { adminUnreadCount: patch.adminUnreadCount } : {}),
        ...(patch.customerUnreadCount !== undefined
            ? { customerUnreadCount: patch.customerUnreadCount }
            : {}),
        ...(patch.waitingOn !== undefined ? { waitingOn: patch.waitingOn } : {}),
        ...(patch.isEscalated !== undefined ? { isEscalated: patch.isEscalated } : {}),
        ...(patch.escalationStatus !== undefined
            ? { escalationStatus: patch.escalationStatus }
            : {}),
    };
}

export function mapRealtimeInboxSession(
    sessionId: string,
    data: Record<string, unknown>,
): AdminChatSession {
    const summary = mapRealtimeSessionSummary(sessionId, data);
    const sessionPatch = buildSessionPatchFromSummary(summary);

    return {
        sessionId,
        ...sessionPatch,
        messageCount: sessionPatch.messageCount ?? 0,
        lastMessage: sessionPatch.lastMessage ?? new Date().toISOString(),
        adminUnreadCount: sessionPatch.adminUnreadCount ?? 0,
        customerUnreadCount: sessionPatch.customerUnreadCount ?? 0,
        assignedAdminEmail: data.assignedAdminEmail as string | undefined,
        userEmailNormalized: data.userEmailNormalized as string | undefined,
        userNameNormalized: data.userNameNormalized as string | undefined,
        userEmailLocalPartNormalized:
            data.userEmailLocalPartNormalized as string | undefined,
    };
}

export function buildCurrentConversation(
    selectedSessionId: string | null,
    sessions: AdminChatSession[],
    threadSessionMeta: ChatSessionSummary | null,
): AdminChatSession | null {
    return sessions.find((session) => session.sessionId === selectedSessionId) ?? (threadSessionMeta ? {
        sessionId: threadSessionMeta.sessionId,
        userId: threadSessionMeta.userId,
        userEmail: threadSessionMeta.userEmail,
        userName: threadSessionMeta.userName,
        userPhotoURL: threadSessionMeta.userPhotoURL,
        messageCount: threadSessionMeta.messageCount ?? 0,
        lastMessage: threadSessionMeta.lastMessageAt ?? new Date().toISOString(),
        lastMessagePreview: threadSessionMeta.lastMessagePreview,
        lastMessageRole: threadSessionMeta.lastMessageRole,
        adminUnreadCount: threadSessionMeta.adminUnreadCount ?? 0,
        customerUnreadCount: threadSessionMeta.customerUnreadCount ?? 0,
        waitingOn: threadSessionMeta.waitingOn,
        isEscalated:
            threadSessionMeta.isEscalated ??
            (threadSessionMeta.escalationStatus !== undefined
                ? isOpenEscalationStatus(threadSessionMeta.escalationStatus)
                : false),
        escalationStatus: threadSessionMeta.escalationStatus,
    } : null);
}
