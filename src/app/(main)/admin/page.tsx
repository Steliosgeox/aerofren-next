"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { HttpError } from "@/services/http";
import { AdminStats, EscalatedChat, fetchAdminStats, fetchEscalations, resolveEscalation } from "@/services/admin";
import { AdminLayout } from "@/components/admin";
import { formatTime } from "@/utils/format";

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [escalatedChats, setEscalatedChats] = useState<EscalatedChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // AdminLayout guarantees this page only renders when user is authenticated + admin.
  // The guard here is just a runtime safety net for the service calls.
  const fetchData = useCallback(async () => {
    if (!user) return;

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
      const message = error instanceof Error ? error.message : "Αποτυχία φόρτωσης δεδομένων.";
      setErrorMessage(message);
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
        setAuthError(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
  };

  const handleResolveEscalation = async (sessionId: string) => {
    if (!user?.email) return;
    const success = await resolveEscalation(user, sessionId);
    if (success) {
      await fetchData();
    }
  };

  const STATUS_LABELS: Record<"pending" | "in_progress" | "resolved", string> = {
    pending: "Σε αναμονή",
    in_progress: "Σε εξέλιξη",
    resolved: "Ολοκληρώθηκε",
  };

  const statsCards = stats ? [
    {
      label: "Συνολικές συνομιλίες",
      value: stats.totalChats.toString(),
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      label: "Σήμερα",
      value: stats.todayChats.toString(),
      icon: <TrendingUp className="w-6 h-6" />,
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
      value: stats.uniqueUsersInitialized === false ? "—" : stats.uniqueUsers.toString(),
      icon: <Users className="w-6 h-6" />,
    },
  ] : [];

  const refreshButton = (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all text-[var(--theme-text)] border border-[var(--theme-glass-border)] hover:bg-white/5 disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
      Ανανέωση
    </button>
  );

  return (
    <AdminLayout title="Σύνοψη" headerRight={refreshButton}>
      {/* Error banner */}
      {errorMessage && (
        <div
          className="mb-6 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30"
          role="alert"
        >
          <p className="text-sm text-[var(--theme-text)]">{errorMessage}</p>
          {authError && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] shrink-0"
            >
              Σύνδεση ξανά
            </button>
          )}
        </div>
      )}

      {/* Stats Grid — 5 cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
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

      {/* Escalated Chats table */}
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
    </AdminLayout>
  );
}
