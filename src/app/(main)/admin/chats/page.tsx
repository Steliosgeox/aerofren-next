/**
 * Admin Chat Workspace
 * Mobile-first inbox for escalated customer conversations with human replies.
 */

"use client";

import { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
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

type WorkspaceTab = "open" | "in_progress" | "resolved" | "all";

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

const SESSIONS_PAGE_SIZE = 40;
const HISTORY_PAGE_SIZE = 50;

function WorkspaceStatusBadge({ status }: { status?: ChatEscalationStatus }) {
  if (!status) return null;
  const classes =
    status === "pending"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
      : status === "in_progress"
        ? "border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]"
        : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${classes}`}>{STATUS_COPY[status]}</span>;
}

function WaitingBadge({ waitingOn, status }: { waitingOn?: AdminChatSession["waitingOn"] | ChatSessionSummary["waitingOn"]; status?: ChatEscalationStatus; }) {
  if (!status || status === "resolved") return null;
  if (waitingOn === "admin") return <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">Αναμένει απάντηση</span>;
  if (waitingOn === "customer") return <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">Περιμένει πελάτη</span>;
  return null;
}

function MessageBubble({ message }: { message: ChatHistoryMessage }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="rounded-full border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_86%,transparent)] px-4 py-2 text-center text-xs font-medium text-[var(--theme-text-muted)]">
          {message.content}
        </div>
      </div>
    );
  }

  const isUser = message.role === "user";
  const isAdmin = message.role === "admin";
  const bubbleClass = isUser
    ? "bg-[var(--theme-accent)] text-white rounded-br-md"
    : isAdmin
      ? "border border-emerald-400/25 bg-emerald-400/10 text-[var(--theme-text)] rounded-bl-md"
      : "border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] text-[var(--theme-text)] rounded-bl-md";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.16)] sm:max-w-[78%] ${bubbleClass}`}>
        <div className="mb-1 flex items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${isUser ? "text-white/75" : "text-[var(--theme-text-muted)]"}`}>{message.senderLabel || ROLE_COPY[message.role]}</span>
          <span className={`text-[11px] ${isUser ? "text-white/65" : "text-[var(--theme-text-muted)]"}`}>{formatTimeOnly(message.timestamp)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
      </div>
    </div>
  );
}

function ChatsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AdminChatSession[]>([]);
  const [sessionsCursor, setSessionsCursor] = useState<string | null>(null);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [threadSessionMeta, setThreadSessionMeta] = useState<ChatSessionSummary | null>(null);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [statusTab, setStatusTab] = useState<WorkspaceTab>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery.trim());
  const [replyDraft, setReplyDraft] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadScrollerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number | null>(null);

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

  const currentStatusFilter = useMemo<AdminChatStatusFilter>(() => {
    if (statusTab === "open") return "open";
    if (statusTab === "in_progress") return "in_progress";
    if (statusTab === "resolved") return "resolved";
    return "all";
  }, [statusTab]);

  const needsReply = statusTab === "open";

  const applySessionPatch = useCallback((sessionId: string, patch: Partial<AdminChatSession>) => {
    setSessions((prev) => prev.map((session) => (session.sessionId === sessionId ? { ...session, ...patch } : session)));
    setThreadSessionMeta((prev) => (prev?.sessionId === sessionId ? { ...prev, ...patch } : prev));
  }, []);

  const currentConversation = useMemo(() => {
    return sessions.find((session) => session.sessionId === selectedSessionId) ?? (threadSessionMeta ? {
      sessionId: threadSessionMeta.sessionId,
      userId: threadSessionMeta.userId,
      userEmail: threadSessionMeta.userEmail,
      userName: threadSessionMeta.userName,
      userPhotoURL: threadSessionMeta.userPhotoURL,
      messageCount: messages.length,
      lastMessage: threadSessionMeta.lastMessageAt ?? new Date().toISOString(),
      adminUnreadCount: 0,
      customerUnreadCount: threadSessionMeta.customerUnreadCount ?? 0,
      waitingOn: threadSessionMeta.waitingOn,
      isEscalated: Boolean(threadSessionMeta.escalationStatus),
      escalationStatus: threadSessionMeta.escalationStatus,
    } : null);
  }, [messages.length, selectedSessionId, sessions, threadSessionMeta]);

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
        search: deferredSearch || undefined,
      });
      setSessions((prev) => (append ? [...prev, ...data.items] : data.items));
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
  }, [currentStatusFilter, deferredSearch, needsReply, user]);

  useEffect(() => { if (user) void fetchSessions(); }, [fetchSessions, user]);

  const fetchMessages = useCallback(async (sessionId: string, options?: { cursor?: string | null; append?: boolean }) => {
    if (!user) return;
    const append = options?.append ?? false;
    if (append) {
      setIsLoadingOlderMessages(true);
      previousScrollHeightRef.current = threadScrollerRef.current?.scrollHeight ?? null;
    } else {
      setIsLoadingMessages(true);
      setMessages([]);
      setMessagesCursor(null);
      setHasMoreMessages(false);
    }
    try {
      const data = await fetchChatHistoryPage(user, sessionId, { cursor: options?.cursor ?? null, limit: HISTORY_PAGE_SIZE });
      setMessages((prev) => (append ? [...data.items, ...prev] : data.items));
      setThreadSessionMeta(data.session);
      setMessagesCursor(data.nextCursor);
      setHasMoreMessages(Boolean(data.nextCursor));
      if ((currentConversation?.adminUnreadCount ?? 0) > 0) {
        await markAdminChatRead(user, sessionId);
        applySessionPatch(sessionId, { adminUnreadCount: 0 });
      }
      setErrorMessage(null);
      setAuthError(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Αποτυχία φόρτωσης μηνυμάτων.";
      setErrorMessage(message);
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) setAuthError(true);
    } finally {
      if (append) setIsLoadingOlderMessages(false);
      else setIsLoadingMessages(false);
    }
  }, [applySessionPatch, currentConversation?.adminUnreadCount, user]);

  useEffect(() => {
    if (selectedSessionId && user) void fetchMessages(selectedSessionId);
    else {
      setMessages([]);
      setThreadSessionMeta(null);
      setReplyDraft("");
    }
  }, [fetchMessages, selectedSessionId, user]);

  useEffect(() => {
    if (!selectedSessionId) return;
    try {
      setReplyDraft(localStorage.getItem(`admin-chat-draft:${selectedSessionId}`) ?? "");
    } catch {
      setReplyDraft("");
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;
    try {
      localStorage.setItem(`admin-chat-draft:${selectedSessionId}`, replyDraft);
    } catch {
      // ignore storage failures
    }
  }, [replyDraft, selectedSessionId]);

  useEffect(() => {
    if (!isLoadingOlderMessages) return;
    requestAnimationFrame(() => {
      const scroller = threadScrollerRef.current;
      if (!scroller || previousScrollHeightRef.current === null) return;
      scroller.scrollTop = scroller.scrollHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = null;
    });
  }, [isLoadingOlderMessages, messages]);

  const selectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMobileActionsOpen(false);
    router.replace(`/admin/chats?session=${encodeURIComponent(sessionId)}`, { scroll: false });
  }, [router]);

  const clearSelection = useCallback(() => {
    setSelectedSessionId(null);
    setMessages([]);
    setThreadSessionMeta(null);
    setMobileActionsOpen(false);
    router.replace("/admin/chats", { scroll: false });
  }, [router]);

  const handleCopy = useCallback(async (value: string, successMessage: string) => {
    setMobileActionsOpen(false);
    try {
      await navigator.clipboard.writeText(value);
      setErrorMessage(successMessage);
      window.setTimeout(() => setErrorMessage((current) => (current === successMessage ? null : current)), 1400);
    } catch {
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
      setThreadSessionMeta((prev) => (
        prev?.sessionId === selectedSessionId
          ? { ...prev, escalationStatus: status, waitingOn: nextWaitingOn }
          : prev
      ));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Αποτυχία ενημέρωσης κατάστασης.");
    } finally {
      setMobileActionsOpen(false);
    }
  }, [applySessionPatch, currentConversation?.adminUnreadCount, currentConversation?.waitingOn, selectedSessionId, user]);

  const handleReplySubmit = useCallback(async () => {
    if (!user || !selectedSessionId || !replyDraft.trim() || !canReply) return;
    const optimisticId = `optimistic-${Date.now()}`;
    const previousDraft = replyDraft.trim();
    setIsSendingReply(true);
    setReplyDraft("");
    setMessages((prev) => [...prev, { id: optimisticId, role: "admin", content: previousDraft, timestamp: new Date().toISOString(), senderLabel: "Ομάδα AEROFREN" }]);
    applySessionPatch(selectedSessionId, {
      lastMessage: new Date().toISOString(),
      lastMessagePreview: previousDraft,
      lastMessageRole: "admin",
      waitingOn: "customer",
      escalationStatus: currentConversation?.escalationStatus === "pending" ? "in_progress" : currentConversation?.escalationStatus,
      adminUnreadCount: 0,
      customerUnreadCount: (currentConversation?.customerUnreadCount ?? 0) + 1,
    });
    try {
      await replyToChatSession(user, selectedSessionId, previousDraft);
      try { localStorage.removeItem(`admin-chat-draft:${selectedSessionId}`); } catch {}
      await fetchMessages(selectedSessionId);
    } catch (error) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      setReplyDraft(previousDraft);
      setErrorMessage(error instanceof Error ? error.message : "Αποτυχία αποστολής απάντησης.");
      await fetchMessages(selectedSessionId);
    } finally {
      setIsSendingReply(false);
    }
  }, [applySessionPatch, canReply, currentConversation?.customerUnreadCount, currentConversation?.escalationStatus, fetchMessages, replyDraft, selectedSessionId, user]);

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
    link.download = `chat_${selectedSessionId}_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [messages, selectedSessionId]);

  const groupedMessages = useMemo(() => {
    const items: Array<{ type: "day"; key: string; label: string } | { type: "message"; key: string; message: ChatHistoryMessage }> = [];
    let lastDayKey: string | null = null;
    for (const message of messages) {
      const dayKey = new Date(message.timestamp).toDateString();
      if (dayKey !== lastDayKey) {
        items.push({ type: "day", key: `day-${dayKey}`, label: formatChatDay(message.timestamp) });
        lastDayKey = dayKey;
      }
      items.push({ type: "message", key: message.id, message });
    }
    return items;
  }, [messages]);

  const refreshButton = <Button variant="secondary" size="sm" onClick={() => void fetchSessions()} disabled={isLoadingSessions} className="gap-2"><RefreshCw className={`h-4 w-4 ${isLoadingSessions ? "animate-spin" : ""}`} />Ανανέωση</Button>;
  const workspaceTabs: Array<{ id: WorkspaceTab; label: string }> = [
    { id: "open", label: "Ανοιχτές" },
    { id: "in_progress", label: "Σε εξέλιξη" },
    { id: "resolved", label: "Ολοκληρωμένες" },
    { id: "all", label: "Όλες" },
  ];

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

      <div className="grid min-h-[calc(100vh-220px)] gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section className={`${selectedSessionId ? "hidden lg:flex" : "flex"} min-h-[420px] flex-col rounded-[28px] border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] shadow-[0_24px_60px_rgba(0,0,0,0.22)]`}>
          <div className="sticky top-0 z-10 rounded-t-[28px] border-b border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_55%,transparent)] px-4 py-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">Workspace Inbox</p>
                <p className="mt-1 text-sm text-[var(--theme-text-muted)]">{sessions.length} συνομιλίες</p>
              </div>
              {needsReply && <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-300">Περιμένουν απάντηση</span>}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-text-muted)]" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Αναζήτηση με email, όνομα ή session…" className="pl-9" />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {workspaceTabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setStatusTab(tab.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${statusTab === tab.id ? "bg-[var(--theme-accent)] text-white shadow-[0_12px_24px_rgba(0,186,226,0.24)]" : "border border-[var(--theme-glass-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-accent)]/25 hover:text-[var(--theme-text)]"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingSessions && sessions.length === 0 ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }, (_, index) => <div key={`chat-skeleton-${index}`} className="rounded-2xl border border-[var(--theme-glass-border)] bg-white/5 p-4"><div className="mb-3 flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-white/10" /><div className="flex-1"><div className="h-4 w-2/3 rounded bg-white/10" /><div className="mt-2 h-3 w-1/2 rounded bg-white/10" /></div></div><div className="h-3 w-full rounded bg-white/10" /></div>)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center text-[var(--theme-text-muted)]"><Sparkles className="h-10 w-10 opacity-50" /><p className="text-sm">Δεν βρέθηκαν συνομιλίες για αυτά τα φίλτρα.</p></div>
            ) : (
              <div className="divide-y divide-[var(--theme-glass-border)]">
                {sessions.map((session) => {
                  const primaryLabel = getConversationPrimaryLabel({ sessionId: session.sessionId, userName: session.userName, userEmail: session.userEmail });
                  const unreadCount = session.adminUnreadCount ?? 0;
                  return (
                    <button key={session.sessionId} type="button" onClick={() => selectSession(session.sessionId)} className={`w-full px-4 py-4 text-left transition-all hover:bg-white/5 ${selectedSessionId === session.sessionId ? "border-l-[3px] border-l-[var(--theme-accent)] bg-[var(--theme-accent)]/10" : "border-l-[3px] border-l-transparent"}`}>
                      <div className="flex items-start gap-3">
                        {session.userPhotoURL ? <img src={session.userPhotoURL} alt="" className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--theme-accent),var(--theme-accent-hover))] text-sm font-bold text-white">{buildInitials(session.userName, session.userEmail)}</div>}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--theme-text)]">{primaryLabel}</p><p className="truncate text-xs text-[var(--theme-text-muted)]">{session.userEmail || "Χωρίς διαθέσιμο email"}</p></div>
                            <div className="flex items-center gap-2">{unreadCount > 0 && <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-[#08111f]">{unreadCount}</span>}<ChevronRight className="h-4 w-4 shrink-0 text-[var(--theme-text-muted)]" /></div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2"><WorkspaceStatusBadge status={session.escalationStatus} /><WaitingBadge waitingOn={session.waitingOn} status={session.escalationStatus} /></div>
                          <p className="mt-3 line-clamp-2 text-sm text-[var(--theme-text-muted)]">{session.lastMessagePreview || "Δεν υπάρχει ακόμη προεπισκόπηση μηνύματος."}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--theme-text-muted)]"><span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{session.messageCount}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatTime(session.lastMessage)}</span></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {hasMoreSessions && <div className="p-4"><Button variant="secondary" className="w-full gap-2" onClick={() => void fetchSessions({ append: true, cursor: sessionsCursor })} disabled={isLoadingMoreSessions}>{isLoadingMoreSessions ? <><Loader2 className="h-4 w-4 animate-spin" />Φόρτωση…</> : "Περισσότερες συνομιλίες"}</Button></div>}
              </div>
            )}
          </div>
        </section>
        <section className={`${selectedSessionId ? "flex" : "hidden lg:flex"} min-h-[420px] flex-col overflow-hidden rounded-[32px] border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)] shadow-[0_30px_70px_rgba(0,0,0,0.26)]`}>
          {!selectedSessionId || !currentConversation ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 px-6 text-center text-[var(--theme-text-muted)]"><MessageCircle className="h-12 w-12 opacity-40" /><div><p className="text-base font-semibold text-[var(--theme-text)]">Επιλέξτε συνομιλία</p><p className="mt-1 text-sm">Ανοίξτε μια συνομιλία από το inbox για να δείτε το ιστορικό και να απαντήσετε.</p></div></div>
          ) : (
            <>
              <div className="border-b border-[var(--theme-glass-border)] px-4 py-4 backdrop-blur-xl sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center gap-3 lg:hidden"><button type="button" onClick={clearSelection} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-glass-border)] text-[var(--theme-text)]" aria-label="Επιστροφή στη λίστα"><ArrowLeft className="h-4 w-4" /></button><p className="text-xs uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">Συνομιλία</p></div>
                    <div className="flex flex-wrap items-center gap-3">{currentConversation.userPhotoURL ? <img src={currentConversation.userPhotoURL} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--theme-accent),var(--theme-accent-hover))] text-sm font-bold text-white">{buildInitials(currentConversation.userName, currentConversation.userEmail)}</div>}<div className="min-w-0"><h2 className="truncate text-xl font-bold text-[var(--theme-text)]">{getConversationPrimaryLabel({ sessionId: currentConversation.sessionId, userName: currentConversation.userName, userEmail: currentConversation.userEmail })}</h2><p className="truncate text-sm text-[var(--theme-text-muted)]">{currentConversation.userEmail || "Χωρίς διαθέσιμο email"}</p></div></div>
                    <div className="mt-4 flex flex-wrap items-center gap-2"><WorkspaceStatusBadge status={currentConversation.escalationStatus} /><WaitingBadge waitingOn={currentConversation.waitingOn} status={currentConversation.escalationStatus} /><span className="rounded-full border border-[var(--theme-glass-border)] px-2.5 py-1 text-[11px] text-[var(--theme-text-muted)]">{messages.length} μηνύματα</span><button type="button" onClick={() => void handleCopy(currentConversation.sessionId, "Το session ID αντιγράφηκε.")} className="inline-flex items-center gap-1 rounded-full border border-[var(--theme-glass-border)] px-2.5 py-1 text-[11px] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"><Copy className="h-3 w-3" />Session ID</button><span className="rounded-full border border-[var(--theme-glass-border)] px-2.5 py-1 text-[11px] text-[var(--theme-text-muted)]">Τελευταία δραστηριότητα {formatTime(currentConversation.lastMessage)}</span></div>
                  </div>
                  <div className="hidden items-center gap-2 lg:flex">
                    <Button variant="secondary" size="sm" onClick={focusComposer} disabled={!canReply}><Reply className="h-4 w-4" />Απάντηση</Button>
                    <Button variant="secondary" size="sm" onClick={() => void handleStatusChange("in_progress")} disabled={currentConversation.escalationStatus === "in_progress"}>Σε εξέλιξη</Button>
                    {currentConversation.escalationStatus === "resolved" ? <Button size="sm" onClick={() => void handleStatusChange("pending")}>Άνοιγμα ξανά</Button> : <Button size="sm" onClick={() => void handleStatusChange("resolved")}><CheckCircle2 className="h-4 w-4" />Επίλυση</Button>}
                    {currentConversation.userEmail && <Button variant="secondary" size="sm" onClick={() => void handleCopy(currentConversation.userEmail!, "Το email αντιγράφηκε.")}><Mail className="h-4 w-4" />Email</Button>}
                    <Button variant="secondary" size="sm" onClick={exportToCSV}><Download className="h-4 w-4" />Εξαγωγή</Button>
                  </div>
                  <button type="button" onClick={() => setMobileActionsOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-glass-border)] text-[var(--theme-text)] lg:hidden" aria-label="Περισσότερες ενέργειες"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>

              <div ref={threadScrollerRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                {isLoadingMessages ? <div className="flex h-full min-h-[320px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" /></div> : (
                  <div className="space-y-5">
                    {hasMoreMessages && <div className="flex justify-center"><Button variant="secondary" size="sm" onClick={() => void fetchMessages(currentConversation.sessionId, { append: true, cursor: messagesCursor })} disabled={isLoadingOlderMessages}>{isLoadingOlderMessages ? <><Loader2 className="h-4 w-4 animate-spin" />Φόρτωση…</> : "Φόρτωση παλαιότερων"}</Button></div>}
                    {groupedMessages.map((entry) => entry.type === "day" ? <div key={entry.key} className="flex justify-center"><span className="rounded-full border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_86%,transparent)] px-3 py-1 text-[11px] font-semibold text-[var(--theme-text-muted)]">{entry.label}</span></div> : <MessageBubble key={entry.key} message={entry.message} />)}
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_55%,transparent)] px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] backdrop-blur-xl sm:px-6">
                {!currentConversation.userId ? <p className="rounded-2xl border border-[var(--theme-glass-border)] bg-white/5 px-4 py-3 text-sm text-[var(--theme-text-muted)]">Οι ανώνυμες συνεδρίες παραμένουν μόνο για ανάγνωση. Δεν υποστηρίζεται in-app απάντηση.</p> : currentConversation.escalationStatus === "resolved" ? <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">Η συνομιλία έχει ολοκληρωθεί. Χρησιμοποιήστε «Άνοιγμα ξανά» για να ενεργοποιήσετε ξανά την απάντηση.</p> : !currentConversation.isEscalated ? <p className="rounded-2xl border border-[var(--theme-glass-border)] bg-white/5 px-4 py-3 text-sm text-[var(--theme-text-muted)]">Η απάντηση ενεργοποιείται μόνο σε κλιμακωμένες συνομιλίες.</p> : (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">{QUICK_REPLIES.map((quickReply) => <button key={quickReply} type="button" onClick={() => setReplyDraft((current) => current.trim().length === 0 ? quickReply : `${current}\n${quickReply}`)} className="rounded-full border border-[var(--theme-glass-border)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-text-muted)] transition-all hover:border-[var(--theme-accent)]/25 hover:text-[var(--theme-text)]">{quickReply}</button>)}</div>
                    <div className="rounded-[28px] border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_88%,transparent)] p-3 shadow-[0_24px_50px_rgba(0,0,0,0.18)]">
                      <Textarea ref={composerRef} value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleReplySubmit(); } }} placeholder="Γράψτε απάντηση προς τον πελάτη…" className="min-h-[88px] border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0" />
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[var(--theme-text-muted)]">`Enter` για αποστολή, `Shift + Enter` για νέα γραμμή.</p><Button onClick={() => void handleReplySubmit()} disabled={!replyDraft.trim() || isSendingReply || !canReply} className="gap-2 self-end">{isSendingReply ? <><Loader2 className="h-4 w-4 animate-spin" />Αποστολή…</> : <><Send className="h-4 w-4" />Αποστολή απάντησης</>}</Button></div>
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
