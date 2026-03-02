'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
    TrendingUp,
    Bot,
    Inbox,
    Users,
    Settings,
    LogOut,
    Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
}

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { unreadCount } = useNotifications();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const navItems = useMemo<NavItem[]>(() => [
        { label: 'Σύνοψη', icon: <TrendingUp className="w-5 h-5" />, href: '/admin' },
        { label: 'Συνομιλίες AI', icon: <Bot className="w-5 h-5" />, href: '/admin/chats' },
        { label: 'Αιτήματα', icon: <Inbox className="w-5 h-5" />, href: '/admin/requests', badge: unreadCount > 0 ? unreadCount : undefined },
        { label: 'Χρήστες', icon: <Users className="w-5 h-5" />, href: '/admin/users' },
        { label: 'Ρυθμίσεις', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
    ], [unreadCount]);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname?.startsWith(href) ?? false;
    };

    return (
        <div className="p-5 flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                    <span className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>
                        AEROFREN
                    </span>
                    <span className="text-xs block" style={{ color: 'var(--theme-text-muted)' }}>
                        Διαχείριση
                    </span>
                </div>
            </div>

            {/* User card */}
            <div
                className="mb-6 p-3 rounded-xl flex items-center gap-3 bg-white/5"
            >
                <div className="relative shrink-0">
                    {user?.photoURL ? (
                        <Image
                            src={user.photoURL}
                            alt=""
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] flex items-center justify-center text-white font-bold text-sm">
                            {user?.displayName?.[0] || user?.email?.[0] || 'A'}
                        </div>
                    )}
                    <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--theme-accent)] flex items-center justify-center"
                        role="img"
                        aria-label="Διαχειριστής"
                    >
                        <Shield className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>
                <div className="min-w-0">
                    <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--theme-text)' }}
                    >
                        {user?.displayName || 'Διαχειριστής'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--theme-text-muted)' }}>
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                <p
                    className="text-[10px] font-bold tracking-widest px-4 mb-2"
                    style={{ color: 'var(--theme-text-muted)' }}
                >
                    ΠΛΟΗΓΗΣΗ
                </p>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                active
                                    ? 'text-white'
                                    : 'text-[var(--theme-text-muted)] hover:bg-white/5 hover:text-[var(--theme-text)]'
                            }`}
                            style={active ? {
                                background: 'linear-gradient(135deg, var(--theme-accent), var(--theme-accent-hover))',
                                boxShadow: '0 4px 16px rgba(0, 186, 226, 0.3)',
                            } : undefined}
                        >
                            {item.icon}
                            <span className="flex-1">{item.label}</span>
                            {item.badge !== undefined && (
                                <span className="min-w-[20px] h-5 rounded-full bg-[var(--theme-accent)] text-white text-[10px] font-bold flex items-center justify-center px-1">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Sign out */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--theme-glass-border)' }}>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors text-[var(--theme-text-muted)] hover:bg-white/5 hover:text-[var(--theme-text)]"
                >
                    <LogOut className="w-5 h-5" />
                    Αποσύνδεση
                </button>
            </div>
        </div>
    );
}
