'use client';

import {
    type KeyboardEvent,
    type RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    collection,
    doc,
    endAt,
    limit as queryLimit,
    onSnapshot,
    orderBy,
    query,
    startAt,
    where,
} from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestoreDb } from '@/lib/firebase';
import { getConversationPrimaryLabel, isOpenEscalationStatus } from '@/lib/chat/session-metadata';
import type { ChatEscalationStatus } from '@/lib/chat/types';
import {
    ADMIN_CHAT_DRAFT_INDEX_KEY,
    ADMIN_CHAT_DRAFT_PREFIX,
    ADMIN_CHAT_SEARCH_LIMIT,
    HISTORY_PAGE_SIZE,
    MAX_STORED_DRAFTS,
    OPEN_ESCALATION_STATUSES,
    SEARCH_DEBOUNCE_MS,
    SESSION_ID_SEARCH_PATTERN,
    SESSIONS_PAGE_SIZE,
    WORKSPACE_TABS,
    buildConversationDetails,
    buildCurrentConversation,
    buildPrimaryAction,
    buildQueueInsights,
    buildSessionPatchFromSummary,
    buildSessionRowViewModel,
    buildSummaryPatchFromSessionPatch,
    getInboxHeadline,
    getInboxSummary,
    getWorkspaceStatusFilter,
    groupMessagesByDay,
    isThreadNearBottom,
    mapRealtimeInboxSession,
    mapRealtimeSessionSummary,
    mapRealtimeThreadMessage,
    matchesRealtimeInboxNeedsReply,
    matchesRealtimeInboxSearch,
    matchesRealtimeInboxStatus,
    mergeInboxSessions,
    mergeThreadMessages,
    patchInboxSessions,
    tabNeedsReply,
    type WorkspaceTab,
} from '@/lib/admin-chat/workspace';
import {
    type AdminChatSession,
    assignChatSession,
    fetchChatSessionsPage,
    markAdminChatRead,
    replyToChatSession,
    updateChatSessionStatus,
} from '@/services/admin';
import { fetchChatHistoryPage, type ChatHistoryMessage, type ChatSessionSummary } from '@/services/chat';
import { HttpError } from '@/services/http';

const THREAD_UPDATES_ERROR_MESSAGE = 'Αποτυχία λήψης ενημερώσεων συνομιλίας.';
const THREAD_POLL_INTERVAL_MS = 5000;

