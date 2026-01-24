/**
 * Admin Chat Logs Page
 * View and manage all customer chat sessions
 * Protected by Firebase Auth (admin only)
 * Glass theme styling with escalation indicators
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Search,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  Download,
  LogOut,
  Shield,
  UserCircle,
  Mail,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { HttpError } from "@/services/http";
import {
  AdminChatSession,
  ChatHistoryMessage,
  fetchChatHistoryPage,
  fetchChatSessionsPage,
  resolveEscalation,
} from "@/services/admin";

function AdminChatsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();

  const [sessions, setSessions] = useState<AdminChatSession[]>([]);
  const [sessionsCursor, setSessionsCursor] = useState<string | null>(null);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMoreSessions, setIsLoadingMoreSessions] = useState(false);

  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatHistoryMessage[]>([]);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  const ESCALATION_LABELS: Record<string, string> = {
    pending: "Σε αναμονή",
    in_progress: "Σε εξέλιξη",
    resolved: "Ολοκληρώθηκε",
  };

  const roleLabel = (role: string) => {
    if (role === "user") return "Χρήστης";
    if (role === "assistant") return "Βοηθός";
    if (role === "system") return "Σύστημα";
    return role;
  };

  // Check URL params for pre-selected session
  useEffect(() => {
    const sessionParam = searchParams.get("session");
    if (sessionParam) {
      setSelectedSession(sessionParam);
    }
  }, [searchParams]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      const timer = setTimeout(() => {
        if (!user) {
          router.push("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, isAdmin, router]);

  const SESSIONS_PAGE_SIZE = 50;
  const MESSAGES_PAGE_SIZE = 50;

  const fetchSessionsPage = useCallback(
    async (options?: { cursor?: string | null; append?: boolean }) => {
      if (!user || !isAdmin) return;

      const append = options?.append ?? false;
      if (append) {
        setIsLoadingMoreSessions(true);
      } else {
        setIsLoadingSessions(true);
      }

      try {
        const data = await fetchChatSessionsPage(user, {
          cursor: options?.cursor ?? null,
          limit: SESSIONS_PAGE_SIZE,
        });

        setSessions((prev) => (append ? [...prev, ...data.items] : data.items));
        setSessionsCursor(data.nextCursor);
        setHasMoreSessions(Boolean(data.nextCursor));
        if (!append) {
          setErrorMessage(null);
          setAuthError(false);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        const message =
          error instanceof Error ? error.message : "Αποτυχία φόρτωσης συνεδριών.";
        setErrorMessage(message);
        if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
          setAuthError(true);
        }
      } finally {
        if (append) {
          setIsLoadingMoreSessions(false);
        } else {
          setIsLoadingSessions(false);
        }
      }
    },
    [user, isAdmin]
  );

  // Load sessions on mount
  useEffect(() => {
    if (user && isAdmin) {
      fetchSessionsPage();
    }
  }, [user, isAdmin, fetchSessionsPage]);

  // Fetch messages for a session
  const fetchMessagesPage = useCallback(
    async (
      sessionId: string,
      options?: { cursor?: string | null; append?: boolean }
    ) => {
      if (!user || !isAdmin) return;

      const append = options?.append ?? false;
      if (!append) {
        setMessages([]);
        setMessagesCursor(null);
        setHasMoreMessages(false);
      }

      if (append) {
        setIsLoadingMoreMessages(true);
      } else {
        setIsLoadingMessages(true);
      }

      try {
        const data = await fetchChatHistoryPage(user, sessionId, {
          cursor: options?.cursor ?? null,
          limit: MESSAGES_PAGE_SIZE,
        });
        setMessages((prev) => (append ? [...data.items, ...prev] : data.items));
        setMessagesCursor(data.nextCursor);
        setHasMoreMessages(Boolean(data.nextCursor));
        if (!append) {
          setErrorMessage(null);
          setAuthError(false);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (!append) {
          setMessages([]);
        }
        const message =
          error instanceof Error ? error.message : "Αποτυχία φόρτωσης μηνυμάτων.";
        setErrorMessage(message);
        if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
          setAuthError(true);
        }
      } finally {
        if (append) {
          setIsLoadingMoreMessages(false);
        } else {
          setIsLoadingMessages(false);
        }
      }
    },
    [user, isAdmin]
  );

  useEffect(() => {
    if (selectedSession && user && isAdmin) {
      fetchMessagesPage(selectedSession);
    }
  }, [selectedSession, user, isAdmin, fetchMessagesPage]);

  // Handle session selection
  const handleSelectSession = (sessionId: string) => {
    setSelectedSession(sessionId);
  };

  // Handle resolve escalation
  const handleResolve = async (sessionId: string) => {
    if (!user?.email) return;
    const success = await resolveEscalation(user, sessionId);
    if (success) {
      await fetchSessionsPage();
    }
  };

  // Filter sessions by search query
  const filteredSessions = sessions.filter((session) =>
    session.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current session info
  const currentSession = sessions.find((s) => s.sessionId === selectedSession);

  // Format timestamp
  const formatTime = (date: string | Date | null | undefined) => {
    const d =
      typeof date === "string"
        ? new Date(date)
        : date instanceof Date
          ? date
          : new Date();
    return d.toLocaleString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export chat to CSV
  const exportToCSV = () => {
    if (!messages.length) return;

    const header = "Χρόνος,Ρόλος,Περιεχόμενο,Χρήστης\n";
    const rows = messages
      .map((msg) => {
        const timestamp = msg.timestamp || new Date().toISOString();
        return `"${timestamp}","${roleLabel(msg.role)}","${msg.content.replace(/"/g, '""')}","${msg.userEmail || "Ανώνυμος"}"`;
      })
      .join("\n");

    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat_${selectedSession}_${new Date().toISOString()}.csv`;
    link.click();
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--theme-bg-solid)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
      </div>
    );
  }

  // Show access denied for non-admins
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--theme-bg-solid)" }}>
        <div
          className="w-full max-w-md rounded-xl p-8 text-center"
          style={{
            background: "var(--theme-glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--theme-glass-border)",
          }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239, 68, 68, 0.2)" }}
          >
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-2">Πρόσβαση μόνο για διαχειριστές</h2>
          <div className="space-y-4 mt-4">
            <p className="text-[var(--theme-text-muted)]">
              {!user
                ? "Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα."
                : "Ο λογαριασμός σας δεν έχει δικαιώματα διαχειριστή."}
            </p>
            {!user ? (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-[var(--theme-text-inverse)]"
              >
                Σύνδεση
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-[var(--theme-text-muted)]">Συνδεδεμένος ως: {user.email}</p>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
                >
                  Αποσύνδεση
                </Button>
              </div>
            )}
            <Link href="/" className="text-[var(--theme-accent)] text-sm hover:underline block">
              Επιστροφή στην αρχική
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-solid)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: "var(--theme-glass-bg)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--theme-glass-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-[var(--theme-glass-bg)] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--theme-text)]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--theme-text)]">Καταγραφές συνομιλιών</h1>
                <p className="text-sm text-[var(--theme-text-muted)]">
                  {sessions.length} συνομιλίες
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                <UserCircle className="w-4 h-4" />
                {user.displayName || user.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSessionsPage()}
                className="gap-2 border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
              >
                <RefreshCw className="w-4 h-4" />
                Ανανέωση
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {errorMessage && (
          <div
            className="mb-4 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{
              background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--theme-accent) 35%, transparent)",
            }}
            role="alert"
          >
            <div className="text-sm text-[var(--theme-text)]">
              {errorMessage}
            </div>
            {authError && (
              <Button
                size="sm"
                onClick={handleSignOut}
                className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white"
              >
                Σύνδεση ξανά
              </Button>
            )}
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--theme-glass-bg)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--theme-glass-border)",
              }}
            >
              <div className="p-4 border-b border-[var(--theme-glass-border)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
                  <Input
                    placeholder="Αναζήτηση με email ή κωδικό..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-[var(--theme-glass-bg)] border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]"
                  />
                </div>
              </div>
              <div className="divide-y divide-[var(--theme-glass-border)] max-h-[60vh] overflow-y-auto">
                {isLoadingSessions && sessions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--theme-accent)]" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="p-4 text-center text-[var(--theme-text-muted)]">
                    Δεν βρέθηκαν συνομιλίες.
                  </div>
                ) : (
                  <>
                    {filteredSessions.map((session) => {
                      const escalationLabel = session.escalationStatus
                        ? ESCALATION_LABELS[session.escalationStatus] ?? session.escalationStatus
                        : null;
                      return (
                        <button
                          key={session.sessionId}
                          onClick={() => handleSelectSession(session.sessionId)}
                          className={`w-full p-4 text-left hover:bg-[var(--theme-glass-bg)] transition-colors ${selectedSession === session.sessionId
                            ? "bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] border-l-4 border-[var(--theme-accent)]"
                            : ""
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              {session.isEscalated ? (
                                <AlertTriangle
                                  className={`w-4 h-4 flex-shrink-0 ${session.escalationStatus === "pending"
                                    ? "text-yellow-400 animate-pulse"
                                    : session.escalationStatus === "resolved"
                                      ? "text-green-400"
                                      : "text-orange-400"
                                    }`}
                                />
                              ) : session.userEmail ? (
                                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : (
                                <UserCircle className="w-4 h-4 text-[var(--theme-text-muted)] flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm text-[var(--theme-text)] truncate">
                                {session.userName || session.userEmail || `${session.sessionId.slice(0, 12)}...`}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--theme-text-muted)] flex-shrink-0" />
                          </div>
                          {session.userEmail && (
                            <p className="text-xs text-[var(--theme-text-muted)] mt-1 truncate">
                              {session.userEmail}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs text-[var(--theme-text-muted)]">
                              <MessageCircle className="w-3 h-3" />
                              {session.messageCount}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-[var(--theme-text-muted)]">
                              <Clock className="w-3 h-3" />
                              {formatTime(session.lastMessage)}
                            </span>
                            {session.isEscalated && escalationLabel && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${session.escalationStatus === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : session.escalationStatus === "resolved"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-orange-500/20 text-orange-400"
                                  }`}
                              >
                                {escalationLabel}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {hasMoreSessions && (
                      <div className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchSessionsPage({ cursor: sessionsCursor, append: true })}
                          disabled={isLoadingMoreSessions}
                          className="w-full gap-2 border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
                        >
                          {isLoadingMoreSessions ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Φόρτωση...
                            </>
                          ) : (
                            "Περισσότερα"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2">
            <div
              className="h-[70vh] flex flex-col rounded-xl overflow-hidden"
              style={{
                background: "var(--theme-glass-bg)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--theme-glass-border)",
              }}
            >
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[var(--theme-glass-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[var(--theme-text)]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--theme-text)]">
                      {selectedSession
                        ? `Συνεδρία: ${selectedSession.slice(0, 16)}...`
                        : "Επιλέξτε συνομιλία"}
                    </h2>
                    {selectedSession && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--theme-text-muted)]">
                          {messages.length} μηνύματα
                        </p>
                        {currentSession?.isEscalated && currentSession.escalationStatus && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentSession.escalationStatus === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                              : currentSession.escalationStatus === "resolved"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-orange-500/20 text-orange-400"
                              }`}
                          >
                            Κλιμακωμένο — {ESCALATION_LABELS[currentSession.escalationStatus] ?? currentSession.escalationStatus}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedSession &&
                    currentSession?.isEscalated &&
                    currentSession?.escalationStatus !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(selectedSession)}
                        className="gap-2 border-green-600 text-green-400 hover:bg-green-600/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Επίλυση
                      </Button>
                    )}
                  {selectedSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                      className="gap-2 border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
                    >
                      <Download className="w-4 h-4" />
                      Εξαγωγή
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedSession ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
                    <Calendar className="w-12 h-12 mb-4" />
                    <p>Επιλέξτε μια συνομιλία για να δείτε τα μηνύματα.</p>
                  </div>
                ) : isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasMoreMessages && selectedSession && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchMessagesPage(selectedSession, { cursor: messagesCursor, append: true })
                          }
                          disabled={isLoadingMoreMessages}
                          className="gap-2 border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
                        >
                          {isLoadingMoreMessages ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Φόρτωση...
                            </>
                          ) : (
                            "Παλαιότερα"
                          )}
                        </Button>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                            ? "bg-[var(--theme-accent)] text-white rounded-br-sm"
                            : "bg-[var(--theme-glass-bg)] text-[var(--theme-text)] rounded-bl-sm"
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${msg.role === "user"
                              ? "text-[var(--theme-accent)]"
                              : "text-[var(--theme-text-muted)]"
                              }`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--theme-bg-solid)" }}>
          <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
        </div>
      }
    >
      <AdminChatsPageContent />
    </Suspense>
  );
}
