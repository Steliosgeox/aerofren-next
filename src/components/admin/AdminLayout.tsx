'use client';

import React, { useState } from 'react';
import { Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminAccessDenied } from './AdminAccessDenied';

interface AdminLayoutProps {
    title: string;
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}

export function AdminLayout({ title, children, headerRight }: AdminLayoutProps) {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auth loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
            </div>
        );
    }

    // Access denied
    if (!user || !isAdmin) {
        return <AdminAccessDenied />;
    }

    return (
        /*
         * Layout: global Header is position:fixed at height 100px.
         * pt-[100px] offsets content below it.
         * top-[116px] on the hamburger = 100px header + 16px breathing room.
         * Sidebar is sticky on lg (top-[100px]), fixed on mobile.
         */
        <div className="min-h-screen flex bg-[var(--theme-bg-solid)] pt-[100px]">
            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky lg:top-[100px] lg:self-start
                    top-[100px] left-0 z-40
                    w-64 h-[calc(100vh-100px)] overflow-y-auto
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{
                    background: 'var(--theme-glass-bg)',
                    borderRight: '1px solid var(--theme-glass-border)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <AdminSidebar />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main content */}
            <main className="flex-1 min-w-0 p-6 lg:p-8">
                {/* Mobile hamburger */}
                <button
                    className="lg:hidden fixed top-[116px] left-4 z-50 p-2 rounded-xl shadow-lg"
                    style={{
                        background: 'var(--theme-glass-bg)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--theme-glass-border)',
                    }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarOpen
                        ? <X className="w-5 h-5 text-[var(--theme-text)]" />
                        : <Menu className="w-5 h-5 text-[var(--theme-text)]" />
                    }
                </button>

                {/* Page header */}
                <div className="flex items-center justify-between mb-8">
                    <h1
                        className="text-3xl font-extrabold"
                        style={{ color: 'var(--theme-text)' }}
                    >
                        {title}
                    </h1>
                    {headerRight}
                </div>

                {children}
            </main>
        </div>
    );
}
