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
import {
    getAllChatSessionsWithEscalation,
    getChatHistory,
    ChatSessionInfoExtended,
    ChatMessage,
    resolveEscalatedChat,
} from "@/lib/firebase";

function AdminChatsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, isAdmin, signOut } = useAuth();

    const [sessions, setSessions] = useState<ChatSessionInfoExtended[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Check URL params for pre-selected session
    useEffect(() => {
        const sessionParam = searchParams.get('session');
        if (sessionParam) {
            setSelectedSession(sessionParam);
            fetchMessages(sessionParam);
        }
    }, [searchParams]);

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

    // Fetch sessions from Firebase (with escalation status)
    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllChatSessionsWithEscalation();
            // Sort to show escalated first, then by date
            const sorted = data.sort((a, b) => {
                if (a.isEscalated && !b.isEscalated) return -1;
                if (!a.isEscalated && b.isEscalated) return 1;
                if (a.escalationStatus === 'pending' && b.escalationStatus !== 'pending') return -1;
                if (a.escalationStatus !== 'pending' && b.escalationStatus === 'pending') return 1;
                return b.lastMessage.getTime() - a.lastMessage.getTime();
            });
            setSessions(sorted);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load sessions on mount
    useEffect(() => {
        if (user && isAdmin) {
            fetchSessions();
        }
    }, [user, isAdmin, fetchSessions]);

    // Fetch messages for a session
    const fetchMessages = useCallback(async (sessionId: string) => {
        setIsLoading(true);
        try {
            const data = await getChatHistory(sessionId);
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle session selection
    const handleSelectSession = (sessionId: string) => {
        setSelectedSession(sessionId);
        fetchMessages(sessionId);
    };

    // Handle resolve escalation
    const handleResolve = async (sessionId: string) => {
        if (!user?.email) return;
        const success = await resolveEscalatedChat(sessionId, user.email);
        if (success) {
            await fetchSessions();
        }
    };

    // Filter sessions by search query
    const filteredSessions = sessions.filter((session) =>
        session.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current session info
    const currentSession = sessions.find(s => s.sessionId === selectedSession);

    // Format timestamp
    const formatTime = (date: Date | { toDate?: () => Date }) => {
        const d = date instanceof Date ? date : date.toDate?.() || new Date();
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

        const header = "Timestamp,Role,Content,User\n";
        const rows = messages.map((msg) => {
            const timestamp = msg.timestamp?.toDate?.()?.toISOString() || new Date().toISOString();
            return `"${timestamp}","${msg.role}","${msg.content.replace(/"/g, '""')}","${msg.userEmail || 'Anonymous'}"`;
        }).join("\n");

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
        router.push('/');
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#06101f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    // Show access denied for non-admins
    if (!user || !isAdmin) {
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
                        style={{ background: "rgba(239, 68, 68, 0.2)" }}
                    >
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Πρόσβαση Απαγορεύεται</h2>
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06101f]">
            {/* Header */}
            <div className="sticky top-0 z-10"
                style={{
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Chat Logs
                                </h1>
                                <p className="text-sm text-gray-400">
                                    {sessions.length} συνομιλίες
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                                <UserCircle className="w-4 h-4" />
                                {user.displayName || user.email}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchSessions}
                                className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Ανανέωση
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="gap-2 text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Sessions List */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl overflow-hidden"
                            style={{
                                background: "rgba(15, 23, 42, 0.6)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <div className="p-4 border-b border-white/10">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Αναζήτηση..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                                {isLoading && sessions.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                                    </div>
                                ) : filteredSessions.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Δεν βρέθηκαν συνομιλίες
                                    </div>
                                ) : (
                                    filteredSessions.map((session) => (
                                        <button
                                            key={session.sessionId}
                                            onClick={() => handleSelectSession(session.sessionId)}
                                            className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${selectedSession === session.sessionId
                                                ? "bg-blue-500/20 border-l-4 border-blue-500"
                                                : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {session.isEscalated ? (
                                                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${session.escalationStatus === 'pending'
                                                            ? 'text-yellow-400 animate-pulse'
                                                            : session.escalationStatus === 'resolved'
                                                                ? 'text-green-400'
                                                                : 'text-orange-400'
                                                            }`}
                                                        />
                                                    ) : session.userEmail ? (
                                                        <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                    ) : (
                                                        <UserCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    )}
                                                    <span className="font-medium text-sm text-white truncate">
                                                        {session.userName || session.userEmail || session.sessionId.slice(0, 12) + '...'}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </div>
                                            {session.userEmail && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {session.userEmail}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {session.messageCount}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(session.lastMessage)}
                                                </span>
                                                {session.isEscalated && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${session.escalationStatus === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : session.escalationStatus === 'resolved'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-orange-500/20 text-orange-400'
                                                        }`}
                                                    >
                                                        {session.escalationStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat View */}
                    <div className="lg:col-span-2">
                        <div className="h-[70vh] flex flex-col rounded-xl overflow-hidden"
                            style={{
                                background: "rgba(15, 23, 42, 0.6)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                        >
                            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-white">
                                            {selectedSession
                                                ? `Session: ${selectedSession.slice(0, 16)}...`
                                                : "Επιλέξτε συνομιλία"}
                                        </h2>
                                        {selectedSession && (
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-400">
                                                    {messages.length} μηνύματα
                                                </p>
                                                {currentSession?.isEscalated && (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentSession.escalationStatus === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400 animate-pulse'
                                                        : currentSession.escalationStatus === 'resolved'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-orange-500/20 text-orange-400'
                                                        }`}
                                                    >
                                                        Escalated - {currentSession.escalationStatus}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedSession && currentSession?.isEscalated && currentSession?.escalationStatus !== 'resolved' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleResolve(selectedSession)}
                                            className="gap-2 border-green-600 text-green-400 hover:bg-green-600/20"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Resolve
                                        </Button>
                                    )}
                                    {selectedSession && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={exportToCSV}
                                            className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {!selectedSession ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <Calendar className="w-12 h-12 mb-4" />
                                        <p>Επιλέξτε μια συνομιλία για να δείτε τα μηνύματα</p>
                                    </div>
                                ) : isLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                                                        ? "bg-blue-500 text-white rounded-br-sm"
                                                        : "bg-white/10 text-gray-200 rounded-bl-sm"
                                                        }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {msg.content}
                                                    </p>
                                                    <p
                                                        className={`text-xs mt-1 ${msg.role === "user"
                                                            ? "text-blue-200"
                                                            : "text-gray-500"
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
        <Suspense fallback={
            <div className="min-h-screen bg-[#06101f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        }>
            <AdminChatsPageContent />
        </Suspense>
    );
}
