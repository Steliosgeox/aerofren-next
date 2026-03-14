'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCookieConsent } from '@/components/cookies/CookieConsentProvider';
import { getFirestoreDb } from '@/lib/firebase';
import type { ChatEscalationStatus, ChatMessageRole } from '@/lib/chat/types';
import {
    fetchChatHistoryPage,
    markChatSessionRead,
    requestChatCompletion,
    requestEscalation,
    type ChatHistoryMessage,
} from '@/services/chat';
import { HttpError } from '@/services/http';

const STORAGE_KEY = 'aerofren_chat_session';

export interface ChatMessage {
    id: string;
    role: ChatMessageRole;
    content: string;
    timestamp?: string;
    senderLabel?: string;
}

type EscalationRequestResult = 'success' | 'requires_auth' | 'error';

interface ChatContextValue {
    isOpen: boolean;
    openChat: () => void;
    closeChat: () => void;
    sessionId: string;
    messages: ChatMessage[];
    isHydrating: boolean;
    isLoading: boolean;
    supportStatus: ChatEscalationStatus | 'idle';
    escalationStatus: 'idle' | 'loading' | 'success' | 'error';
    escalationErrorMessage: string | null;
    hasUnreadSupportReply: boolean;
    selectSession: (sessionId: string, options?: { persist?: boolean }) => void;
    sendMessage: (message: string) => Promise<void>;
    escalateToHuman: () => Promise<EscalationRequestResult>;
    refreshHistory: (options?: { markRead?: boolean }) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function mapHistoryMessage(message: ChatHistoryMessage): ChatMessage {
    return {
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        senderLabel: message.senderLabel,
    };
}

function getRandomMessageId(): string {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    return Math.floor(random * 2 ** 32).toString(16).padStart(8, '0');
}

function getStoredSessionId(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin') ?? false;
    const { user } = useAuth();
    const { allowFunctional, isReady: cookieConsentReady } = useCookieConsent();

    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string>(() => getStoredSessionId() ?? uuidv4());
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isHydrating, setIsHydrating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [supportStatus, setSupportStatus] = useState<ChatEscalationStatus | 'idle'>('idle');
    const [escalationStatus, setEscalationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [escalationErrorMessage, setEscalationErrorMessage] = useState<string | null>(null);
    const [customerUnreadCount, setCustomerUnreadCount] = useState(0);

    const messagesRef = useRef(messages);
    const refreshRequestIdRef = useRef(0);
    const lastSessionSnapshotRef = useRef<string | null>(null);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const persistSessionId = useCallback((nextSessionId: string) => {
        if (!allowFunctional || !cookieConsentReady) {
            return;
        }

        try {
            localStorage.setItem(STORAGE_KEY, nextSessionId);
        } catch {
            // ignore storage failures
        }
    }, [allowFunctional, cookieConsentReady]);

    const openChat = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeChat = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        if (!cookieConsentReady) return;

        if (!allowFunctional) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {
                // ignore storage failures
            }
            setSessionId(uuidv4());
            return;
        }

        try {
            const storedSessionId = localStorage.getItem(STORAGE_KEY);
            if (storedSessionId) {
                if (storedSessionId !== sessionId) {
                    setSessionId(storedSessionId);
                }
                return;
            }

            localStorage.setItem(STORAGE_KEY, sessionId);
        } catch (error) {
            console.warn('Failed to access localStorage for chat session', error);
        }
    }, [allowFunctional, cookieConsentReady, sessionId]);

    const applyHistory = useCallback((history: Awaited<ReturnType<typeof fetchChatHistoryPage>>) => {
        setMessages(history.items.map(mapHistoryMessage));
        setSupportStatus(history.session?.escalationStatus ?? 'idle');
        setCustomerUnreadCount(history.session?.customerUnreadCount ?? 0);
    }, []);

    const refreshHistory = useCallback(async (options?: { markRead?: boolean }) => {
        if (!user || !sessionId) return;

        const requestId = ++refreshRequestIdRef.current;
        setIsHydrating(true);

        try {
            const history = await fetchChatHistoryPage(user, sessionId, { limit: 50 });
            if (requestId !== refreshRequestIdRef.current) return;

            applyHistory(history);

            if (options?.markRead && (history.session?.customerUnreadCount ?? 0) > 0) {
                await markChatSessionRead(user, sessionId);
                if (requestId !== refreshRequestIdRef.current) return;
                setCustomerUnreadCount(0);
            }
        } catch (error) {
            console.warn('[chat] failed to refresh history', error);
        } finally {
            if (requestId === refreshRequestIdRef.current) {
                setIsHydrating(false);
            }
        }
    }, [applyHistory, sessionId, user]);

    useEffect(() => {
        if (isAdminRoute || !user || !sessionId) return;
        void refreshHistory();
    }, [isAdminRoute, refreshHistory, sessionId, user]);

    useEffect(() => {
        if (isAdminRoute || !user || !sessionId) return;

        let db;
        try {
            db = getFirestoreDb();
        } catch {
            return;
        }

        const sessionRef = doc(db, 'chatSessions', sessionId);

        return onSnapshot(sessionRef, (snapshot) => {
            if (!snapshot.exists()) {
                lastSessionSnapshotRef.current = null;
                return;
            }

            const data = snapshot.data();
            const nextSupportStatus =
                (data.escalationStatus as ChatEscalationStatus | undefined) ?? 'idle';
            const nextCustomerUnreadCount =
                typeof data.customerUnreadCount === 'number' ? data.customerUnreadCount : 0;
            const lastMessageAtMillis =
                typeof data.lastMessageAt?.toMillis === 'function'
                    ? data.lastMessageAt.toMillis()
                    : 0;
            const snapshotSignature = [
                sessionId,
                nextSupportStatus,
                nextCustomerUnreadCount,
                typeof data.messageCount === 'number' ? data.messageCount : '',
                lastMessageAtMillis,
            ].join(':');

            setSupportStatus(nextSupportStatus);
            setCustomerUnreadCount(nextCustomerUnreadCount);
            if (nextSupportStatus === 'pending' || nextSupportStatus === 'in_progress') {
                setEscalationErrorMessage(null);
            }

            if (lastSessionSnapshotRef.current === null) {
                lastSessionSnapshotRef.current = snapshotSignature;
                return;
            }

            if (lastSessionSnapshotRef.current !== snapshotSignature) {
                lastSessionSnapshotRef.current = snapshotSignature;
                void refreshHistory();
            }
        }, (error) => {
            console.warn('[chat] session listener error', error);
        });
    }, [isAdminRoute, refreshHistory, sessionId, user]);

    useEffect(() => {
        lastSessionSnapshotRef.current = null;
    }, [sessionId]);

    useEffect(() => {
        if (!isOpen || !user || !sessionId || customerUnreadCount <= 0) return;

        let cancelled = false;

        void markChatSessionRead(user, sessionId)
            .then(() => {
                if (!cancelled) {
                    setCustomerUnreadCount(0);
                }
            })
            .catch((error) => {
                console.warn('[chat] failed to mark session as read', error);
            });

        return () => {
            cancelled = true;
        };
    }, [customerUnreadCount, isOpen, sessionId, user]);

    const selectSession = useCallback((nextSessionId: string, options?: { persist?: boolean }) => {
        if (sessionId === nextSessionId) {
            return;
        }

        setMessages([]);
        setSupportStatus('idle');
        setEscalationStatus('idle');
        setEscalationErrorMessage(null);
        setCustomerUnreadCount(0);
        setSessionId(nextSessionId);
        if (options?.persist !== false) {
            persistSessionId(nextSessionId);
        }
    }, [persistSessionId, sessionId]);

    const sendMessage = useCallback(async (messageText: string) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isLoading) return;

        const userMessage: ChatMessage = {
            id: getRandomMessageId(),
            role: 'user',
            content: trimmedMessage,
            timestamp: new Date().toISOString(),
            senderLabel: user?.displayName ?? user?.email ?? undefined,
        };

        setIsLoading(true);
        setEscalationErrorMessage(null);
        setMessages((prev) => [...prev, userMessage]);

        try {
            const history = messagesRef.current.slice(-10).map((message) => ({
                role: message.role === 'user' ? 'user' as const : 'assistant' as const,
                content: message.content,
            }));

            const data = await requestChatCompletion(user, {
                message: trimmedMessage,
                sessionId,
                history,
            });

            if (data.sessionId && data.sessionId !== sessionId) {
                setSessionId(data.sessionId);
                persistSessionId(data.sessionId);
            }

            if (data.persisted === false) {
                console.warn(
                    '[chat] server persistence unavailable',
                    JSON.stringify({
                        sessionId: data.sessionId,
                        traceId: data.traceId ?? null,
                        persistenceError: data.persistenceError ?? null,
                    })
                );
            }

            const aiMessage: ChatMessage = {
                id: getRandomMessageId(),
                role: 'assistant',
                content:
                    data.response ||
                    'Λυπούμαστε, δεν μπορέσαμε να απαντήσουμε. Παρακαλούμε δοκιμάστε ξανά.',
                timestamp: new Date().toISOString(),
                senderLabel: 'AI AEROFREN',
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: getRandomMessageId(),
                    role: 'system',
                    content: 'Παρουσιάστηκε πρόβλημα. Δοκιμάστε ξανά ή καλέστε μας στο 210 3461645.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, persistSessionId, sessionId, user]);

    const getEscalationErrorContent = useCallback((error: unknown): string => {
        if (error instanceof HttpError) {
            if (error.status === 401) {
                return 'Η σύνδεσή σας έληξε. Συνδεθείτε ξανά και δοκιμάστε πάλι.';
            }
            if (error.status === 403) {
                return 'Δεν ήταν δυνατή η επιβεβαίωση της συνομιλίας σας για προώθηση σε εκπρόσωπο.';
            }
            if (error.status === 404) {
                return 'Δεν βρέθηκε ιστορικό για αυτή τη συνομιλία. Στείλτε ένα μήνυμα και δοκιμάστε ξανά.';
            }
            if (error.status === 409) {
                return error.message;
            }
            if (error.status === 429) {
                return 'Υπάρχουν πολλές προσπάθειες αυτή τη στιγμή. Δοκιμάστε ξανά σε λίγο.';
            }
            if (error.status === 503) {
                return 'Η υπηρεσία προώθησης σε εκπρόσωπο δεν είναι διαθέσιμη αυτή τη στιγμή. Καλέστε μας στο 210 3461645.';
            }
            if (error.message) {
                return error.message;
            }
        }

        if (error instanceof Error && error.message) {
            return error.message;
        }

        return 'Δεν καταφέραμε να προωθήσουμε το αίτημά σας σε εκπρόσωπο. Δοκιμάστε ξανά ή καλέστε μας στο 210 3461645.';
    }, []);

    const escalateToHuman = useCallback(async (): Promise<EscalationRequestResult> => {
        setEscalationErrorMessage(null);

        if (!user) {
            return 'requires_auth';
        }

        if (supportStatus === 'pending' || supportStatus === 'in_progress') {
            return 'success';
        }

        setEscalationStatus('loading');

        try {
            const result = await requestEscalation(user, sessionId);

            if (result.success) {
                setSupportStatus(result.status);
                setEscalationStatus('success');
                if (messagesRef.current.length === 0) {
                    void refreshHistory().catch((error) => {
                        console.warn('[chat] failed to sync seeded history after escalation', error);
                    });
                }
                return 'success';
            }

            setEscalationStatus('error');
            setEscalationErrorMessage(
                'Δεν καταφέραμε να προωθήσουμε το αίτημά σας σε εκπρόσωπο. Δοκιμάστε ξανά ή καλέστε μας στο 210 3461645.'
            );
            return 'error';
        } catch (error) {
            console.error('Escalation error:', error);
            setEscalationStatus('error');
            setEscalationErrorMessage(getEscalationErrorContent(error));
            return 'error';
        }
    }, [getEscalationErrorContent, refreshHistory, sessionId, supportStatus, user]);

    const hasUnreadSupportReply = customerUnreadCount > 0;

    const value = useMemo<ChatContextValue>(() => ({
        isOpen,
        openChat,
        closeChat,
        sessionId,
        messages,
        isHydrating,
        isLoading,
        supportStatus,
        escalationStatus,
        escalationErrorMessage,
        hasUnreadSupportReply,
        selectSession,
        sendMessage,
        escalateToHuman,
        refreshHistory,
    }), [
        closeChat,
        escalationErrorMessage,
        escalationStatus,
        escalateToHuman,
        hasUnreadSupportReply,
        isHydrating,
        isLoading,
        isOpen,
        messages,
        openChat,
        refreshHistory,
        selectSession,
        sendMessage,
        sessionId,
        supportStatus,
    ]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(): ChatContextValue {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
