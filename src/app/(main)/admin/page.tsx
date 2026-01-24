/**
 * Admin Dashboard Page
 * Protected by Firebase Auth (admin only)
 * Glass theme styling with real Firebase data
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

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Handle resolve escalation
  const handleResolveEscalation = async (sessionId: string) => {
    if (!user?.email) return;
    const success = await resolveEscalation(user, sessionId);
    if (success) {
      await fetchData();
    }
  };

  // Format date
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

  // Status labels
  const STATUS_LABELS: Record<"pending" | "in_progress" | "resolved", string> = {
    pending: "Σε αναμονή",
    in_progress: "Σε εξέλιξη",
    resolved: "Ολοκληρώθηκε",
  };

  // Stats cards configuration
  const statsCards = stats
    ? [
        {
          label: "Συνολικές συνομιλίες",
          value: stats.totalChats.toString(),
          icon: <MessageCircle className="w-6 h-6" />,
          color: "from-[var(--theme-accent)] to-[var(--theme-accent-hover)]",
        },
        {
          label: "Κλιμακωμένες συνομιλίες",
          value: stats.escalatedChats.toString(),
          icon: <AlertTriangle className="w-6 h-6" />,
          color: "from-[var(--theme-accent)] to-[var(--theme-accent-hover)]",
        },
        {
          label: "Εκκρεμείς κλιμακώσεις",
          value: stats.pendingEscalations.toString(),
          icon: <Clock className="w-6 h-6" />,
          color: "from-[var(--theme-accent)] to-[var(--theme-accent-hover)]",
        },
        {
          label: "Μοναδικοί χρήστες",
          value: stats.uniqueUsers.toString(),
          icon: <Users className="w-6 h-6" />,
          color: "from-[var(--theme-accent)] to-[var(--theme-accent-hover)]",
        },
      ]
    : [];

  // Show access denied for non-admins (also covers loading state)
  if (authLoading || !user || !isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--theme-bg-solid)" }}
      >
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
            style={{
              background: authLoading
                ? "color-mix(in srgb, var(--theme-accent) 20%, transparent)"
                : "rgba(239, 68, 68, 0.2)",
            }}
          >
            {authLoading ? (
              <Loader2 className="w-8 h-8 text-[var(--theme-accent)] animate-spin" />
            ) : (
              <Shield className="w-8 h-8 text-red-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-[var(--theme-text)] mb-2">
            {authLoading ? "Φόρτωση..." : "Πρόσβαση μόνο για διαχειριστές"}
          </h2>
          {!authLoading && (
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
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--theme-bg-solid)" }}>
      {/* Glass Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        style={{
          background: "var(--theme-glass-bg)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--theme-glass-border)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <span className="text-[var(--theme-text)] font-bold text-lg">AEROFREN</span>
              <span className="text-[var(--theme-text-muted)] text-xs block">Πίνακας Διαχείρισης</span>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-3 rounded-xl" style={{ background: "var(--theme-glass-bg)" }}>
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <UserCircle className="w-8 h-8 text-[var(--theme-text-muted)]" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-[var(--theme-text)] truncate">{user.displayName || "Διαχειριστής"}</p>
                <p className="text-xs text-[var(--theme-text-muted)] truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { label: "Σύνοψη", icon: <TrendingUp className="w-5 h-5" />, active: true, href: "/admin" },
              { label: "Συνομιλίες AI", icon: <Bot className="w-5 h-5" />, href: "/admin/chats" },
              { label: "Αιτήματα", icon: <MessageCircle className="w-5 h-5" />, href: "#" },
              { label: "Χρήστες", icon: <Users className="w-5 h-5" />, href: "#" },
              { label: "Ρυθμίσεις", icon: <Settings className="w-5 h-5" />, href: "#" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${item.active
                  ? "bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)] text-white"
                  : "text-[var(--theme-text-muted)] hover:bg-[var(--theme-glass-bg)] hover:text-[var(--theme-text)]"
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--theme-text-muted)] hover:bg-[var(--theme-glass-bg)] hover:text-[var(--theme-text)] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 pt-24 lg:pt-8">
        {/* Mobile Header */}
        <button
          className="lg:hidden fixed top-28 left-4 z-40 p-2 rounded-xl shadow-lg"
          style={{ background: "var(--theme-glass-bg)", backdropFilter: "blur(10px)" }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-6 h-6 text-[var(--theme-text)]" /> : <Menu className="w-6 h-6 text-[var(--theme-text)]" />}
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--theme-text)]">Σύνοψη</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 border-[var(--theme-glass-border)] text-[var(--theme-text)] hover:bg-[var(--theme-glass-bg)]"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Ανανέωση
          </Button>
        </div>

        {errorMessage && (
          <div
            className="mb-6 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
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

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            // Skeleton loaders
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-6 animate-pulse"
                style={{
                  background: "var(--theme-glass-bg)",
                  border: "1px solid var(--theme-glass-border)",
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-[color-mix(in_srgb,var(--theme-glass-bg)_70%,transparent)] mb-4" />
                <div className="h-8 w-16 rounded bg-[color-mix(in_srgb,var(--theme-glass-bg)_70%,transparent)] mb-2" />
                <div className="h-4 w-24 rounded bg-[color-mix(in_srgb,var(--theme-glass-bg)_70%,transparent)]" />
              </div>
            ))
          ) : (
            statsCards.map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{
                  background: "var(--theme-glass-bg)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--theme-glass-border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[var(--theme-text)]">{stat.value}</p>
                <p className="text-[var(--theme-text-muted)] text-sm">{stat.label}</p>
              </div>
            ))
          )}
        </div>

        {/* Κλιμακωμένες συνομιλίες */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--theme-glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--theme-glass-border)",
          }}
        >
          <div className="p-6 border-b border-[var(--theme-glass-border)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--theme-text)] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Κλιμακωμένες συνομιλίες
              </h2>
              <Link href="/admin/chats" className="text-sm text-[var(--theme-accent)] hover:underline">
                Δείτε όλες τις συνομιλίες →
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--theme-glass-border)]">
                      <th className="text-left py-3 px-4 font-semibold text-[var(--theme-text-muted)] text-sm">Χρήστης</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--theme-text-muted)] text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--theme-text-muted)] text-sm">Ημερομηνία</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--theme-text-muted)] text-sm">Κατάσταση</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--theme-text-muted)] text-sm">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalatedChats.slice(0, 5).map((chat) => (
                      <tr
                        key={chat.sessionId}
                        className="border-b border-[var(--theme-glass-border)] hover:bg-[var(--theme-glass-bg)] transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-[var(--theme-text)]">{chat.userName}</td>
                        <td className="py-4 px-4 text-[var(--theme-text-muted)]">{chat.userEmail}</td>
                        <td className="py-4 px-4 text-[var(--theme-text-muted)]">{formatTime(chat.escalatedAt)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${chat.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                              : chat.status === "in_progress"
                                ? "bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] text-[var(--theme-accent)]"
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
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] text-[var(--theme-accent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)] transition-colors"
                            >
                              Προβολή
                            </Link>
                            {chat.status !== "resolved" && (
                              <button
                                onClick={() => handleResolveEscalation(chat.sessionId)}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
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
