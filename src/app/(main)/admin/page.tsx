/**
 * Admin Dashboard Page
 * Protected by Firebase Auth (admin only)
 * Glass theme styling with real Firebase data
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getAdminStats, getEscalatedChats, AdminStats, EscalatedChat, resolveEscalatedChat } from "@/lib/firebase";

export default function AdminPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [escalatedChats, setEscalatedChats] = useState<EscalatedChat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            const timer = setTimeout(() => {
                if (!user) {
                    router.push('/login');
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
                getAdminStats(),
                getEscalatedChats(),
            ]);
            setStats(statsData);
            setEscalatedChats(escalationsData);
        } catch (error) {
            console.error("Error fetching admin data:", error);
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
        router.push('/');
    };

    // Handle resolve escalation
    const handleResolve = async (sessionId: string) => {
        if (!user?.email) return;
        const success = await resolveEscalatedChat(sessionId, user.email);
        if (success) {
            await fetchData();
        }
    };

    // Format date
    const formatTime = (timestamp: { toDate?: () => Date } | Date) => {
        const date = timestamp instanceof Date ? timestamp : timestamp.toDate?.() || new Date();
        return date.toLocaleString("el-GR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Stats cards configuration
    const statsCards = stats ? [
        { label: "Συνολικές Συνομιλίες", value: stats.totalChats.toString(), icon: <MessageCircle className="w-6 h-6" />, color: "from-blue-500 to-cyan-500" },
        { label: "Escalated Chats", value: stats.escalatedChats.toString(), icon: <AlertTriangle className="w-6 h-6" />, color: "from-orange-500 to-red-500" },
        { label: "Pending Escalations", value: stats.pendingEscalations.toString(), icon: <Clock className="w-6 h-6" />, color: "from-yellow-500 to-orange-500" },
        { label: "Μοναδικοί Χρήστες", value: stats.uniqueUsers.toString(), icon: <Users className="w-6 h-6" />, color: "from-purple-500 to-pink-500" },
    ] : [];

    // Show access denied for non-admins (also covers loading state)
    if (authLoading || !user || !isAdmin) {
        return (
            <div className="min-h-screen bg-[#06101f] flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-xl p-8 text-center"
                    style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                >
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: authLoading ? "rgba(59, 130, 246, 0.2)" : "rgba(239, 68, 68, 0.2)" }}
                    >
                        {authLoading ? (
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        ) : (
                            <Shield className="w-8 h-8 text-red-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {authLoading ? "Φόρτωση..." : "Πρόσβαση Απαγορεύεται"}
                    </h2>
                    {!authLoading && (
                        <div className="space-y-4 mt-4">
                            <p className="text-gray-400">
                                {!user
                                    ? "Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα."
                                    : "Δεν έχετε δικαιώματα διαχειριστή."}
                            </p>
                            {!user ? (
                                <Button onClick={() => router.push('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
                                    Σύνδεση
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">
                                        Συνδεδεμένος ως: {user.email}
                                    </p>
                                    <Button variant="outline" onClick={handleSignOut} className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                                        Αποσύνδεση
                                    </Button>
                                </div>
                            )}
                            <Link href="/" className="text-blue-400 text-sm hover:underline block">
                                Επιστροφή στην αρχική
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06101f] flex">
            {/* Glass Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
                style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(20px)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                }}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">A</span>
                        </div>
                        <div>
                            <span className="text-white font-bold text-lg">AEROFREN</span>
                            <span className="text-gray-400 text-xs block">Admin Panel</span>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-6 p-3 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                        <div className="flex items-center gap-2">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                                <UserCircle className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm text-white truncate">{user.displayName || 'Admin'}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { label: "Dashboard", icon: <TrendingUp className="w-5 h-5" />, active: true, href: "/admin" },
                            { label: "Chat Logs", icon: <Bot className="w-5 h-5" />, href: "/admin/chats" },
                            { label: "Αιτήματα", icon: <MessageCircle className="w-5 h-5" />, href: "#" },
                            { label: "Χρήστες", icon: <Users className="w-5 h-5" />, href: "#" },
                            { label: "Ρυθμίσεις", icon: <Settings className="w-5 h-5" />, href: "#" },
                        ].map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${item.active
                                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
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
                    style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(10px)" }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                </button>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Ανανέωση
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isLoading ? (
                        // Skeleton loaders
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl p-6 animate-pulse"
                                style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-700/50 mb-4" />
                                <div className="h-8 w-16 rounded bg-gray-700/50 mb-2" />
                                <div className="h-4 w-24 rounded bg-gray-700/50" />
                            </div>
                        ))
                    ) : (
                        statsCards.map((stat, i) => (
                            <div key={i} className="rounded-xl p-6"
                                style={{
                                    background: "rgba(15, 23, 42, 0.6)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Escalated Chats */}
                <div className="rounded-xl overflow-hidden"
                    style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                >
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                                Escalated Chats
                            </h2>
                            <Link href="/admin/chats" className="text-sm text-blue-400 hover:underline">
                                View All Chats →
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                            </div>
                        ) : escalatedChats.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="text-gray-400">Δεν υπάρχουν escalated συνομιλίες</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-400 text-sm">Χρήστης</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-400 text-sm">Email</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-400 text-sm">Ημερομηνία</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-400 text-sm">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-400 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {escalatedChats.slice(0, 5).map((chat) => (
                                            <tr key={chat.sessionId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-medium text-white">{chat.userName}</td>
                                                <td className="py-4 px-4 text-gray-400">{chat.userEmail}</td>
                                                <td className="py-4 px-4 text-gray-400">{formatTime(chat.escalatedAt)}</td>
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${chat.status === "pending"
                                                            ? "bg-yellow-500/20 text-yellow-400 animate-pulse"
                                                            : chat.status === "in_progress"
                                                                ? "bg-blue-500/20 text-blue-400"
                                                                : "bg-green-500/20 text-green-400"
                                                            }`}
                                                    >
                                                        {chat.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/admin/chats?session=${chat.sessionId}`}
                                                            className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        {chat.status !== "resolved" && (
                                                            <button
                                                                onClick={() => handleResolve(chat.sessionId)}
                                                                className="px-3 py-1 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                            >
                                                                Resolve
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
