'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, type ChatMessage } from '@/contexts/ChatContext';
import { fetchChatSessionsPage, fetchContactSubmissionsPage } from '@/services/admin';

export interface AppNotification {
    id: string;
    type: 'escalation' | 'contact' | 'chat_reply';
    title: string;
    body: string;
    timestamp: Date;
    href: string;
    isRead: boolean;
}

interface NotificationContextValue {
    notifications: AppNotification[];
    unreadCount: number;
    canMarkAllRead: boolean;
    markAllRead: () => void;
    markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
    notifications: [],
    unreadCount: 0,
    canMarkAllRead: false,
    markAllRead: () => {},
    markRead: () => {},
});

function getReadSet(userId: string): Set<string> {
    try {
        const raw = localStorage.getItem(`notifications:read:${userId}`);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set<string>();
    } catch {
        return new Set<string>();
    }
}

function saveReadSet(userId: string, ids: Set<string>) {
    try {
        localStorage.setItem(`notifications:read:${userId}`, JSON.stringify([...ids]));
    } catch {
        // ignore localStorage errors (private browsing, quota, etc.)
    }
}

function buildChatReplyNotification(sessionId: string, messages: ChatMessage[]): AppNotification | null {
    const latestSupportReply = [...messages]
        .reverse()
        .find((message) => message.role === 'admin');

    if (!latestSupportReply) {
        return null;
    }

    const rawTimestamp = latestSupportReply.timestamp ? new Date(latestSupportReply.timestamp) : new Date();
    const timestamp = Number.isNaN(rawTimestamp.getTime()) ? new Date() : rawTimestamp;

    return {
        id: `chat:${sessionId}:${latestSupportReply.id}`,
        type: 'chat_reply',
        title: 'Νέα απάντηση υποστήριξης',
        body: latestSupportReply.content || 'Έχουμε νέα απάντηση για τη συνομιλία σας.',
        timestamp,
        href: `/?chat=open&session=${encodeURIComponent(sessionId)}`,
        isRead: false,
    };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user, isAdmin } = useAuth();
    const userId = user?.uid ?? null;
    // NotificationProvider must be mounted under ChatProvider.
    // Customer chat notifications are derived from the canonical ChatContext state.
    const { hasUnreadSupportReply, messages, sessionId } = useChat();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevEscalationIdsRef = useRef<Set<string>>(new Set());
    const prevContactIdsRef = useRef<Set<string>>(new Set());
    const hasSeededAdminPollRef = useRef(false);

    const resetAdminNotificationState = useCallback(() => {
        setNotifications([]);
        prevEscalationIdsRef.current = new Set();
        prevContactIdsRef.current = new Set();
        hasSeededAdminPollRef.current = false;
    }, []);

    const hydrateReadState = useCallback((nextUserId: string | null) => {
        if (nextUserId) {
            setReadIds(getReadSet(nextUserId));
            return;
        }

        setReadIds(new Set());
        resetAdminNotificationState();
    }, [resetAdminNotificationState]);

    // Load read set from localStorage when user changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncing React state from an external store (localStorage) on user change is the canonical useEffect pattern.
        hydrateReadState(userId);
    }, [hydrateReadState, userId]);

    const chatReplyNotification = useMemo(() => {
        if (isAdmin || !hasUnreadSupportReply) {
            return null;
        }

        return buildChatReplyNotification(sessionId, messages);
    }, [hasUnreadSupportReply, isAdmin, messages, sessionId]);

    const visibleNotifications = useMemo(
        () => (isAdmin ? notifications : chatReplyNotification ? [chatReplyNotification] : []),
        [chatReplyNotification, isAdmin, notifications],
    );

    const markAllRead = useCallback(() => {
        if (!userId) return;

        const newIds = new Set(
            visibleNotifications
                .filter((notification) => notification.type !== 'chat_reply')
                .map((notification) => notification.id),
        );
        setReadIds((prev) => {
            const merged = new Set([...prev, ...newIds]);
            saveReadSet(userId, merged);
            return merged;
        });
    }, [userId, visibleNotifications]);

    const markRead = useCallback((id: string) => {
        if (!userId) return;
        if (id.startsWith('chat:')) return;

        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            saveReadSet(userId, next);
            return next;
        });
    }, [userId]);

    useEffect(() => {
        if (!isAdmin) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: clearing derived admin state when the user loses admin role is a synchronization with auth external state.
            resetAdminNotificationState();
        }
    }, [isAdmin, resetAdminNotificationState]);

    // ── Admin: 30s polling for waiting chat replies + contacts ─────────────
    const pollAdmin = useCallback(async () => {
        if (!user || !isAdmin) return;

        try {
            const [sessionsPage, contactsPage] = await Promise.all([
                fetchChatSessionsPage(user, {
                    limit: 20,
                    status: 'open',
                    needsReply: true,
                }),
                fetchContactSubmissionsPage(user, { limit: 20 }),
            ]);

            const newNotifs: AppNotification[] = [];
            const nextEscalationIds = new Set(
                sessionsPage.items.map((session) => session.sessionId)
            );
            const nextContactIds = new Set(contactsPage.items.map((contact) => contact.id));

            if (!hasSeededAdminPollRef.current) {
                prevEscalationIdsRef.current = nextEscalationIds;
                prevContactIdsRef.current = nextContactIds;
                hasSeededAdminPollRef.current = true;
                return;
            }

            for (const session of sessionsPage.items) {
                const notifId = `esc:${session.sessionId}`;
                if (!prevEscalationIdsRef.current.has(session.sessionId)) {
                    newNotifs.push({
                        id: notifId,
                        type: 'escalation',
                        title: 'Νέα συνομιλία για απάντηση',
                        body: `${session.userName || session.userEmail || 'Χρήστης'} περιμένει απάντηση`,
                        timestamp: new Date(session.lastMessage),
                        href: `/admin/chats?session=${encodeURIComponent(session.sessionId)}`,
                        isRead: false,
                    });
                }
            }
            prevEscalationIdsRef.current = nextEscalationIds;

            for (const contact of contactsPage.items) {
                const notifId = `contact:${contact.id}`;
                if (
                    contact.status === 'new' &&
                    !prevContactIdsRef.current.has(contact.id)
                ) {
                    newNotifs.push({
                        id: notifId,
                        type: 'contact',
                        title: 'Νέα φόρμα επικοινωνίας',
                        body: `${contact.name}: ${contact.subject || contact.message.slice(0, 50)}`,
                        timestamp: new Date(contact.submittedAt),
                        href: '/admin/requests?tab=contacts',
                        isRead: false,
                    });
                }
            }
            prevContactIdsRef.current = nextContactIds;

            if (newNotifs.length > 0) {
                setNotifications((prev) => {
                    const existingIds = new Set(prev.map((n) => n.id));
                    const deduped = newNotifs.filter((n) => !existingIds.has(n.id));
                    return [...deduped, ...prev].slice(0, 50);
                });
            }
        } catch (error) {
            console.warn('[NotificationContext] Admin poll error:', error);
        }
    }, [user, isAdmin]);

    const startAdminPolling = useCallback(() => {
        void pollAdmin();
        pollIntervalRef.current = setInterval(pollAdmin, 30_000);
    }, [pollAdmin]);

    useEffect(() => {
        if (!user || !isAdmin) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: starting a subscription (polling interval) in useEffect is the prescribed React pattern for external data subscriptions.
        startAdminPolling();

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [user, isAdmin, startAdminPolling]);

    // Apply current read state to all notifications
    const notificationsWithReadState = useMemo(
        () => visibleNotifications.map((notification) => ({
            ...notification,
            isRead:
                notification.type === 'chat_reply'
                    ? !hasUnreadSupportReply
                    : readIds.has(notification.id),
        })),
        [hasUnreadSupportReply, readIds, visibleNotifications],
    );

    const unreadCount = notificationsWithReadState.filter((n) => !n.isRead).length;
    const canMarkAllRead = notificationsWithReadState.some(
        (notification) => !notification.isRead && notification.type !== 'chat_reply',
    );

    return (
        <NotificationContext.Provider
            value={{
                notifications: notificationsWithReadState,
                unreadCount,
                canMarkAllRead,
                markAllRead,
                markRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
