'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, AlertTriangle, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, type AppNotification } from '@/contexts/NotificationContext';

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return 'μόλις τώρα';
    if (diffMin < 60) return `${diffMin}λ πριν`;
    if (diffH < 24) return `${diffH}ω πριν`;
    return `${diffD}μ πριν`;
}

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
    if (type === 'escalation') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    if (type === 'contact') return <Mail className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />;
    return <MessageCircle className="w-4 h-4 text-green-400 shrink-0" />;
}

export function NotificationBell() {
    const { notifications, unreadCount, canMarkAllRead, markAllRead, markRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                panelRef.current && !panelRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const recent = notifications.slice(0, 10);

    return (
        <div className="relative">
            <button
                type="button"
                ref={buttonRef}
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-xl transition-colors hover:bg-white/10"
                aria-label={`Ειδοποιήσεις${unreadCount > 0 ? ` (${unreadCount} αδιάβαστες)` : ''}`}
            >
                <Bell
                    className="w-5 h-5"
                    style={{ color: 'var(--theme-text-muted)' }}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--theme-accent)] text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
                    style={{
                        background: 'var(--theme-mega-bg)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--theme-glass-border)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid var(--theme-glass-border)' }}
                    >
                        <span className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>
                            Ειδοποιήσεις
                            {unreadCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-1">
                            {canMarkAllRead && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors hover:bg-white/10"
                                    style={{ color: 'var(--theme-text-muted)' }}
                                    title="Σήμανση όλων ως διαβασμένα"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                                style={{ color: 'var(--theme-text-muted)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-80 overflow-y-auto">
                        {recent.length === 0 ? (
                            <div
                                className="py-8 text-center text-sm"
                                style={{ color: 'var(--theme-text-muted)' }}
                            >
                                Δεν υπάρχουν ειδοποιήσεις.
                            </div>
                        ) : (
                            recent.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={notif.href}
                                    onClick={() => {
                                        markRead(notif.id);
                                        setOpen(false);
                                    }}
                                    className="flex items-start gap-3 px-4 py-3 transition-colors"
                                    style={{
                                        borderBottom: '1px solid var(--theme-glass-border)',
                                        backgroundColor: notif.isRead
                                            ? 'transparent'
                                            : 'color-mix(in srgb, var(--theme-accent) 5%, transparent)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'color-mix(in srgb, var(--theme-accent) 5%, transparent)'}
                                >
                                    <NotificationIcon type={notif.type} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--theme-text)' }}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--theme-text-muted)' }}>
                                            {notif.body}
                                        </p>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                                            {formatRelativeTime(notif.timestamp)}
                                        </p>
                                    </div>
                                    {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] shrink-0 mt-1.5" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
