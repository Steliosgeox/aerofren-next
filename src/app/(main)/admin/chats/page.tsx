/**
 * Admin Chat Logs Page
 * View and manage all customer chat sessions
 * Protected by Firebase Auth (admin only)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getAllChatSessions, getChatHistory, ChatSessionInfo, ChatMessage } from "@/lib/firebase";

export default function AdminChatsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin, signOut } = useAuth();

    const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            // Allow a grace period for admin check
            const timer = setTimeout(() => {
                if (!user) {
                    router.push('/login');
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, authLoading, isAdmin, router]);

    // Fetch sessions from Firebase
    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllChatSessions();
            setSessions(data);
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

    // Filter sessions by search query
    const filteredSessions = sessions.filter((session) =>
        session.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Show access denied for non-admins
    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl">Πρόσβαση Απαγορεύεται</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-slate-600">
                            {!user
                                ? "Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα."
                                : "Δεν έχετε δικαιώματα διαχειριστή."}
                        </p>
                        {!user ? (
                            <Button onClick={() => router.push('/login')} className="w-full">
                                Σύνδεση
                            </Button>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-500">
                                    Συνδεδεμένος ως: {user.email}
                                </p>
                                <Button variant="outline" onClick={handleSignOut} className="w-full">
                                    Αποσύνδεση
                                </Button>
                            </div>
                        )}
                        <Link href="/" className="text-blue-600 text-sm hover:underline block">
                            Επιστροφή στην αρχική
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Chat Logs
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {sessions.length} συνομιλίες
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                                <UserCircle className="w-4 h-4" />
                                {user.displayName || user.email}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchSessions}
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Ανανέωση
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="gap-2"
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
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Αναζήτηση..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y max-h-[60vh] overflow-y-auto">
                                    {isLoading && sessions.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                                        </div>
                                    ) : filteredSessions.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500">
                                            Δεν βρέθηκαν συνομιλίες
                                        </div>
                                    ) : (
                                        filteredSessions.map((session) => (
                                            <button
                                                key={session.sessionId}
                                                onClick={() => handleSelectSession(session.sessionId)}
                                                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${selectedSession === session.sessionId
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {session.userEmail ? (
                                                            <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <UserCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                        )}
                                                        <span className="font-medium text-sm truncate">
                                                            {session.userName || session.userEmail || session.sessionId.slice(0, 12) + '...'}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                </div>
                                                {session.userEmail && (
                                                    <p className="text-xs text-slate-500 mt-1 truncate">
                                                        {session.userEmail}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3" />
                                                        {session.messageCount}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(session.lastMessage)}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat View */}
                    <div className="lg:col-span-2">
                        <Card className="h-[70vh] flex flex-col">
                            <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">
                                            {selectedSession
                                                ? `Session: ${selectedSession.slice(0, 16)}...`
                                                : "Επιλέξτε συνομιλία"}
                                        </CardTitle>
                                        {selectedSession && (
                                            <p className="text-xs text-slate-500">
                                                {messages.length} μηνύματα
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {selectedSession && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={exportToCSV}
                                        className="gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4">
                                {!selectedSession ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Calendar className="w-12 h-12 mb-4" />
                                        <p>Επιλέξτε μια συνομιλία για να δείτε τα μηνύματα</p>
                                    </div>
                                ) : isLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                                                        ? "bg-blue-500 text-white rounded-br-sm"
                                                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                                                        }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {msg.content}
                                                    </p>
                                                    <p
                                                        className={`text-xs mt-1 ${msg.role === "user"
                                                            ? "text-blue-100"
                                                            : "text-slate-400"
                                                            }`}
                                                    >
                                                        {formatTime(msg.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