function readAdminChatDraftIndex(): Record<string, number> {
    try {
        const raw = localStorage.getItem(ADMIN_CHAT_DRAFT_INDEX_KEY);
        if (!raw) return {};

        const parsed = JSON.parse(raw) as Record<string, number>;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function saveAdminChatDraftIndex(index: Record<string, number>) {
    try {
        localStorage.setItem(ADMIN_CHAT_DRAFT_INDEX_KEY, JSON.stringify(index));
    } catch {
        // ignore storage failures
    }
}

function removeAdminChatDraft(sessionId: string) {
    try {
        localStorage.removeItem(`${ADMIN_CHAT_DRAFT_PREFIX}${sessionId}`);
        const nextIndex = readAdminChatDraftIndex();
        delete nextIndex[sessionId];
        saveAdminChatDraftIndex(nextIndex);
    } catch {
        // ignore storage failures
    }
}

function touchAdminChatDraft(sessionId: string) {
    try {
        const nextIndex = readAdminChatDraftIndex();
        nextIndex[sessionId] = Date.now();

        const draftsByAge = Object.entries(nextIndex).sort((left, right) => right[1] - left[1]);
        for (const [staleSessionId] of draftsByAge.slice(MAX_STORED_DRAFTS)) {
            localStorage.removeItem(`${ADMIN_CHAT_DRAFT_PREFIX}${staleSessionId}`);
            delete nextIndex[staleSessionId];
        }

        saveAdminChatDraftIndex(nextIndex);
    } catch {
        // ignore storage failures
    }
}

interface WorkspaceRefs {
    composerRef: RefObject<HTMLTextAreaElement | null>;
    threadScrollerRef: RefObject<HTMLDivElement | null>;
}

export function useAdminChatWorkspace({ composerRef, threadScrollerRef }: WorkspaceRefs) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [pagedSessions, setPagedSessions] = useState<AdminChatSession[]>([]);
    const [realtimeSessions, setRealtimeSessions] = useState<AdminChatSession[]>([]);
    const [sessionsCursor, setSessionsCursor] = useState<string | null>(null);
    const [hasMoreSessions, setHasMoreSessions] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [olderMessages, setOlderMessages] = useState<ChatHistoryMessage[]>([]);
    const [realtimeMessages, setRealtimeMessages] = useState<ChatHistoryMessage[]>([]);
    const [threadSessionMeta, setThreadSessionMeta] = useState<ChatSessionSummary | null>(null);
    const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
    const [threadSyncMode, setThreadSyncMode] = useState<'connecting' | 'live' | 'polling'>(
        'connecting',
    );
    const [statusTab, setStatusTab] = useState<WorkspaceTab>('open');
    const [assignmentFilter, setAssignmentFilterState] = useState<'mine' | 'unassigned' | 'all'>('all');
    const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
    const [teamFilter, setTeamFilterState] = useState<string | null>(null);
    const [folders, setFolders] = useState<{ id: string; name: string; filter: Record<string, string | null> }[]>([]);
    const [activeFolder, setActiveFolderState] = useState<{ id: string; name: string; filter: Record<string, string | null> } | null>(null);
    const [searchQuery, setSearchQueryState] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [replyDraft, setReplyDraftState] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [authError, setAuthError] = useState(false);
    const [mobileActionsOpen, setMobileActionsOpenState] = useState(false);
    const [hasDetachedThreadMessages, setHasDetachedThreadMessages] = useState(false);
    const previousScrollHeightRef = useRef<number | null>(null);
    const shouldScrollToBottomRef = useRef(false);
    const olderMessagesRef = useRef<ChatHistoryMessage[]>([]);
    const realtimeSignatureRef = useRef<string | null>(null);

    const sessions = useMemo(
        () => mergeInboxSessions(pagedSessions, realtimeSessions),
        [pagedSessions, realtimeSessions],
    );
    const filteredSessions = useMemo(() => {
        const email = user?.email?.toLowerCase() ?? null;
        if (assignmentFilter === 'mine' && email) {
            return sessions.filter((s) => (s.assignedAdminEmail ?? '').toLowerCase() === email);
        }
        if (assignmentFilter === 'unassigned') {
            return sessions.filter((s) => !s.assignedAdminEmail);
        }
        return sessions;
    }, [assignmentFilter, sessions, user?.email]);
    const messages = useMemo(
        () => mergeThreadMessages(olderMessages, realtimeMessages),
        [olderMessages, realtimeMessages],
    );
    const currentStatusFilter = useMemo(
        () => getWorkspaceStatusFilter(statusTab),
        [statusTab],
    );
    const needsReply = tabNeedsReply(statusTab);
    const activeWorkspaceTab = useMemo(
        () => WORKSPACE_TABS.find((tab) => tab.id === statusTab) ?? WORKSPACE_TABS[0],
        [statusTab],
    );
    const inboxRealtimeSourceLimit = useMemo(
        () =>
            debouncedSearch
                ? ADMIN_CHAT_SEARCH_LIMIT
                : Math.max((pagedSessions.length + 1) * 4, 160),
        [debouncedSearch, pagedSessions.length],
    );
    const exactSearchSessionId = useMemo(() => {
        const normalizedSearch = debouncedSearch.trim().toLowerCase();
        if (!normalizedSearch) return null;
        if (SESSION_ID_SEARCH_PATTERN.test(normalizedSearch)) return normalizedSearch;
        return pagedSessions.find((session) => session.sessionId.toLowerCase() === normalizedSearch)?.sessionId ?? null;
    }, [debouncedSearch, pagedSessions]);
    const currentConversation = useMemo(
        () => buildCurrentConversation(selectedSessionId, sessions, threadSessionMeta),
        [selectedSessionId, sessions, threadSessionMeta],
    );
    const currentConversationLabel = useMemo(
        () => (
            currentConversation
                ? getConversationPrimaryLabel({
                    sessionId: currentConversation.sessionId,
                    userName: currentConversation.userName,
                    userEmail: currentConversation.userEmail,
                })
                : ''
        ),
        [currentConversation],
    );
    const queueInsights = useMemo(() => buildQueueInsights(sessions), [sessions]);
    const inboxHeadline = useMemo(() => getInboxHeadline(statusTab), [statusTab]);
    const inboxSummary = useMemo(
        () => getInboxSummary(activeWorkspaceTab, debouncedSearch),
        [activeWorkspaceTab, debouncedSearch],
    );
    const groupedMessages = useMemo(() => groupMessagesByDay(messages), [messages]);
    const canReply = Boolean(
        currentConversation &&
        currentConversation.userId &&
        isOpenEscalationStatus(currentConversation.escalationStatus),
    );
    const primaryAction = useMemo(
        () => buildPrimaryAction(currentConversation),
        [currentConversation],
    );
    const conversationDetails = useMemo(
        () => buildConversationDetails(currentConversation, messages.length),
        [currentConversation, messages.length],
    );
    const sessionRows = useMemo(
        () => filteredSessions.map((session) => buildSessionRowViewModel(session, session.sessionId === selectedSessionId)),
        [selectedSessionId, filteredSessions],
    );

    const setAssignmentFilter = useCallback((value: 'mine' | 'unassigned' | 'all') => {
        setAssignmentFilterState(value);
    }, []);

    const setTeamFilter = useCallback((value: string | null) => {
        setTeamFilterState(value);
    }, []);

    const setActiveFolder = useCallback((folder: { id: string; name: string; filter: Record<string, string | null> } | null) => {
        setActiveFolderState(folder);
    }, []);

    const refreshTeams = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/teams', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json() as { teams: { id: string; name: string }[] };
            setTeams(data.teams ?? []);
        } catch { /* non-critical */ }
    }, [user]);

    const refreshFolders = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/folders', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json() as { folders: { id: string; name: string; filter: Record<string, string | null> }[] };
            setFolders(data.folders ?? []);
        } catch { /* non-critical */ }
    }, [user]);

    const createFolder = useCallback(async (name: string) => {
        if (!user || !name.trim()) return;
        try {
            const token = await user.getIdToken();
            await fetch('/api/admin/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: name.trim(), filter: {} }),
            });
            await refreshFolders();
        } catch { /* non-critical */ }
    }, [refreshFolders, user]);

    const deleteFolder = useCallback(async (id: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            await fetch(`/api/admin/folders/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setActiveFolderState((prev) => prev?.id === id ? null : prev);
            await refreshFolders();
        } catch { /* non-critical */ }
    }, [refreshFolders, user]);

    const setSearchQuery = useCallback((value: string) => {
        setSearchQueryState(value);
    }, []);

    const setReplyDraft = useCallback((value: string) => {
        setReplyDraftState(value);
    }, []);

    const setMobileActionsOpen = useCallback((value: boolean) => {
        setMobileActionsOpenState(value);
    }, []);

    const applySessionPatch = useCallback((sessionId: string, patch: Partial<AdminChatSession>) => {
        setPagedSessions((prev) => patchInboxSessions(prev, sessionId, patch));
        setRealtimeSessions((prev) => patchInboxSessions(prev, sessionId, patch));
    }, []);

    const applyThreadSessionMetaPatch = useCallback(
        (sessionId: string, patch: Partial<ChatSessionSummary>) => {
            setThreadSessionMeta((prev) => (
                prev?.sessionId === sessionId ? { ...prev, ...patch } : prev
            ));
        },
        [],
    );

    const resetThreadState = useCallback(() => {
        setOlderMessages([]);
        setRealtimeMessages([]);
        setThreadSessionMeta(null);
        setMessagesCursor(null);
        setHasMoreMessages(false);
        setIsLoadingOlderMessages(false);
        setHasDetachedThreadMessages(false);
        setThreadSyncMode('connecting');
        shouldScrollToBottomRef.current = false;
        realtimeSignatureRef.current = null;
        previousScrollHeightRef.current = null;
    }, []);

    const scrollThreadToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
        const scroller = threadScrollerRef.current;
        if (!scroller) return;

        setHasDetachedThreadMessages(false);
        shouldScrollToBottomRef.current = true;
        requestAnimationFrame(() => {
            scroller.scrollTo({
                top: scroller.scrollHeight,
                behavior,
            });
        });
    }, [threadScrollerRef]);

    const handleThreadScroll = useCallback(() => {
        if (isThreadNearBottom(threadScrollerRef.current)) {
            setHasDetachedThreadMessages(false);
        }
    }, [threadScrollerRef]);

    const fetchSessions = useCallback(async (options?: { append?: boolean; cursor?: string | null }) => {
        if (!user) return;
        const append = options?.append ?? false;
        if (append) setIsLoadingMoreSessions(true);
        else setIsLoadingSessions(true);

        try {
            const data = await fetchChatSessionsPage(user, {
                cursor: options?.cursor ?? null,
                limit: SESSIONS_PAGE_SIZE,
                status: currentStatusFilter,
                needsReply,
                search: debouncedSearch || undefined,
            });

            setPagedSessions((prev) => (
                append ? mergeInboxSessions(prev, data.items) : data.items
            ));
            setSessionsCursor(data.nextCursor);
            setHasMoreSessions(Boolean(data.nextCursor));
            setErrorMessage(null);
            setAuthError(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Αποτυχία φόρτωσης συνομιλιών.';
            setErrorMessage(message);
            if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
                setAuthError(true);
            }
        } finally {
            if (append) setIsLoadingMoreSessions(false);
            else setIsLoadingSessions(false);
        }
    }, [currentStatusFilter, debouncedSearch, needsReply, user]);

    const refreshSessions = useCallback(async () => {
        await fetchSessions();
    }, [fetchSessions]);

    const syncLatestMessages = useCallback(
        async (
            sessionId: string,
            options?: {
                background?: boolean;
                suppressError?: boolean;
            },
        ) => {
            if (!user) return false;
            if (!options?.background) {
                setIsLoadingMessages(true);
            }

            try {
                const data = await fetchChatHistoryPage(user, sessionId, {
                    limit: HISTORY_PAGE_SIZE,
                });

                setRealtimeMessages(data.items);
                if (olderMessagesRef.current.length === 0) {
                    setMessagesCursor(data.nextCursor);
                    setHasMoreMessages(Boolean(data.nextCursor));
                }

                if (data.session) {
                    setThreadSessionMeta((prev) =>
                        prev?.sessionId === sessionId ? { ...prev, ...data.session } : data.session,
                    );
                    applySessionPatch(sessionId, buildSessionPatchFromSummary(data.session));
                }

                setErrorMessage((current) => {
                    if (!options?.suppressError) return null;
                    return current === THREAD_UPDATES_ERROR_MESSAGE ? null : current;
                });
                setAuthError(false);
                return true;
            } catch (error) {
                if (!options?.suppressError) {
                    const message =
                        error instanceof Error ? error.message : 'Αποτυχία φόρτωσης μηνυμάτων.';
                    setErrorMessage(message);
                }
                if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
                    setAuthError(true);
                }
                return false;
            } finally {
                if (!options?.background) {
                    setIsLoadingMessages(false);
                }
            }
        },
        [applySessionPatch, user],
    );

    const fetchOlderMessages = useCallback(async (sessionId: string, cursor: string | null) => {
        if (!user || !cursor) return;

        setIsLoadingOlderMessages(true);
        previousScrollHeightRef.current = threadScrollerRef.current?.scrollHeight ?? null;

        try {
            const data = await fetchChatHistoryPage(user, sessionId, {
                cursor,
                limit: HISTORY_PAGE_SIZE,
            });

            setOlderMessages((prev) => mergeThreadMessages(data.items, prev));

            if (data.session) {
                setThreadSessionMeta((prev) =>
                    prev?.sessionId === sessionId ? { ...prev, ...data.session } : data.session,
                );
            }

            setMessagesCursor(data.nextCursor);
            setHasMoreMessages(Boolean(data.nextCursor));
            setErrorMessage(null);
            setAuthError(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Αποτυχία φόρτωσης μηνυμάτων.';
            setErrorMessage(message);
            if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
                setAuthError(true);
            }
        } finally {
            setIsLoadingOlderMessages(false);
        }
    }, [threadScrollerRef, user]);

    useEffect(() => {
        olderMessagesRef.current = olderMessages;
    }, [olderMessages]);

    // Fetch teams once on mount (after user is available)
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        user.getIdToken().then((token) => {
            if (cancelled) return;
            return fetch('/api/admin/teams', {
                headers: { Authorization: `Bearer ${token}` },
            });
        }).then((res) => {
            if (!res || cancelled) return;
            return res.json() as Promise<{ teams: { id: string; name: string }[] }>;
        }).then((data) => {
            if (!data || cancelled) return;
            setTeams(data.teams ?? []);
        }).catch(() => {
            // non-critical, ignore
        });
        return () => { cancelled = true; };
    }, [user]);

    // Fetch folders once on mount (after user is available)
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        user.getIdToken().then((token) => {
            if (cancelled) return;
            return fetch('/api/admin/folders', {
                headers: { Authorization: `Bearer ${token}` },
            });
        }).then((res) => {
            if (!res || cancelled) return;
            return res.json() as Promise<{ folders: { id: string; name: string; filter: Record<string, string | null> }[] }>;
        }).then((data) => {
            if (!data || cancelled) return;
            setFolders(data.folders ?? []);
        }).catch(() => {
            // non-critical, ignore
        });
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        setSelectedSessionId(searchParams.get('session'));
    }, [searchParams]);

    useEffect(() => {
        const textarea = composerRef.current;
        if (!textarea) return;
        textarea.style.height = '0px';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
    }, [composerRef, replyDraft]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        if (user) void fetchSessions();
    }, [fetchSessions, user]);

    useEffect(() => {
        if (!user) {
            setRealtimeSessions([]);
            return;
        }

        let db;
        try {
            db = getFirestoreDb();
        } catch {
            setRealtimeSessions([]);
            return;
        }

        const normalizedSearch = debouncedSearch.trim().toLowerCase();
        const sourceResults = new Map<string, AdminChatSession[]>();
        setRealtimeSessions([]);

        const syncRealtimeSessions = () => {
            const merged = mergeInboxSessions(...sourceResults.values());
            const nextSessions = merged
                .filter((session) => matchesRealtimeInboxStatus(session, currentStatusFilter))
                .filter((session) => matchesRealtimeInboxNeedsReply(session, needsReply))
                .filter((session) => matchesRealtimeInboxSearch(session, normalizedSearch))
                .slice(0, normalizedSearch ? ADMIN_CHAT_SEARCH_LIMIT : inboxRealtimeSourceLimit);
            setRealtimeSessions(nextSessions);
        };

        const subscribeToQuery = (
            sourceKey: string,
            sourceQuery: ReturnType<typeof query>,
        ) =>
            onSnapshot(
                sourceQuery,
                (snapshot) => {
                    sourceResults.set(
                        sourceKey,
                        snapshot.docs.map((sessionDoc) =>
                            mapRealtimeInboxSession(
                                sessionDoc.id,
                                sessionDoc.data() as Record<string, unknown>,
                            ),
                        ),
                    );
                    syncRealtimeSessions();
                },
                (error) => {
                    console.warn('[admin chats] inbox listener error', error);
                },
            );

        const subscriptions: Array<() => void> = [];

        if (!normalizedSearch) {
            const inboxStatusConstraint =
                currentStatusFilter === 'open'
                    ? where('escalationStatus', 'in', OPEN_ESCALATION_STATUSES)
                    : currentStatusFilter !== 'all'
                        ? where('escalationStatus', '==', currentStatusFilter)
                        : null;
            subscriptions.push(
                subscribeToQuery(
                    'inbox',
                    query(
                        collection(db, 'chatSessions'),
                        ...(inboxStatusConstraint ? [inboxStatusConstraint] : []),
                        orderBy('lastMessageAt', 'desc'),
                        queryLimit(inboxRealtimeSourceLimit),
                    ),
                ),
            );
        } else if (exactSearchSessionId) {
            subscriptions.push(
                onSnapshot(
                    doc(db, 'chatSessions', exactSearchSessionId),
                    (snapshot) => {
                        sourceResults.set(
                            'exact-session',
                            snapshot.exists()
                                ? [
                                    mapRealtimeInboxSession(
                                        snapshot.id,
                                        snapshot.data() as Record<string, unknown>,
                                    ),
                                ]
                                : [],
                        );
                        syncRealtimeSessions();
                    },
                    (error) => {
                        console.warn('[admin chats] exact inbox listener error', error);
                    },
                ),
            );
        } else if (normalizedSearch.includes('@')) {
            subscriptions.push(
                subscribeToQuery(
                    'email-search',
                    query(
                        collection(db, 'chatSessions'),
                        orderBy('userEmailNormalized'),
                        startAt(normalizedSearch),
                        endAt(`${normalizedSearch}\uf8ff`),
                        queryLimit(ADMIN_CHAT_SEARCH_LIMIT),
                    ),
                ),
            );
        } else {
            subscriptions.push(
                subscribeToQuery(
                    'name-search',
                    query(
                        collection(db, 'chatSessions'),
                        orderBy('userNameNormalized'),
                        startAt(normalizedSearch),
                        endAt(`${normalizedSearch}\uf8ff`),
                        queryLimit(ADMIN_CHAT_SEARCH_LIMIT),
                    ),
                ),
            );
            subscriptions.push(
                subscribeToQuery(
                    'email-local-search',
                    query(
                        collection(db, 'chatSessions'),
                        orderBy('userEmailLocalPartNormalized'),
                        startAt(normalizedSearch),
                        endAt(`${normalizedSearch}\uf8ff`),
                        queryLimit(ADMIN_CHAT_SEARCH_LIMIT),
                    ),
                ),
            );
        }

        return () => {
            for (const unsubscribe of subscriptions) {
                unsubscribe();
            }
        };
    }, [
        currentStatusFilter,
        debouncedSearch,
        exactSearchSessionId,
        inboxRealtimeSourceLimit,
        needsReply,
        user,
    ]);

    useEffect(() => {
        if (!selectedSessionId) {
            resetThreadState();
            setIsLoadingMessages(false);
            setReplyDraftState('');
            return;
        }

        resetThreadState();
        shouldScrollToBottomRef.current = true;
        if (!user) {
            setIsLoadingMessages(false);
            return;
        }

        void syncLatestMessages(selectedSessionId);
    }, [resetThreadState, selectedSessionId, syncLatestMessages, user]);

    useEffect(() => {
        if (!selectedSessionId || !user) return;

        let db;
        try {
            db = getFirestoreDb();
        } catch {
            setThreadSyncMode('polling');
            return;
        }

        const sessionRef = doc(db, 'chatSessions', selectedSessionId);

        return onSnapshot(sessionRef, (snapshot) => {
            if (!snapshot.exists()) {
                setThreadSessionMeta(null);
                return;
            }

            const nextSession = mapRealtimeSessionSummary(
                selectedSessionId,
                snapshot.data() as Record<string, unknown>,
            );

            setThreadSessionMeta(nextSession);
            applySessionPatch(selectedSessionId, buildSessionPatchFromSummary(nextSession));
        }, (error) => {
            console.warn('[admin chats] session listener error', error);
        });
    }, [applySessionPatch, selectedSessionId, user]);

    useEffect(() => {
        if (!selectedSessionId || !user) return;

        let db;
        try {
            db = getFirestoreDb();
        } catch {
            setIsLoadingMessages(false);
            return;
        }

        const messagesQuery = query(
            collection(db, 'chatMessages'),
            where('sessionId', '==', selectedSessionId),
            orderBy('timestamp', 'desc'),
            queryLimit(HISTORY_PAGE_SIZE + 1),
        );

        return onSnapshot(messagesQuery, (snapshot) => {
            const docs = snapshot.docs;
            const hasOlderPages = docs.length > HISTORY_PAGE_SIZE;
            const latestDocs = hasOlderPages ? docs.slice(0, HISTORY_PAGE_SIZE) : docs;
            const nextRealtimeMessages = latestDocs.map(mapRealtimeThreadMessage).reverse();
            const nextCursor = hasOlderPages && latestDocs.length > 0
                ? String(
                    latestDocs[latestDocs.length - 1]?.data().timestamp?.toMillis?.() ?? Date.now(),
                )
                : null;
            const nextSignature = latestDocs
                .map((messageDoc) => `${messageDoc.id}:${messageDoc.data().timestamp?.toMillis?.() ?? 0}`)
                .join('|');
            const hasThreadChanged =
                realtimeSignatureRef.current !== null && realtimeSignatureRef.current !== nextSignature;
            const shouldAutoscroll =
                realtimeSignatureRef.current === null ||
                shouldScrollToBottomRef.current ||
                (hasThreadChanged && isThreadNearBottom(threadScrollerRef.current));

            setThreadSyncMode('live');
            realtimeSignatureRef.current = nextSignature;
            setRealtimeMessages(nextRealtimeMessages);

            if (olderMessagesRef.current.length === 0) {
                setMessagesCursor(nextCursor);
                setHasMoreMessages(Boolean(nextCursor));
            }

            if (shouldAutoscroll) {
                shouldScrollToBottomRef.current = true;
                setHasDetachedThreadMessages(false);
            } else if (hasThreadChanged) {
                setHasDetachedThreadMessages(true);
            }

            setErrorMessage((current) =>
                current === THREAD_UPDATES_ERROR_MESSAGE ? null : current,
            );
            setAuthError(false);
            setIsLoadingMessages(false);
        }, (error) => {
            console.warn('[admin chats] message listener error', error);
            setThreadSyncMode('polling');
            setIsLoadingMessages(false);
            const errorCode =
                typeof error === 'object' && error !== null && 'code' in error
                    ? String(error.code)
                    : '';
            if (errorCode === 'permission-denied' || errorCode === 'unauthenticated') {
                setAuthError(true);
            }
            void syncLatestMessages(selectedSessionId, {
                background: true,
                suppressError: true,
            });
        });
    }, [selectedSessionId, syncLatestMessages, threadScrollerRef, user]);

    useEffect(() => {
        if (!selectedSessionId || !user || threadSyncMode !== 'polling') return;

        const intervalId = window.setInterval(() => {
            void syncLatestMessages(selectedSessionId, {
                background: true,
                suppressError: true,
            });
        }, THREAD_POLL_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [selectedSessionId, syncLatestMessages, threadSyncMode, user]);

    useEffect(() => {
        if (!selectedSessionId || !user || isLoadingMessages || messages.length === 0) return;

        const unreadCount = currentConversation?.adminUnreadCount ?? 0;
        if (unreadCount <= 0) return;

        let cancelled = false;

        void markAdminChatRead(user, selectedSessionId)
            .then(() => {
                if (!cancelled) {
                    applySessionPatch(selectedSessionId, { adminUnreadCount: 0 });
                    applyThreadSessionMetaPatch(selectedSessionId, { adminUnreadCount: 0 });
                }
            })
            .catch((error) => {
                console.warn('[admin chats] failed to mark session as read', error);
            });

        return () => {
            cancelled = true;
        };
    }, [applySessionPatch, applyThreadSessionMetaPatch, currentConversation?.adminUnreadCount, isLoadingMessages, messages.length, selectedSessionId, user]);

    useEffect(() => {
        if (!selectedSessionId) return;
        try {
            setReplyDraftState(localStorage.getItem(`${ADMIN_CHAT_DRAFT_PREFIX}${selectedSessionId}`) ?? '');
        } catch {
            setReplyDraftState('');
        }
    }, [selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId) return;
        try {
            if (replyDraft.trim().length === 0) {
                removeAdminChatDraft(selectedSessionId);
                return;
            }

            localStorage.setItem(`${ADMIN_CHAT_DRAFT_PREFIX}${selectedSessionId}`, replyDraft);
            touchAdminChatDraft(selectedSessionId);
        } catch {
            // ignore storage failures
        }
    }, [replyDraft, selectedSessionId]);

    useEffect(() => {
        if (isLoadingOlderMessages) return;

        requestAnimationFrame(() => {
            const scroller = threadScrollerRef.current;
            if (!scroller) return;

            if (previousScrollHeightRef.current !== null) {
                scroller.scrollTop = scroller.scrollHeight - previousScrollHeightRef.current;
                previousScrollHeightRef.current = null;
                return;
            }

            if (!isLoadingMessages && shouldScrollToBottomRef.current) {
                scroller.scrollTop = scroller.scrollHeight;
                shouldScrollToBottomRef.current = false;
                setHasDetachedThreadMessages(false);
            }
        });
    }, [isLoadingMessages, isLoadingOlderMessages, messages, threadScrollerRef]);

    const handleTabChange = useCallback((tab: WorkspaceTab) => {
        setStatusTab(tab);
        setSelectedSessionId(null);
        resetThreadState();
        setReplyDraftState('');
        setMobileActionsOpenState(false);
        router.replace('/admin/chats', { scroll: false });
    }, [resetThreadState, router]);

    const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

        event.preventDefault();

        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (currentIndex + direction + WORKSPACE_TABS.length) % WORKSPACE_TABS.length;
        const nextTab = WORKSPACE_TABS[nextIndex];

        if (nextTab) {
            handleTabChange(nextTab.id);
        }
    }, [handleTabChange]);

    const selectSession = useCallback((sessionId: string) => {
        setSelectedSessionId(sessionId);
        setMobileActionsOpenState(false);
        router.replace(`/admin/chats?session=${encodeURIComponent(sessionId)}`, { scroll: false });
    }, [router]);

    const clearSelection = useCallback(() => {
        setSelectedSessionId(null);
        resetThreadState();
        setReplyDraftState('');
        setMobileActionsOpenState(false);
        router.replace('/admin/chats', { scroll: false });
    }, [resetThreadState, router]);

    const handleCopy = useCallback(async (value: string, successNotice: string) => {
        setMobileActionsOpenState(false);
        try {
            await navigator.clipboard.writeText(value);
            setErrorMessage(null);
            setSuccessMessage(successNotice);
            window.setTimeout(() => setSuccessMessage((current) => (current === successNotice ? null : current)), 1400);
        } catch {
            setSuccessMessage(null);
            setErrorMessage('Δεν ήταν δυνατή η αντιγραφή.');
        }
    }, []);

    const focusComposer = useCallback(() => {
        setMobileActionsOpenState(false);
        window.setTimeout(() => composerRef.current?.focus(), 0);
    }, [composerRef]);

    const handleStatusChange = useCallback(async (status: ChatEscalationStatus) => {
        if (!user || !selectedSessionId) return;

        const nextWaitingOn =
            status === 'resolved'
                ? 'none'
                : currentConversation?.waitingOn === 'customer'
                    ? 'customer'
                    : 'admin';
        const nextAdminUnreadCount =
            status === 'resolved'
                ? 0
                : currentConversation?.waitingOn === 'admin'
                    ? currentConversation.adminUnreadCount
                    : 0;

        try {
            await updateChatSessionStatus(user, selectedSessionId, status);
            applySessionPatch(selectedSessionId, {
                escalationStatus: status,
                waitingOn: nextWaitingOn,
                adminUnreadCount: nextAdminUnreadCount,
            });
            applyThreadSessionMetaPatch(
                selectedSessionId,
                buildSummaryPatchFromSessionPatch({
                    escalationStatus: status,
                    waitingOn: nextWaitingOn,
                    adminUnreadCount: nextAdminUnreadCount,
                }),
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Αποτυχία ενημέρωσης κατάστασης.');
        } finally {
            setMobileActionsOpenState(false);
        }
    }, [applySessionPatch, applyThreadSessionMetaPatch, currentConversation?.adminUnreadCount, currentConversation?.waitingOn, selectedSessionId, user]);

    const handleAssign = useCallback(async (agentEmail: string | null, teamId?: string | null) => {
        if (!user || !selectedSessionId) return;
        try {
            await assignChatSession(user, selectedSessionId, agentEmail, teamId);
            applySessionPatch(selectedSessionId, {
                assignedAdminEmail: agentEmail ?? undefined,
                ...(teamId !== undefined ? { teamId: teamId ?? undefined } : {}),
            });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Αποτυχία ανάθεσης.');
        }
    }, [applySessionPatch, selectedSessionId, user]);

    const handleReplySubmit = useCallback(async () => {
        if (!user || !selectedSessionId || !replyDraft.trim() || !canReply) return;
        const previousDraft = replyDraft.trim();

        setIsSendingReply(true);
        setReplyDraftState('');
        setSuccessMessage(null);
        shouldScrollToBottomRef.current = true;

        try {
            await replyToChatSession(user, selectedSessionId, previousDraft);
            removeAdminChatDraft(selectedSessionId);
            await syncLatestMessages(selectedSessionId, {
                background: true,
                suppressError: true,
            });
        } catch (error) {
            setReplyDraftState(previousDraft);
            setSuccessMessage(null);
            setErrorMessage(error instanceof Error ? error.message : 'Αποτυχία αποστολής απάντησης.');
        } finally {
            setIsSendingReply(false);
        }
    }, [canReply, replyDraft, selectedSessionId, syncLatestMessages, user]);

    const exportToCSV = useCallback(() => {
        if (!selectedSessionId || messages.length === 0) return;
        setMobileActionsOpenState(false);
        const header = 'Χρόνος,Ρόλος,Αποστολέας,Περιεχόμενο\n';
        const rows = messages.map((message) => {
            const content = message.content.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
            const sender = (message.senderLabel || message.role).replace(/"/g, '""');
            return `"${message.timestamp}","${message.role}","${sender}","${content}"`;
        }).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat_${selectedSessionId}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [messages, selectedSessionId]);

    const injectQuickReply = useCallback((quickReply: string) => {
        setReplyDraftState((current) => current.trim().length === 0 ? quickReply : `${current}\n${quickReply}`);
    }, []);

    return {
        userEmail: user?.email ?? null,
        sessions,
        sessionRows,
        assignmentFilter,
        setAssignmentFilter,
        sessionsCursor,
        hasMoreSessions,
        isLoadingSessions,
        isLoadingMoreSessions,
        selectedSessionId,
        currentConversation,
        currentConversationLabel,
        messages,
        groupedMessages,
        messagesCursor,
        hasMoreMessages,
        isLoadingMessages,
        isLoadingOlderMessages,
        threadSyncMode,
        statusTab,
        activeWorkspaceTab,
        queueInsights,
        inboxHeadline,
        inboxSummary,
        searchQuery,
        setSearchQuery,
        debouncedSearch,
        replyDraft,
        setReplyDraft,
        isSendingReply,
        errorMessage,
        successMessage,
        authError,
        mobileActionsOpen,
        setMobileActionsOpen,
        hasDetachedThreadMessages,
        canReply,
        primaryAction,
        conversationDetails,
        handleTabChange,
        handleTabKeyDown,
        selectSession,
        clearSelection,
        focusComposer,
        handleStatusChange,
        handleAssign,
        handleReplySubmit,
        fetchSessions,
        fetchOlderMessages,
        refreshSessions,
        scrollThreadToLatest,
        handleThreadScroll,
        handleCopy,
        exportToCSV,
        injectQuickReply,
        teams,
        setTeamFilter,
        teamFilter,
        refreshTeams,
        folders,
        activeFolder,
        setActiveFolder,
        refreshFolders,
        createFolder,
        deleteFolder,
    };
}
