/**
 * Admin Dashboard Page
 * Protected by Firebase Auth (admin only)
 *
 * Fixes applied vs original:
 * - Sidebar correctly starts below the fixed 100px global header
 * - Replaced all inline style={{ ... }} with Tailwind utility classes
 * - Removed setTimeout redirect (instant redirect on non-admin access)
 * - Skeleton uses Tailwind animate-pulse without raw color-mix
 * - Mobile hamburger positioned below header (top-[116px])
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Users,
  AlertTriangle,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bot,
  Shield,
  Loader2,
  UserCircle,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { HttpError } from "@/services/http";
import { AdminStats, EscalatedChat, fetchAdminStats, fetchEscalations, resolveEscalation } from "@/services/admin";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [escalatedChats, setEscalatedChats] = useState<EscalatedChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Redirect non-admins immediately — no setTimeout
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Fetch data from Firebase
  const fetchData = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      const [statsData, escalationsData] = await Promise.all([
        fetchAdminStats(user),
        fetchEscalations(user),
      ]);
      setStats(statsData);
      setEscalatedChats(escalationsData);
      setErrorMessage(null);
      setAuthError(false);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      const message =
        error instanceof Error ? error.message : "Αποτυχία φόρτωσης δεδομένων.";
      setErrorMessage(message);
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
        setAuthError(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleResolveEscalation = async (sessionId: string) => {
    if (!user?.email) return;
    const success = await resolveEscalation(user, sessionId);
    if (success) {
      await fetchData();
    }
  };

  const formatTime = (timestamp: string | Date | null | undefined) => {
    const date =
      typeof timestamp === "string"
        ? new Date(timestamp)
        : timestamp instanceof Date
          ? timestamp
          : new Date();
    return date.toLocaleString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const STATUS_LABELS: Record<"pending" | "in_progress" | "resolved", string> = {
    pending: "Σε αναμονή",
    in_progress: "Σε εξέλιξη",
    resolved: "Ολοκληρώθηκε",
  };

  const statsCards = stats
    ? [
        {
          label: "Συνολικές συνομιλίες",
          value: stats.totalChats.toString(),
          icon: <MessageCircle className="w-6 h-6" />,
        },
        {
          label: "Κλιμακωμένες συνομιλίες",
          value: stats.escalatedChats.toString(),
          icon: <AlertTriangle className="w-6 h-6" />,
        },
        {
          label: "Εκκρεμείς κλιμακώσεις",
          value: stats.pendingEscalations.toString(),
          icon: <Clock className="w-6 h-6" />,
        },
        {
          label: "Μοναδικοί χρήστες",
          value: stats.uniqueUsers.toString(),
          icon: <Users className="w-6 h-6" />,
        },
      ]
    : [];

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
      </div>
    );
  }

  // Access denied — non-admin logged in users
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg-solid)]">
        <div className="w-full max-w-md rounded-xl p-8 text-center bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] backdrop-blur-md">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-500/20">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-2">
            Πρόσβαση μόνο για διαχειριστές
          </h2>
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
                <p className="text-sm text-[var(--theme-text-muted)]">
                  Συνδεδεμένος ως: {user.email}
                </p>
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
    /*
     * Layout strategy: The global Header is position:fixed at 100px height.
     * We offset everything with pt-[100px] on the outer wrapper so content
     * starts below the header. The sidebar uses top-[100px] when fixed on
     * mobile so it never overlaps the header.
     */
    <div className="min-h-screen flex bg-[var(--theme-bg-solid)] pt-[100px]">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky lg:top-[100px] lg:self-start
          top-[100px] left-0
          z-40
          w-64 h-[calc(100vh-100px)]
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          bg-[var(--theme-glass-bg)] border-r border-[var(--theme-glass-border)] backdrop-blur-md
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <span className="text-[var(--theme-text)] font-bold text-lg">AEROFREN</span>
              <span className="text-[var(--theme-text-muted)] text-xs block">Πίνακας Διαχείρισης</span>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <Image src={user.photoURL} alt="" width={32} height={32} className="w-8 h-8 rounded-full shrink-0" />
              ) : (
                <UserCircle className="w-8 h-8 text-[var(--theme-text-muted)] shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-[var(--theme-text)] truncate">{user.displayName || "Διαχειριστής"}</p>
                <p className="text-xs text-[var(--theme-text-muted)] truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {[
              { label: "Σύνοψη", icon: <TrendingUp className="w-5 h-5" />, active: true, href: "/admin" },
              { label: "Συνομιλίες AI", icon: <Bot className="w-5 h-5" />, active: false, href: "/admin/chats" },
              { label: "Αιτήματα", icon: <MessageCircle className="w-5 h-5" />, active: false, href: "#" },
              { label: "Χρήστες", icon: <Users className="w-5 h-5" />, active: false, href: "#" },
              { label: "Ρυθμίσεις", icon: <Settings className="w-5 h-5" />, active: false, href: "#" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)] text-white shadow-lg"
                    : "text-[var(--theme-text-muted)] hover:bg-white/5 hover:text-[var(--theme-text)]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-[var(--theme-glass-border)]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[var(--theme-text-muted)] hover:bg-white/5 hover:text-[var(--theme-text)] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Αποσύνδεση
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {/* Mobile hamburger — positioned just below header */}
        <button
          className="lg:hidden fixed top-[116px] left-4 z-50 p-2 rounded-xl shadow-lg bg-[var(--theme-glass-bg)] backdrop-blur-md border border-[var(--theme-glass-border)]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-[var(--theme-text)]" /> : <Menu className="w-5 h-5 text-[var(--theme-text)]" />}
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--theme-text)]">Σύνοψη</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-white/5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Ανανέωση
          </Button>
        </div>

        {errorMessage && (
          <div
            className="mb-6 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30"
            role="alert"
          >
            <p className="text-sm text-[var(--theme-text)]">{errorMessage}</p>
            {authError && (
              <Button
                size="sm"
                onClick={handleSignOut}
                className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white shrink-0"
              >
                Σύνδεση ξανά
              </Button>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-6 animate-pulse bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)]"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
                <div className="h-8 w-16 rounded bg-white/10 mb-2" />
                <div className="h-4 w-24 rounded bg-white/10" />
              </div>
            ))
          ) : (
            statsCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-6 bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] backdrop-blur-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)]">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[var(--theme-text)]">{stat.value}</p>
                <p className="text-[var(--theme-text-muted)] text-sm mt-1">{stat.label}</p>
              </div>
            ))
          )}
        </div>

        {/* Escalated Chats */}
        <div className="rounded-xl overflow-hidden bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] backdrop-blur-md">
          <div className="p-6 border-b border-[var(--theme-glass-border)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--theme-text)] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Κλιμακωμένες συνομιλίες
              </h2>
              <Link href="/admin/chats" className="text-sm text-[var(--theme-accent)] hover:underline">
                Δείτε όλες →
              </Link>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
              </div>
            ) : escalatedChats.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-[var(--theme-text-muted)]">Δεν υπάρχουν κλιμακωμένες συνομιλίες.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--theme-glass-border)]">
                      {["Χρήστης", "Email", "Ημερομηνία", "Κατάσταση", "Ενέργειες"].map((col) => (
                        <th key={col} className="text-left py-3 px-4 font-semibold text-[var(--theme-text-muted)] text-sm whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {escalatedChats.slice(0, 5).map((chat) => (
                      <tr
                        key={chat.sessionId}
                        className="border-b border-[var(--theme-glass-border)] hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-[var(--theme-text)] whitespace-nowrap">{chat.userName}</td>
                        <td className="py-4 px-4 text-[var(--theme-text-muted)] max-w-[160px] truncate">{chat.userEmail}</td>
                        <td className="py-4 px-4 text-[var(--theme-text-muted)] whitespace-nowrap">{formatTime(chat.escalatedAt)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              chat.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                                : chat.status === "in_progress"
                                  ? "bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]"
                                  : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {STATUS_LABELS[chat.status]}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/chats?session=${chat.sessionId}`}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/30 transition-colors whitespace-nowrap"
                            >
                              Προβολή
                            </Link>
                            {chat.status !== "resolved" && (
                              <button
                                onClick={() => handleResolveEscalation(chat.sessionId)}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors whitespace-nowrap"
                              >
                                Επίλυση
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
