'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEscalations, fetchContactSubmissionsPage } from '@/services/admin';

export interface AppNotification {
    id: string;
    type: 'escalation' | 'contact' | 'escalation_resolved';
    title: string;
    body: string;
    timestamp: Date;
    href: string;
    isRead: boolean;
}

interface NotificationContextValue {
    notifications: AppNotification[];
    unreadCount: number;
    markAllRead: () => void;
    markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
    notifications: [],
    unreadCount: 0,
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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user, isAdmin } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevEscalationIdsRef = useRef<Set<string>>(new Set());
    const prevContactIdsRef = useRef<Set<string>>(new Set());

    // Load read set from localStorage when user changes
    useEffect(() => {
        if (user?.uid) {
            setReadIds(getReadSet(user.uid));
        } else {
            setReadIds(new Set());
            setNotifications([]);
            prevEscalationIdsRef.current = new Set();
            prevContactIdsRef.current = new Set();
        }
    }, [user?.uid]);

    const markAllRead = useCallback(() => {
        if (!user?.uid) return;
        const allIds = new Set(notifications.map((n) => n.id));
        setReadIds(allIds);
        saveReadSet(user.uid, allIds);
    }, [notifications, user?.uid]);

    const markRead = useCallback((id: string) => {
        if (!user?.uid) return;
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            saveReadSet(user.uid!, next);
            return next;
        });
    }, [user?.uid]);

    // ── Regular user: onSnapshot for their own escalatedChats ──────────────
    useEffect(() => {
        if (!user?.uid || isAdmin) return;

        let db;
        try {
            db = getFirestoreDb();
        } catch {
            return;
        }

        const q = query(
            collection(db, 'escalatedChats'),
            where('userId', '==', user.uid),
            orderBy('escalatedAt', 'desc'),
            limit(20)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const notifs: AppNotification[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                const isResolved = data.status === 'resolved';
                return {
                    id: doc.id,
                    type: isResolved ? 'escalation_resolved' as const : 'escalation' as const,
                    title: isResolved ? 'Αίτημα επιλύθηκε' : 'Αίτημα σε εξέλιξη',
                    body: isResolved
                        ? 'Ένας εκπρόσωπος ολοκλήρωσε το αίτημά σας.'
                        : 'Το αίτημά σας λαμβάνει χειρισμό.',
                    timestamp: data.escalatedAt?.toDate?.() ?? new Date(),
                    href: '/',
                    isRead: readIds.has(doc.id),
                };
            });
            setNotifications(notifs);
        }, (error) => {
            console.warn('[NotificationContext] onSnapshot error:', error);
        });

        return () => unsub();
        // readIds intentionally excluded — snapshot must not re-run on read
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isAdmin]);

    // ── Admin: 30s polling for escalations + contacts ──────────────────────
    const pollAdmin = useCallback(async () => {
        if (!user || !isAdmin) return;

        try {
            const [escalations, contactsPage] = await Promise.all([
                fetchEscalations(user),
                fetchContactSubmissionsPage(user, { limit: 20 }),
            ]);

            const newNotifs: AppNotification[] = [];

            for (const esc of escalations) {
                const notifId = `esc:${esc.sessionId}`;
                if (
                    esc.status === 'pending' &&
                    !prevEscalationIdsRef.current.has(esc.sessionId)
                ) {
                    newNotifs.push({
                        id: notifId,
                        type: 'escalation',
                        title: 'Νέα κλιμάκωση',
                        body: `${esc.userName || esc.userEmail || 'Χρήστης'} ζητά βοήθεια`,
                        timestamp: new Date(esc.escalatedAt),
                        href: '/admin/requests',
                        isRead: false,
                    });
                }
            }
            prevEscalationIdsRef.current = new Set(escalations.map((e) => e.sessionId));

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
            prevContactIdsRef.current = new Set(contactsPage.items.map((c) => c.id));

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

    useEffect(() => {
        if (!user || !isAdmin) return;

        pollAdmin();
        pollIntervalRef.current = setInterval(pollAdmin, 30_000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [user, isAdmin, pollAdmin]);

    // Apply current read state to all notifications
    const notificationsWithReadState = notifications.map((n) => ({
        ...n,
        isRead: readIds.has(n.id),
    }));

    const unreadCount = notificationsWithReadState.filter((n) => !n.isRead).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications: notificationsWithReadState,
                unreadCount,
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
