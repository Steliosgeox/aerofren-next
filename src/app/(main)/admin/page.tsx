/**
 * Admin Dashboard Page
 * Protected by Firebase Auth (admin only)
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MessageCircle,
    Users,
    Package,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    X,
    Bot,
    Shield,
    Loader2,
    UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

    // Handle sign out
    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    // Mock data
    const stats = [
        { label: "Αιτήματα Προσφορών", value: "47", icon: <MessageCircle />, change: "+12%" },
        { label: "Νέοι Πελάτες", value: "23", icon: <Users />, change: "+8%" },
        { label: "Προϊόντα σε Στοκ", value: "1,234", icon: <Package />, change: "+2%" },
        { label: "Μηνιαία Έσοδα", value: "€45K", icon: <TrendingUp />, change: "+15%" },
    ];

    const recentQuotes = [
        { id: 1, name: "Γιώργος Π.", company: "HydraTech", date: "10/01/2026", status: "Pending" },
        { id: 2, name: "Μαρία Κ.", company: "AquaPlus", date: "09/01/2026", status: "Contacted" },
        { id: 3, name: "Νίκος Α.", company: "PneuSystems", date: "08/01/2026", status: "Completed" },
        { id: 4, name: "Ελένη Β.", company: "CleanWater", date: "07/01/2026", status: "Pending" },
    ];

    // Show access denied for non-admins (also covers loading state)
    if (authLoading || !user || !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {authLoading ? (
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            ) : (
                                <Shield className="w-8 h-8 text-red-600" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {authLoading ? "Φόρτωση..." : "Πρόσβαση Απαγορεύεται"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        {!authLoading && (
                            <>
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
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-[#0066cc] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">A</span>
                        </div>
                        <div>
                            <span className="text-white font-bold text-lg">AEROFREN</span>
                            <span className="text-slate-400 text-xs block">Admin Panel</span>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-6 p-3 bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                                <UserCircle className="w-8 h-8 text-slate-400" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm text-white truncate">{user.displayName || 'Admin'}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { label: "Dashboard", icon: <TrendingUp className="w-5 h-5" />, active: true, href: "/admin" },
                            { label: "Chat Logs", icon: <Bot className="w-5 h-5" />, href: "/admin/chats" },
                            { label: "Αιτήματα", icon: <MessageCircle className="w-5 h-5" />, href: "#" },
                            { label: "Πελάτες", icon: <Users className="w-5 h-5" />, href: "#" },
                            { label: "Προϊόντα", icon: <Package className="w-5 h-5" />, href: "#" },
                            { label: "Ρυθμίσεις", icon: <Settings className="w-5 h-5" />, href: "#" },
                        ].map((item, i) => (
                            <Link
                                key={i}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${item.active
                                    ? "bg-[#0066cc] text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
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
                    className="lg:hidden fixed top-28 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#0066cc]/10 rounded-xl flex items-center justify-center text-[#0066cc]">
                                        {stat.icon}
                                    </div>
                                    <span className="text-green-600 text-sm font-bold">{stat.change}</span>
                                </div>
                                <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                                <p className="text-slate-500 text-sm">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Quotes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Πρόσφατα Αιτήματα</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Όνομα</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Εταιρεία</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Ημερομηνία</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentQuotes.map((quote) => (
                                        <tr key={quote.id} className="border-b hover:bg-slate-50">
                                            <td className="py-4 px-4 font-medium">{quote.name}</td>
                                            <td className="py-4 px-4 text-slate-600">{quote.company}</td>
                                            <td className="py-4 px-4 text-slate-600">{quote.date}</td>
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${quote.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : quote.status === "Contacted"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {quote.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
