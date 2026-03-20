import type { KeyboardEvent } from 'react';
import { buildInitials } from '@/lib/chat/session-metadata';
import { formatTimeOnly } from '@/utils/format';
import type { IChatItemProps, MessageType } from '@/vendor/react-chat-elements';

const AVATAR_SIZE = 40;

type AdminChatStatusTone = 'pending' | 'in_progress' | 'resolved';
type AdminChatMessageRole = 'user' | 'assistant' | 'admin' | 'system';
type AdminChatWorkspaceTab =
    | 'open'
    | 'waiting_on_admin'
    | 'in_progress'
    | 'resolved'
    | 'all';

interface AdminChatSessionRow {
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
    statusTone: AdminChatStatusTone;
    stateDotTone: 'amber' | 'indigo' | 'emerald';
    waitingTone: 'amber' | 'emerald' | 'slate';
    isSelected: boolean;
    avatarUrl?: string;
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

interface AdminChatConversationDetail {
    label: string;
    value: string;
    tone?: 'default' | 'muted' | 'success' | 'warning';
}

interface AdminChatThreadMessage {
    id: string;
    role: AdminChatMessageRole;
    content: string;
    timestamp: string;
    userEmail?: string | null;
    userName?: string | null;
    senderLabel?: string | null;
}

interface AdminChatGroupedMessageDayEntry {
    type: 'day';
    key: string;
    label: string;
}

interface AdminChatGroupedMessageItemEntry {
    type: 'message';
    key: string;
    message: AdminChatThreadMessage;
}

type AdminChatGroupedMessageEntry =
    | AdminChatGroupedMessageDayEntry
    | AdminChatGroupedMessageItemEntry;

export interface AdminChatWorkspaceState {
    sessions: Array<{ sessionId: string }>;
    sessionRows: AdminChatSessionRow[];
    sessionsCursor: string | null;
    hasMoreSessions: boolean;
    isLoadingSessions: boolean;
    isLoadingMoreSessions: boolean;
    selectedSessionId: string | null;
    currentConversation: AdminChatConversation | null;
    currentConversationLabel: string;
    groupedMessages: AdminChatGroupedMessageEntry[];
    messagesCursor: string | null;
    hasMoreMessages: boolean;
    isLoadingMessages: boolean;
    isLoadingOlderMessages: boolean;
    threadSyncMode: 'connecting' | 'live' | 'polling';
    statusTab: AdminChatWorkspaceTab;
    queueInsights: {
        waitingOnAdmin: number;
    };
    inboxSummary: string;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    replyDraft: string;
    setReplyDraft: (value: string) => void;
    isSendingReply: boolean;
    errorMessage: string | null;
    successMessage: string | null;
    hasDetachedThreadMessages: boolean;
    canReply: boolean;
    conversationDetails: AdminChatConversationDetail[];
    handleTabChange: (tab: AdminChatWorkspaceTab) => void;
    handleTabKeyDown: (
        event: KeyboardEvent<HTMLButtonElement>,
        currentIndex: number,
    ) => void;
    selectSession: (sessionId: string) => void;
    clearSelection: () => void;
    focusComposer: () => void;
    handleStatusChange: (status: AdminChatStatusTone) => Promise<void> | void;
    handleReplySubmit: () => Promise<void> | void;
    fetchSessions: (options?: { append?: boolean; cursor?: string | null }) => Promise<void> | void;
    fetchOlderMessages: (sessionId: string, cursor: string | null) => Promise<void> | void;
    refreshSessions: () => Promise<void> | void;
    handleThreadScroll: () => void;
    handleCopy: (value: string, successNotice: string) => Promise<void> | void;
    exportToCSV: () => void;
    injectQuickReply: (quickReply: string) => void;
}

type AdminChatListSource = Pick<AdminChatWorkspaceState, 'sessionRows'>;
type AdminChatThreadSource = Pick<
    AdminChatWorkspaceState,
    'currentConversation' | 'groupedMessages'
>;

function encodeSvg(svg: string) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildFallbackAvatar(
    initials: string,
    background: string,
    foreground = '#ffffff',
) {
    const safeInitials = initials.slice(0, 2).toUpperCase();

    return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" viewBox="0 0 ${AVATAR_SIZE} ${AVATAR_SIZE}">
            <rect width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" rx="20" fill="${background}" />
            <text
                x="50%"
                y="54%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif"
                font-size="14"
                font-weight="700"
                fill="${foreground}"
            >
                ${safeInitials}
            </text>
        </svg>
    `);
}

function getStatusColor(statusTone: AdminChatStatusTone) {
    if (statusTone === 'resolved') return '#16a34a';
    if (statusTone === 'in_progress') return '#2563eb';
    return '#f59e0b';
}

function getMessageTitle(message: AdminChatThreadMessage) {
    if (message.senderLabel) return message.senderLabel;
    if (message.role === 'admin') return 'AEROFREN Support';
    if (message.role === 'assistant') return 'AI AEROFREN';
    if (message.role === 'system') return 'System';
    return message.userName || message.userEmail || 'Customer';
}

function getMessageTitleColor(role: AdminChatThreadMessage['role']) {
    if (role === 'admin') return '#0b5394';
    if (role === 'assistant') return '#4f46e5';
    if (role === 'system') return '#6b7280';
    return '#374151';
}

export function buildRceChatListItems(workspace: AdminChatListSource): IChatItemProps[] {
    return workspace.sessionRows.map((session) => ({
        id: session.sessionId,
        avatar:
            session.avatarUrl ||
            buildFallbackAvatar(
                session.initials || buildInitials(session.name, session.email),
                '#2f414c',
            ),
        alt: session.name,
        title: session.name,
        subtitle: session.preview,
        dateString: session.timestampLabel,
        unread: session.unreadCount,
        statusColor: getStatusColor(session.statusTone),
        statusText: '',
        className: session.isSelected
            ? 'admin-chat-rce__chat-item admin-chat-rce__chat-item--active'
            : 'admin-chat-rce__chat-item',
    }));
}

export function buildRceMessageListItems(workspace: AdminChatThreadSource): MessageType[] {
    const customerAvatar =
        workspace.currentConversation?.userPhotoURL ||
        buildFallbackAvatar(
            buildInitials(
                workspace.currentConversation?.userName,
                workspace.currentConversation?.userEmail,
            ),
            '#475569',
        );
    const assistantAvatar = buildFallbackAvatar('AI', '#4f46e5');

    return workspace.groupedMessages.map((entry): MessageType => {
        if (entry.type === 'day') {
            return {
                id: entry.key,
                type: 'system',
                position: 'left',
                text: entry.label,
                title: 'System',
                focus: false,
                date: new Date(),
                titleColor: '#6b7280',
                forwarded: false,
                replyButton: false,
                removeButton: false,
                status: 'received',
                notch: false,
                retracted: false,
                className: 'admin-chat-rce__message admin-chat-rce__message--system',
            };
        }

        const { message } = entry;
        const isAdmin = message.role === 'admin';
        const isAssistant = message.role === 'assistant';

        return {
            id: message.id,
            type: 'text',
            position: isAdmin ? 'right' : 'left',
            text: message.content,
            title: getMessageTitle(message),
            focus: false,
            date: new Date(message.timestamp),
            dateString: formatTimeOnly(message.timestamp),
            titleColor: getMessageTitleColor(message.role),
            forwarded: false,
            replyButton: false,
            removeButton: false,
            status: isAdmin ? 'read' : 'received',
            notch: true,
            retracted: false,
            avatar: isAdmin ? undefined : isAssistant ? assistantAvatar : customerAvatar,
            className: `admin-chat-rce__message admin-chat-rce__message--${message.role}`,
        };
    });
}
