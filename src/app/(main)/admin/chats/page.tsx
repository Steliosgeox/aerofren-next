/**
 * Admin Chat Workspace
 * Mobile-first inbox for escalated customer conversations with human replies.
 */

"use client";

import { type KeyboardEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronsDown,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Loader2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Reply,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/lib/firebase";
import { HttpError } from "@/services/http";
import {
  type AdminChatSession,
  fetchChatSessionsPage,
  replyToChatSession,
  updateChatSessionStatus,
  markAdminChatRead,
} from "@/services/admin";
import { fetchChatHistoryPage, type ChatHistoryMessage, type ChatSessionSummary } from "@/services/chat";
import { buildInitials, getConversationPrimaryLabel, isOpenEscalationStatus } from "@/lib/chat/session-metadata";
import type { AdminChatStatusFilter, ChatEscalationStatus, ChatMessageRole } from "@/lib/chat/types";
import { formatChatDay, formatTime, formatTimeOnly } from "@/utils/format";

type WorkspaceTab = "open" | "waiting_on_admin" | "in_progress" | "resolved" | "all";

const STATUS_COPY: Record<ChatEscalationStatus, string> = {
  pending: "Σε αναμονή",
  in_progress: "Σε εξέλιξη",
  resolved: "Ολοκληρωμένη",
};

const ROLE_COPY: Record<ChatMessageRole, string> = {
  user: "Χρήστης",
  assistant: "AI",
  admin: "Ομάδα AEROFREN",
  system: "Σύστημα",
};

const QUICK_REPLIES = [
  "Λάβαμε το αίτημά σας και το εξετάζουμε.",
  "Στείλτε μας κωδικό προϊόντος ή φωτογραφία.",
  "Μπορείτε να μας καλέσετε στο 210 3461645.",
];

const ADMIN_CHAT_DRAFT_PREFIX = "admin-chat-draft:";
const ADMIN_CHAT_DRAFT_INDEX_KEY = "admin-chat-draft-index";
const ADMIN_CHAT_SEARCH_LIMIT = 100;
const MAX_STORED_DRAFTS = 20;
const SESSIONS_PAGE_SIZE = 40;
const HISTORY_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;
const SESSION_ID_SEARCH_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPEN_ESCALATION_STATUSES: ChatEscalationStatus[] = ["pending", "in_progress"];
const WORKSPACE_TABS: Array<{ id: WorkspaceTab; label: string; description: string }> = [
  { id: "open", label: "Όλες οι ενεργές", description: "Όλες οι ενεργές, μη ολοκληρωμένες συνομιλίες" },
  { id: "waiting_on_admin", label: "Περιμένουν απάντηση", description: "Ενεργές συνομιλίες που περιμένουν την ομάδα" },
  { id: "in_progress", label: "Σε εξέλιξη", description: "Συνομιλίες που ήδη χειρίζεται η ομάδα" },
  { id: "resolved", label: "Ολοκληρωμένα", description: "Συνομιλίες που έχουν κλείσει" },
  { id: "all", label: "Όλες", description: "Ανοιχτές και ολοκληρωμένες" },
];

function WorkspaceStatusBadge({ status }: { status?: ChatEscalationStatus }) {
  if (!status) return null;
  const classes =
    status === "pending"
      ? "border-amber-400/30 bg-amber-400/[0.12] text-amber-200 shadow-[0_12px_28px_rgba(251,191,36,0.14)]"
      : status === "in_progress"
        ? "border-[var(--theme-accent)]/[0.35] bg-[var(--theme-accent)]/[0.12] text-[var(--theme-accent)] shadow-[0_12px_28px_rgba(0,186,226,0.14)]"
        : "border-emerald-400/30 bg-emerald-400/[0.12] text-emerald-200 shadow-[0_12px_28px_rgba(16,185,129,0.14)]";
  const dotClasses =
    status === "pending"
      ? "bg-amber-300"
      : status === "in_progress"
        ? "bg-[var(--theme-accent)]"
        : "bg-emerald-300";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${classes}`}>
      <span className={`h-2 w-2 rounded-full ${dotClasses}`} />
      {STATUS_COPY[status]}
    </span>
  );
}

function WaitingBadge({ waitingOn, status }: { waitingOn?: AdminChatSession["waitingOn"] | ChatSessionSummary["waitingOn"]; status?: ChatEscalationStatus; }) {
  if (!status || status === "resolved") return null;
  if (waitingOn === "admin") return <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200"><span className="h-2 w-2 rounded-full bg-amber-300" />Αναμένει ομάδα</span>;
  if (waitingOn === "customer") return <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-300" />Περιμένει πελάτη</span>;
  return null;
}

function MessageBubble({ message }: { message: ChatHistoryMessage }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_88%,transparent)] px-4 py-2 text-center text-xs font-medium text-[var(--theme-text-muted)] shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
          {message.content}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";
  const isAdmin = message.role === "admin";
  const roleLabel = isUser ? "Πελάτης" : isAdmin ? "Ομάδα" : "AI";
  const bubbleClass = isUser
    ? "border border-sky-300/20 bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_72%,#1d4ed8))] text-white rounded-br-md shadow-[0_22px_48px_rgba(0,186,226,0.28)]"
    : isAdmin
      ? "border border-emerald-400/[0.22] bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(15,23,42,0.18))] text-[var(--theme-text)] rounded-bl-md shadow-[0_20px_44px_rgba(5,150,105,0.12)]"
      : "border border-[var(--theme-glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent),rgba(15,23,42,0.14))] text-[var(--theme-text)] rounded-bl-md shadow-[0_20px_44px_rgba(0,0,0,0.16)]";
  const roleBadgeClass = isUser
    ? "border border-white/[0.18] bg-white/[0.12] text-white/[0.86]"
    : isAdmin
      ? "border border-emerald-300/[0.18] bg-emerald-400/10 text-emerald-200"
      : "border border-[var(--theme-accent)]/[0.18] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[90%] rounded-[28px] px-4 py-3.5 sm:max-w-[78%] ${bubbleClass}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${roleBadgeClass}`}>
            {roleLabel}
          </span>
          <span className={`text-xs font-semibold ${isUser ? "text-white/[0.88]" : "text-[var(--theme-text)]"}`}>{message.senderLabel || ROLE_COPY[message.role]}</span>
          <span className={`ml-auto text-[11px] ${isUser ? "text-white/[0.72]" : "text-[var(--theme-text-muted)]"}`}>{formatTimeOnly(message.timestamp)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 sm:text-[0.95rem]">{message.content}</p>
      </div>
    </div>
  );
}

function getTimestampMillis(timestamp?: string): number {
  if (!timestamp) return 0;
  const millis = new Date(timestamp).getTime();
  return Number.isFinite(millis) ? millis : 0;
}

function mergeThreadMessages(...slices: ChatHistoryMessage[][]): ChatHistoryMessage[] {
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

function isThreadNearBottom(scroller: HTMLDivElement | null): boolean {
  if (!scroller) return true;

  const distanceFromBottom =
    scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight);

  return distanceFromBottom <= 120;
}

function mapRealtimeThreadMessage(messageDoc: QueryDocumentSnapshot): ChatHistoryMessage {
  const data = messageDoc.data();
  const role = (data.role as ChatMessageRole | undefined) ?? "assistant";

  return {
    id: messageDoc.id,
    role,
    content: (data.content as string | undefined) ?? "",
    timestamp: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    userEmail: data.userEmail as string | undefined,
    userName: data.userName as string | undefined,
    senderLabel:
      role === "admin"
        ? (data.senderLabel as string | undefined) ?? "Ομάδα AEROFREN"
        : role === "assistant"
          ? "AI AEROFREN"
          : role === "system"
            ? "Σύστημα"
            : (data.userName as string | undefined) ?? (data.userEmail as string | undefined),
  };
}

function mapRealtimeSessionSummary(
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
    waitingOn: data.waitingOn as ChatSessionSummary["waitingOn"],
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

function buildSessionPatchFromSummary(session: ChatSessionSummary): Partial<AdminChatSession> {
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

function buildSummaryPatchFromSessionPatch(
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

function mapRealtimeInboxSession(
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

function matchesRealtimeInboxStatus(
  session: AdminChatSession,
  status: AdminChatStatusFilter,
): boolean {
  if (status === "all") return true;
  if (status === "open") return isOpenEscalationStatus(session.escalationStatus);
  return session.escalationStatus === status;
}

function matchesRealtimeInboxNeedsReply(
  session: AdminChatSession,
  needsReply: boolean,
): boolean {
  if (!needsReply) return true;
  return session.waitingOn === "admin" && isOpenEscalationStatus(session.escalationStatus);
}

function matchesRealtimeInboxSearch(
  session: AdminChatSession,
  normalizedSearch: string,
): boolean {
  if (!normalizedSearch) return true;

  if (session.sessionId.toLowerCase() === normalizedSearch) return true;

  if (normalizedSearch.includes("@")) {
    return session.userEmailNormalized?.startsWith(normalizedSearch) ?? false;
  }

  return (
    session.userNameNormalized?.startsWith(normalizedSearch) === true ||
    session.userEmailLocalPartNormalized?.startsWith(normalizedSearch) === true
  );
}

function sortInboxSessionsByLastMessage(
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

function mergeInboxSessions(
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

function patchInboxSessions(
  sessions: AdminChatSession[],
  sessionId: string,
  patch: Partial<AdminChatSession>,
): AdminChatSession[] {
  return sessions.map((session) =>
    session.sessionId === sessionId ? { ...session, ...patch } : session,
  );
}

function readAdminChatDraftIndex(): Record<string, number> {
  try {
    const raw = localStorage.getItem(ADMIN_CHAT_DRAFT_INDEX_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
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

function ChatsPageContent() {
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
  const [statusTab, setStatusTab] = useState<WorkspaceTab>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [hasDetachedThreadMessages, setHasDetachedThreadMessages] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadScrollerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const shouldScrollToBottomRef = useRef(false);
  const olderMessagesRef = useRef<ChatHistoryMessage[]>([]);
  const realtimeSignatureRef = useRef<string | null>(null);

  const sessions = useMemo(
    () => mergeInboxSessions(pagedSessions, realtimeSessions),
    [pagedSessions, realtimeSessions],
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

  const messages = useMemo(
    () => mergeThreadMessages(olderMessages, realtimeMessages),
    [olderMessages, realtimeMessages],
  );

  useEffect(() => {
    olderMessagesRef.current = olderMessages;
  }, [olderMessages]);

  useEffect(() => {
    const sessionParam = searchParams.get("session");
    if (sessionParam) setSelectedSessionId(sessionParam);
  }, [searchParams]);

  useEffect(() => {
    const textarea = composerRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [replyDraft]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const currentStatusFilter = useMemo<AdminChatStatusFilter>(() => {
    if (statusTab === "open") return "open";
    if (statusTab === "waiting_on_admin") return "open";
    if (statusTab === "in_progress") return "in_progress";
    if (statusTab === "resolved") return "resolved";
    return "all";
  }, [statusTab]);

  const needsReply = statusTab === "waiting_on_admin";
  const activeWorkspaceTab = useMemo(
    () => WORKSPACE_TABS.find((tab) => tab.id === statusTab) ?? WORKSPACE_TABS[0],
    [statusTab],
  );
  const queueInsights = useMemo(() => ({
    active: sessions.filter((session) => isOpenEscalationStatus(session.escalationStatus)).length,
    waitingOnAdmin: sessions.filter((session) => session.waitingOn === "admin" && isOpenEscalationStatus(session.escalationStatus)).length,
    inProgress: sessions.filter((session) => session.escalationStatus === "in_progress").length,
    resolved: sessions.filter((session) => session.escalationStatus === "resolved").length,
    unread: sessions.filter((session) => (session.adminUnreadCount ?? 0) > 0).length,
  }), [sessions]);
  const inboxHeadline = useMemo(() => {
    switch (statusTab) {
      case "waiting_on_admin":
        return "Συνομιλίες που χρειάζονται απάντηση";
      case "in_progress":
        return "Συνομιλίες που χειρίζεται η ομάδα";
      case "resolved":
        return "Ιστορικό ολοκληρωμένων συνομιλιών";
      case "all":
        return "Ολόκληρη η ροή συνομιλιών";
      default:
        return "Ενεργές συνομιλίες πελατών";
    }
  }, [statusTab]);
  const inboxSummary = useMemo(() => {
    if (debouncedSearch) {
      return `Αποτελέσματα για “${debouncedSearch}”`;
    }

    return activeWorkspaceTab.description;
  }, [activeWorkspaceTab.description, debouncedSearch]);

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
    shouldScrollToBottomRef.current = false;
    realtimeSignatureRef.current = null;
    previousScrollHeightRef.current = null;
  }, []);

  const scrollThreadToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
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
  }, []);

  const handleThreadScroll = useCallback(() => {
    if (isThreadNearBottom(threadScrollerRef.current)) {
      setHasDetachedThreadMessages(false);
    }
  }, []);

  const currentConversation = useMemo(() => {
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
  }, [selectedSessionId, sessions, threadSessionMeta]);
  const currentConversationLabel = useMemo(
    () => (
      currentConversation
        ? getConversationPrimaryLabel({
            sessionId: currentConversation.sessionId,
            userName: currentConversation.userName,
            userEmail: currentConversation.userEmail,
          })
        : ""
    ),
    [currentConversation],
  );

  const canReply = Boolean(currentConversation && currentConversation.userId && isOpenEscalationStatus(currentConversation.escalationStatus));

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
      const message = error instanceof Error ? error.message : "Αποτυχία φόρτωσης συνομιλιών.";
      setErrorMessage(message);
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) setAuthError(true);
    } finally {
      if (append) setIsLoadingMoreSessions(false);
      else setIsLoadingSessions(false);
    }
  }, [currentStatusFilter, debouncedSearch, needsReply, user]);

  useEffect(() => { if (user) void fetchSessions(); }, [fetchSessions, user]);

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
          console.warn("[admin chats] inbox listener error", error);
        },
      );

    const subscriptions: Array<() => void> = [];

    if (!normalizedSearch) {
      const inboxStatusConstraint =
        currentStatusFilter === "open"
          ? where("escalationStatus", "in", OPEN_ESCALATION_STATUSES)
          : currentStatusFilter !== "all"
            ? where("escalationStatus", "==", currentStatusFilter)
            : null;
      subscriptions.push(
        subscribeToQuery(
          "inbox",
          query(
            collection(db, "chatSessions"),
            ...(inboxStatusConstraint ? [inboxStatusConstraint] : []),
            orderBy("lastMessageAt", "desc"),
            queryLimit(inboxRealtimeSourceLimit),
          ),
        ),
      );
    } else if (exactSearchSessionId) {
      subscriptions.push(
        onSnapshot(
          doc(db, "chatSessions", exactSearchSessionId),
          (snapshot) => {
            sourceResults.set(
              "exact-session",
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
            console.warn("[admin chats] exact inbox listener error", error);
          },
        ),
      );
    } else if (normalizedSearch.includes("@")) {
      subscriptions.push(
        subscribeToQuery(
          "email-search",
          query(
            collection(db, "chatSessions"),
            orderBy("userEmailNormalized"),
            startAt(normalizedSearch),
            endAt(`${normalizedSearch}\uf8ff`),
            queryLimit(ADMIN_CHAT_SEARCH_LIMIT),
          ),
        ),
      );
    } else {
      subscriptions.push(
        subscribeToQuery(
          "name-search",
          query(
            collection(db, "chatSessions"),
            orderBy("userNameNormalized"),
            startAt(normalizedSearch),
            endAt(`${normalizedSearch}\uf8ff`),
            queryLimit(ADMIN_CHAT_SEARCH_LIMIT),
          ),
        ),
      );
      subscriptions.push(
        subscribeToQuery(
          "email-local-search",
          query(
            collection(db, "chatSessions"),
            orderBy("userEmailLocalPartNormalized"),
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
      const message = error instanceof Error ? error.message : "Αποτυχία φόρτωσης μηνυμάτων.";
      setErrorMessage(message);
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
        setAuthError(true);
      }
    } finally {
      setIsLoadingOlderMessages(false);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedSessionId) {
      resetThreadState();
      setIsLoadingMessages(false);
      setReplyDraft("");
      return;
    }

    resetThreadState();
    shouldScrollToBottomRef.current = true;
    setIsLoadingMessages(true);
  }, [resetThreadState, selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId || !user) return;

    let db;
    try {
      db = getFirestoreDb();
    } catch {
      setIsLoadingMessages(false);
      return;
    }

    const sessionRef = doc(db, "chatSessions", selectedSessionId);

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
      console.warn("[admin chats] session listener error", error);
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
      collection(db, "chatMessages"),
      where("sessionId", "==", selectedSessionId),
      orderBy("timestamp", "desc"),
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
        .join("|");
      const hasThreadChanged =
        realtimeSignatureRef.current !== null && realtimeSignatureRef.current !== nextSignature;
      const shouldAutoscroll =
        realtimeSignatureRef.current === null ||
        shouldScrollToBottomRef.current ||
        (hasThreadChanged &&
          isThreadNearBottom(threadScrollerRef.current));

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

      setErrorMessage(null);
      setAuthError(false);
      setIsLoadingMessages(false);
    }, (error) => {
      console.warn("[admin chats] message listener error", error);
      setIsLoadingMessages(false);
      setErrorMessage("Αποτυχία λήψης ενημερώσεων συνομιλίας.");
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      if (errorCode === "permission-denied" || errorCode === "unauthenticated") {
        setAuthError(true);
      }
    });
  }, [selectedSessionId, user]);

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
        console.warn("[admin chats] failed to mark session as read", error);
      });

    return () => {
      cancelled = true;
    };
  }, [applySessionPatch, applyThreadSessionMetaPatch, currentConversation?.adminUnreadCount, isLoadingMessages, messages.length, selectedSessionId, user]);

  useEffect(() => {
    if (!selectedSessionId) return;
    try {
      setReplyDraft(localStorage.getItem(`${ADMIN_CHAT_DRAFT_PREFIX}${selectedSessionId}`) ?? "");
    } catch {
      setReplyDraft("");
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
  }, [isLoadingMessages, isLoadingOlderMessages, messages]);

  const handleTabChange = useCallback((tab: WorkspaceTab) => {
    setStatusTab(tab);
    setSelectedSessionId(null);
    resetThreadState();
    setReplyDraft("");
    setMobileActionsOpen(false);
    router.replace("/admin/chats", { scroll: false });
  }, [resetThreadState, router]);
  const handleTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + direction + WORKSPACE_TABS.length) % WORKSPACE_TABS.length;
    const nextTab = WORKSPACE_TABS[nextIndex];

    if (nextTab) {
      handleTabChange(nextTab.id);
    }
  }, [handleTabChange]);

  const selectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMobileActionsOpen(false);
    router.replace(`/admin/chats?session=${encodeURIComponent(sessionId)}`, { scroll: false });
  }, [router]);

  const clearSelection = useCallback(() => {
    setSelectedSessionId(null);
    resetThreadState();
    setReplyDraft("");
    setMobileActionsOpen(false);
    router.replace("/admin/chats", { scroll: false });
  }, [resetThreadState, router]);

  const handleCopy = useCallback(async (value: string, successNotice: string) => {
    setMobileActionsOpen(false);
    try {
      await navigator.clipboard.writeText(value);
      setErrorMessage(null);
      setSuccessMessage(successNotice);
      window.setTimeout(() => setSuccessMessage((current) => (current === successNotice ? null : current)), 1400);
    } catch {
      setSuccessMessage(null);
      setErrorMessage("Δεν ήταν δυνατή η αντιγραφή.");
    }
  }, []);

  const focusComposer = useCallback(() => {
    setMobileActionsOpen(false);
    window.setTimeout(() => composerRef.current?.focus(), 0);
  }, []);

  const handleStatusChange = useCallback(async (status: ChatEscalationStatus) => {
    if (!user || !selectedSessionId) return;
    const nextWaitingOn =
      status === "resolved"
        ? "none"
        : currentConversation?.waitingOn === "customer"
          ? "customer"
          : "admin";
    const nextAdminUnreadCount =
      status === "resolved"
        ? 0
        : currentConversation?.waitingOn === "admin"
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
      setErrorMessage(error instanceof Error ? error.message : "Αποτυχία ενημέρωσης κατάστασης.");
    } finally {
      setMobileActionsOpen(false);
    }
  }, [applySessionPatch, applyThreadSessionMetaPatch, currentConversation?.adminUnreadCount, currentConversation?.waitingOn, selectedSessionId, user]);

  const handleReplySubmit = useCallback(async () => {
    if (!user || !selectedSessionId || !replyDraft.trim() || !canReply) return;
    const previousDraft = replyDraft.trim();

    setIsSendingReply(true);
    setReplyDraft("");
    setSuccessMessage(null);
    shouldScrollToBottomRef.current = true;

    try {
      await replyToChatSession(user, selectedSessionId, previousDraft);
      removeAdminChatDraft(selectedSessionId);
    } catch (error) {
      setReplyDraft(previousDraft);
      setSuccessMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "Αποτυχία αποστολής απάντησης.");
    } finally {
      setIsSendingReply(false);
    }
  }, [canReply, replyDraft, selectedSessionId, user]);

  const exportToCSV = useCallback(() => {
    if (!selectedSessionId || messages.length === 0) return;
    setMobileActionsOpen(false);
    const header = "Χρόνος,Ρόλος,Αποστολέας,Περιεχόμενο\n";
    const rows = messages.map((message) => {
      const content = message.content.replace(/"/g, '""').replace(/\n/g, " ").replace(/\r/g, "");
      const sender = (message.senderLabel || ROLE_COPY[message.role]).replace(/"/g, '""');
      return `"${message.timestamp}","${ROLE_COPY[message.role]}","${sender}","${content}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat_${selectedSessionId}_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [messages, selectedSessionId]);

  const groupedMessages = useMemo(() => {
    const items: Array<{ type: "day"; key: string; label: string } | { type: "message"; key: string; message: ChatHistoryMessage }> = [];
    let lastDayKey: string | null = null;
    for (const message of messages) {
      const messageTimestamp = message.timestamp;
      const dayKey = messageTimestamp ? new Date(messageTimestamp).toDateString() : null;
      if (dayKey && dayKey !== lastDayKey) {
        items.push({ type: "day", key: `day-${dayKey}`, label: formatChatDay(messageTimestamp) });
        lastDayKey = dayKey;
      }
      items.push({ type: "message", key: message.id, message });
    }
    return items;
  }, [messages]);

  const refreshButton = <Button variant="secondary" size="sm" onClick={() => void fetchSessions()} disabled={isLoadingSessions} className="gap-2"><RefreshCw className={`h-4 w-4 ${isLoadingSessions ? "animate-spin" : ""}`} />Ανανέωση</Button>;

  return (
    <AdminLayout title="Συνομιλίες AI" headerRight={refreshButton} workspace>
      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 p-4 text-sm text-[var(--theme-text)]" role="alert">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{errorMessage}</p>
            {authError && <Button size="sm" onClick={() => window.location.reload()}>Σύνδεση ξανά</Button>}
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-200" role="status" aria-live="polite">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="mb-4 overflow-hidden rounded-[34px] border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)] shadow-[0_32px_72px_rgba(0,0,0,0.24)]">
        <div className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,186,226,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_32%)]" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                AEROFREN Chat Operations
              </span>
              <h2 className="mt-4 text-[1.75rem] font-semibold tracking-[-0.03em] text-[var(--theme-text)] sm:text-[2.1rem]">
                {activeWorkspaceTab.label}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--theme-text-muted)]">
                {debouncedSearch ? `Ζωντανή προβολή για “${debouncedSearch}”. Τα αποτελέσματα συγχρονίζονται σε πραγματικό χρόνο.` : activeWorkspaceTab.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px] xl:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                  <MessageCircle className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                  Ενεργές
                </div>
                <p className="mt-3 text-2xl font-semibold text-[var(--theme-text)]">{queueInsights.active}</p>
                <p className="mt-1 text-xs text-[var(--theme-text-muted)]">συνομιλίες σε ανοιχτή ροή</p>
              </div>
              <div className="rounded-[24px] border border-amber-400/[0.15] bg-amber-400/[0.08] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                  <Reply className="h-3.5 w-3.5 text-amber-300" />
                  Περιμένουν ομάδα
                </div>
                <p className="mt-3 text-2xl font-semibold text-[var(--theme-text)]">{queueInsights.waitingOnAdmin}</p>
                <p className="mt-1 text-xs text-[var(--theme-text-muted)]">νήματα που χρειάζονται χειρισμό</p>
              </div>
              <div className="rounded-[24px] border border-[var(--theme-accent)]/[0.15] bg-[var(--theme-accent)]/[0.08] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
                  <Clock3 className="h-3.5 w-3.5" />
                  Σε εξέλιξη
                </div>
                <p className="mt-3 text-2xl font-semibold text-[var(--theme-text)]">{queueInsights.inProgress}</p>
                <p className="mt-1 text-xs text-[var(--theme-text-muted)]">threads με ενεργό χειρισμό</p>
              </div>
              <div className="rounded-[24px] border border-emerald-400/[0.15] bg-emerald-400/[0.08] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Ολοκληρωμένες
                </div>
                <p className="mt-3 text-2xl font-semibold text-[var(--theme-text)]">{queueInsights.resolved}</p>
                <p className="mt-1 text-xs text-[var(--theme-text-muted)]">συνομιλίες στο τρέχον σύνολο</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-220px)] gap-4 lg:grid-cols-[410px_minmax(0,1fr)]">
        <section aria-label="Inbox συνομιλιών" className={`${selectedSessionId ? "hidden lg:flex" : "flex"} min-h-[420px] flex-col rounded-[32px] border border-[var(--theme-glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_94%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_82%,transparent))] shadow-[0_30px_70px_rgba(0,0,0,0.26)]`}>
          <div className="sticky top-0 z-10 rounded-t-[32px] border-b border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_58%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-5">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,186,226,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(15,23,42,0.16))] p-4 sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--theme-text-muted)]">Inbox workspace</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--theme-text)]">{inboxHeadline}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--theme-text-muted)]">{inboxSummary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--theme-text)]">
                      <MessageCircle className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                      {sessions.length} σύνολο
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/[0.15] bg-amber-400/[0.08] px-3 py-1.5 text-[11px] font-semibold text-amber-200">
                      <Reply className="h-3.5 w-3.5" />
                      {queueInsights.unread} με unread
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Αναζήτηση με email, όνομα ή session…"
                      className="h-12 rounded-full border-white/10 bg-black/10 pl-10 text-sm shadow-none"
                    />
                  </div>

                  <div role="radiogroup" aria-label="Ουρές συνομιλιών" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {WORKSPACE_TABS.map((tab, index) => {
                      const TabIcon =
                        tab.id === "waiting_on_admin"
                          ? Reply
                          : tab.id === "in_progress"
                            ? Clock3
                            : tab.id === "resolved"
                              ? CheckCircle2
                              : MessageCircle;
                      const isActive = statusTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          title={tab.description}
                          onClick={() => handleTabChange(tab.id)}
                          onKeyDown={(event) => handleTabKeyDown(event, index)}
                          className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? "border border-[var(--theme-accent)]/[0.35] bg-[var(--theme-accent)] text-white shadow-[0_16px_28px_rgba(0,186,226,0.24)]"
                              : "border border-white/10 bg-black/10 text-[var(--theme-text-muted)] hover:border-[var(--theme-accent)]/20 hover:text-[var(--theme-text)]"
                          }`}
                        >
                          <TabIcon className="h-3.5 w-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
            {isLoadingSessions && sessions.length === 0 ? (
              <div className="grid gap-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={`chat-skeleton-${index}`} className="rounded-[28px] border border-[var(--theme-glass-border)] bg-black/10 p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-4 w-2/3 rounded-full bg-white/10" />
                        <div className="mt-2 h-3 w-1/2 rounded-full bg-white/10" />
                      </div>
                    </div>
                    <div className="h-20 rounded-[20px] bg-white/5" />
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-6 text-center text-[var(--theme-text-muted)]">
                <Sparkles className="h-10 w-10 text-[var(--theme-accent)]/70" />
                <p className="mt-4 text-base font-semibold text-[var(--theme-text)]">Δεν βρέθηκαν συνομιλίες</p>
                <p className="mt-2 max-w-sm text-sm leading-6">Αλλάξτε ουρά ή προσαρμόστε την αναζήτηση για να δείτε άλλο σύνολο συνομιλιών.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const primaryLabel = getConversationPrimaryLabel({ sessionId: session.sessionId, userName: session.userName, userEmail: session.userEmail });
                  const unreadCount = session.adminUnreadCount ?? 0;
                  const isSelected = selectedSessionId === session.sessionId;
                  return (
                    <button
                      key={session.sessionId}
                      type="button"
                      onClick={() => selectSession(session.sessionId)}
                      className={`group relative w-full overflow-hidden rounded-[28px] border px-4 py-4 text-left transition-all ${
                        isSelected
                          ? "border-[var(--theme-accent)]/[0.32] bg-[linear-gradient(180deg,rgba(0,186,226,0.14),rgba(15,23,42,0.12))] shadow-[0_24px_48px_rgba(0,186,226,0.16)]"
                          : "border-[var(--theme-glass-border)] bg-black/10 hover:border-[var(--theme-accent)]/[0.18] hover:bg-white/[0.03]"
                      }`}
                    >
                      {isSelected && <span className="absolute inset-y-4 left-0 w-1 rounded-full bg-[var(--theme-accent)]" />}

                      <div className="flex items-start gap-3">
                        {session.userPhotoURL ? (
                          <Image src={session.userPhotoURL} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--theme-accent),var(--theme-accent-hover))] text-sm font-bold text-white">
                            {buildInitials(session.userName, session.userEmail)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--theme-text)]">{primaryLabel}</p>
                              <p className="mt-1 truncate text-xs text-[var(--theme-text-muted)]">{session.userEmail || "Χωρίς διαθέσιμο email"}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <span className="text-[11px] font-medium text-[var(--theme-text-muted)]">{formatTime(session.lastMessage)}</span>
                              {unreadCount > 0 && (
                                <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-[#08111f]">
                                  {unreadCount} νέα
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <WorkspaceStatusBadge status={session.escalationStatus} />
                            <WaitingBadge waitingOn={session.waitingOn} status={session.escalationStatus} />
                          </div>

                          <div className="mt-3 rounded-[22px] border border-white/6 bg-black/10 px-3 py-3">
                            <p className="line-clamp-2 text-sm leading-6 text-[var(--theme-text-muted)]">
                              {session.lastMessagePreview || "Δεν υπάρχει ακόμη προεπισκόπηση μηνύματος."}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--theme-text-muted)]">
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              {session.messageCount} μηνύματα
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {session.waitingOn === "admin" ? "Προτεραιότητα ομάδας" : session.waitingOn === "customer" ? "Αναμένει πελάτη" : "Χωρίς αναμονή"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className={`absolute right-4 top-4 h-4 w-4 text-[var(--theme-text-muted)] transition-transform ${isSelected ? "translate-x-0 text-[var(--theme-accent)]" : "group-hover:translate-x-0.5"}`} />
                    </button>
                  );
                })}

                {hasMoreSessions && (
                  <div className="pt-1">
                    <Button variant="secondary" className="w-full gap-2 rounded-full border-white/10 bg-black/10" onClick={() => void fetchSessions({ append: true, cursor: sessionsCursor })} disabled={isLoadingMoreSessions}>
                      {isLoadingMoreSessions ? <><Loader2 className="h-4 w-4 animate-spin" />Φόρτωση…</> : "Περισσότερες συνομιλίες"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
        <section aria-label="Ανοιχτό νήμα" className={`${selectedSessionId ? "flex" : "hidden lg:flex"} min-h-[420px] flex-col overflow-hidden rounded-[36px] border border-[var(--theme-glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_94%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_84%,transparent))] shadow-[0_36px_84px_rgba(0,0,0,0.28)]`}>
          {!selectedSessionId || !currentConversation ? (
            <div className="relative flex h-full min-h-[420px] items-center justify-center overflow-hidden px-6 py-10 text-center text-[var(--theme-text-muted)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,186,226,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
              <div className="relative max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-black/10 text-[var(--theme-accent)] shadow-[0_24px_44px_rgba(0,186,226,0.16)]">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--theme-text-muted)]">Live thread</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--theme-text)]">Επιλέξτε συνομιλία</p>
                <p className="mt-3 text-sm leading-6 text-[var(--theme-text-muted)]">Ανοίξτε ένα νήμα από το inbox για να δείτε το ιστορικό, να παρακολουθήσετε τα live updates και να απαντήσετε χωρίς refresh.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-[var(--theme-glass-border)] px-4 py-4 backdrop-blur-xl sm:px-6">
                <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(15,23,42,0.18))] p-4 sm:p-5">
                  <div className="mb-4 flex items-center gap-3 lg:hidden">
                    <button type="button" onClick={clearSelection} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-glass-border)] bg-black/10 text-[var(--theme-text)]" aria-label="Επιστροφή στη λίστα">
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">Live thread</p>
                  </div>

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {currentConversation.userPhotoURL ? (
                          <Image src={currentConversation.userPhotoURL} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-full object-cover" />
                        ) : (
                          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--theme-accent),var(--theme-accent-hover))] text-sm font-bold text-white">
                            {buildInitials(currentConversation.userName, currentConversation.userEmail)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--theme-text-muted)]">Realtime workspace</p>
                          <h3 className="truncate text-[1.7rem] font-semibold tracking-[-0.03em] text-[var(--theme-text)]">{currentConversationLabel}</h3>
                          <p className="mt-1 truncate text-sm text-[var(--theme-text-muted)]">{currentConversation.userEmail || "Χωρίς διαθέσιμο email"}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <WorkspaceStatusBadge status={currentConversation.escalationStatus} />
                        <WaitingBadge waitingOn={currentConversation.waitingOn} status={currentConversation.escalationStatus} />
                        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[11px] text-[var(--theme-text-muted)]">{messages.length} μηνύματα</span>
                        <button type="button" onClick={() => void handleCopy(currentConversation.sessionId, "Το session ID αντιγράφηκε.")} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[11px] text-[var(--theme-text-muted)] transition-colors hover:text-[var(--theme-text)]">
                          <Copy className="h-3.5 w-3.5" />
                          Session ID
                        </button>
                        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-[11px] text-[var(--theme-text-muted)]">
                          Τελευταία δραστηριότητα {formatTime(currentConversation.lastMessage)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-white/[0.08] bg-black/10 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">Σήματα</p>
                          <p className="mt-2 text-lg font-semibold text-[var(--theme-text)]">{messages.length}</p>
                          <p className="mt-1 text-xs text-[var(--theme-text-muted)]">μηνύματα σε αυτό το νήμα</p>
                        </div>
                        <div className="rounded-[22px] border border-white/[0.08] bg-black/10 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">Κατάσταση ροής</p>
                          <p className="mt-2 text-lg font-semibold text-[var(--theme-text)]">
                            {currentConversation.waitingOn === "admin" ? "Χειρισμός ομάδας" : currentConversation.waitingOn === "customer" ? "Αναμονή πελάτη" : "Χωρίς εκκρεμότητα"}
                          </p>
                          <p className="mt-1 text-xs text-[var(--theme-text-muted)]">σε πραγματικό χρόνο από Firestore</p>
                        </div>
                        <div className="rounded-[22px] border border-white/[0.08] bg-black/10 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">Κανάλι</p>
                          <p className="mt-2 text-lg font-semibold text-[var(--theme-text)]">{currentConversation.userId ? "In-app reply" : "Read only"}</p>
                          <p className="mt-1 text-xs text-[var(--theme-text-muted)]">{currentConversation.userId ? "Άμεση απάντηση από composer" : "Ανώνυμη συνεδρία χωρίς composer"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden max-w-[340px] flex-wrap justify-end gap-2 lg:flex">
                      <Button variant="secondary" size="sm" onClick={focusComposer} disabled={!canReply} className="rounded-full border-white/10 bg-black/10"><Reply className="h-4 w-4" />Απάντηση</Button>
                      <Button variant="secondary" size="sm" onClick={() => void handleStatusChange("in_progress")} disabled={currentConversation.escalationStatus === "in_progress"} className="rounded-full border-white/10 bg-black/10">Σε εξέλιξη</Button>
                      {currentConversation.escalationStatus === "resolved" ? <Button size="sm" onClick={() => void handleStatusChange("pending")} className="rounded-full">Άνοιγμα ξανά</Button> : <Button size="sm" onClick={() => void handleStatusChange("resolved")} className="rounded-full"><CheckCircle2 className="h-4 w-4" />Επίλυση</Button>}
                      {currentConversation.userEmail && <Button variant="secondary" size="sm" onClick={() => void handleCopy(currentConversation.userEmail!, "Το email αντιγράφηκε.")} className="rounded-full border-white/10 bg-black/10"><Mail className="h-4 w-4" />Email</Button>}
                      <Button variant="secondary" size="sm" onClick={exportToCSV} className="rounded-full border-white/10 bg-black/10"><Download className="h-4 w-4" />Εξαγωγή</Button>
                    </div>

                    <button type="button" onClick={() => setMobileActionsOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-glass-border)] bg-black/10 text-[var(--theme-text)] lg:hidden" aria-label="Περισσότερες ενέργειες"><MoreHorizontal className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

              <div ref={threadScrollerRef} onScroll={handleThreadScroll} className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(0,186,226,0.08),transparent_20%)] px-4 py-5 sm:px-6">
                {isLoadingMessages ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {hasMoreMessages && <div className="flex justify-center"><Button variant="secondary" size="sm" onClick={() => void fetchOlderMessages(currentConversation.sessionId, messagesCursor)} disabled={isLoadingOlderMessages} className="rounded-full border-white/10 bg-black/10">{isLoadingOlderMessages ? <><Loader2 className="h-4 w-4 animate-spin" />Φόρτωση…</> : "Φόρτωση παλαιότερων"}</Button></div>}
                    {groupedMessages.map((entry) => entry.type === "day" ? <div key={entry.key} className="flex justify-center"><span className="rounded-full border border-white/10 bg-black/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--theme-text-muted)] shadow-[0_14px_28px_rgba(0,0,0,0.16)]">{entry.label}</span></div> : <MessageBubble key={entry.key} message={entry.message} />)}
                  </div>
                )}
              </div>

              {hasDetachedThreadMessages && (
                <div className="px-4 pb-1 sm:px-6">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => scrollThreadToLatest()}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-accent)]/25 bg-[color-mix(in_srgb,var(--theme-bg-solid)_80%,transparent)] px-4 py-2 text-xs font-semibold text-[var(--theme-text)] shadow-[0_20px_38px_rgba(0,0,0,0.22)] transition-all hover:-translate-y-0.5 hover:border-[var(--theme-accent)]/45 hover:text-white"
                    >
                      <ChevronsDown className="h-4 w-4" />
                      <span>Νέα μηνύματα • Μετάβαση στο πιο πρόσφατο</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--theme-glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-bg-solid)_58%,transparent),color-mix(in_srgb,var(--theme-glass-bg)_78%,transparent))] px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] backdrop-blur-xl sm:px-6">
                {!currentConversation.userId ? <p className="rounded-[24px] border border-[var(--theme-glass-border)] bg-black/10 px-4 py-3 text-sm text-[var(--theme-text-muted)]">Οι ανώνυμες συνεδρίες παραμένουν μόνο για ανάγνωση. Δεν υποστηρίζεται in-app απάντηση.</p> : currentConversation.escalationStatus === "resolved" ? <p className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">Η συνομιλία έχει ολοκληρωθεί. Χρησιμοποιήστε «Άνοιγμα ξανά» για να ενεργοποιήσετε ξανά την απάντηση.</p> : !currentConversation.isEscalated ? <p className="rounded-[24px] border border-[var(--theme-glass-border)] bg-black/10 px-4 py-3 text-sm text-[var(--theme-text-muted)]">Η απάντηση ενεργοποιείται μόνο σε κλιμακωμένες συνομιλίες.</p> : (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {QUICK_REPLIES.map((quickReply) => (
                        <button key={quickReply} type="button" onClick={() => setReplyDraft((current) => current.trim().length === 0 ? quickReply : `${current}\n${quickReply}`)} className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs font-semibold text-[var(--theme-text-muted)] transition-all hover:border-[var(--theme-accent)]/25 hover:text-[var(--theme-text)]">
                          {quickReply}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,186,226,0.08),transparent_40%),rgba(2,6,23,0.16)] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.18)]">
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">Response desk</p>
                          <p className="mt-1 text-sm text-[var(--theme-text-muted)]">Απαντάτε στο ίδιο thread χωρίς refresh ή επαναφόρτωση λίστας.</p>
                        </div>
                        <p className="text-xs text-[var(--theme-text-muted)]">`Enter` για αποστολή, `Shift + Enter` για νέα γραμμή.</p>
                      </div>
                      <Textarea ref={composerRef} value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleReplySubmit(); } }} placeholder="Γράψτε απάντηση προς τον πελάτη…" className="min-h-[116px] rounded-[24px] border border-white/10 bg-black/10 px-4 py-3 shadow-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]" />
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-2 text-xs text-[var(--theme-text-muted)]">
                          <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                          Live thread ενεργό
                        </span>
                        <Button onClick={() => void handleReplySubmit()} disabled={!replyDraft.trim() || isSendingReply || !canReply} className="gap-2 self-end rounded-full px-5">
                          {isSendingReply ? <><Loader2 className="h-4 w-4 animate-spin" />Αποστολή…</> : <><Send className="h-4 w-4" />Αποστολή απάντησης</>}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {mobileActionsOpen && currentConversation && <div className="fixed inset-0 z-[90] flex items-end bg-black/55 lg:hidden"><button type="button" className="absolute inset-0" aria-label="Κλείσιμο" onClick={() => setMobileActionsOpen(false)} /><div className="relative z-10 w-full rounded-t-[28px] border border-[var(--theme-glass-border)] bg-[var(--theme-bg-solid)] p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] shadow-[0_-24px_60px_rgba(0,0,0,0.32)]"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-[var(--theme-text)]">Ενέργειες συνομιλίας</p><button type="button" onClick={() => setMobileActionsOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-glass-border)] text-[var(--theme-text)]" aria-label="Κλείσιμο ενεργειών"><X className="h-4 w-4" /></button></div><div className="grid gap-3"><Button variant="secondary" onClick={focusComposer} disabled={!canReply} className="justify-start"><Reply className="h-4 w-4" />Απάντηση</Button><Button variant="secondary" onClick={() => void handleStatusChange("in_progress")} className="justify-start"><Clock3 className="h-4 w-4" />Σήμανση σε εξέλιξη</Button>{currentConversation.escalationStatus === "resolved" ? <Button onClick={() => void handleStatusChange("pending")} className="justify-start"><RefreshCw className="h-4 w-4" />Άνοιγμα ξανά</Button> : <Button onClick={() => void handleStatusChange("resolved")} className="justify-start"><CheckCircle2 className="h-4 w-4" />Επίλυση</Button>}{currentConversation.userEmail && <Button variant="secondary" onClick={() => void handleCopy(currentConversation.userEmail!, "Το email αντιγράφηκε.")} className="justify-start"><Mail className="h-4 w-4" />Αντιγραφή email</Button>}<Button variant="secondary" onClick={() => void handleCopy(currentConversation.sessionId, "Το session ID αντιγράφηκε.")} className="justify-start"><Copy className="h-4 w-4" />Αντιγραφή session ID</Button><Button variant="secondary" onClick={exportToCSV} className="justify-start"><Download className="h-4 w-4" />Εξαγωγή CSV</Button></div></div></div>}
    </AdminLayout>
  );
}

export default function AdminChatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" /></div>}>
      <ChatsPageContent />
    </Suspense>
  );
}
