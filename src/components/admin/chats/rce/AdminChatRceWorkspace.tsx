'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminChatWorkspace } from '../useAdminChatWorkspace';
import { useAdminChatRceAdapter } from './useAdminChatRceAdapter';
import { AdminChatRceSidebar } from './AdminChatRceSidebar';
import { AdminChatRceThread } from './AdminChatRceThread';
import { AdminChatRceDetails } from './AdminChatRceDetails';
import './admin-chat-rce.css';

const btn =
    'inline-flex items-center gap-2 min-h-[42px] px-3.5 rounded-full border border-slate-300/25 bg-white text-slate-900 text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:border-blue-600/30 hover:text-blue-700 disabled:opacity-55 disabled:cursor-not-allowed';

export function AdminChatRceWorkspace() {
    const router = useRouter();
    const { signOut } = useAuth();
    const composerRef = useRef<HTMLTextAreaElement>(null);
    const threadScrollerRef = useRef<HTMLDivElement>(null);
    const workspace = useAdminChatWorkspace({ composerRef, threadScrollerRef });
    const { chatListItems, messageListItems } = useAdminChatRceAdapter(workspace);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div
            className="min-h-screen text-slate-900 admin-chat-rce"
            style={{
                background:
                    'radial-gradient(circle at top left,rgba(37,99,235,0.07),transparent 24%),' +
                    'radial-gradient(circle at bottom right,rgba(14,165,233,0.07),transparent 20%),' +
                    '#f0f4f8',
            }}
        >
            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 flex flex-wrap items-center gap-4 justify-between px-6 py-[18px] bg-white/90 border-b border-slate-300/20 backdrop-blur-2xl">
                <div className="flex items-center gap-3.5 min-w-0">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white border border-slate-300/25 text-slate-900 text-[13px] font-semibold no-underline transition-colors duration-150 hover:border-blue-600/30 hover:text-blue-700 shrink-0"
                    >
                        <ArrowLeft size={16} />
                        Back to admin
                    </Link>

                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">
                            Support Workspace
                        </span>
                        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                            Admin conversations
                        </h1>
                        <span className="text-[13px] text-slate-500 hidden sm:block">
                            Live Firestore feed — realtime inbox and thread sync.
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end min-w-[280px] max-sm:min-w-0 max-sm:w-full max-sm:flex-wrap">
                    <label
                        className="flex items-center gap-2.5 w-[min(420px,100%)] px-3.5 min-h-[46px] rounded-full bg-white border border-slate-300/25 max-sm:w-full"
                        aria-label="Search conversations"
                    >
                        <Search size={16} className="text-slate-500 shrink-0" />
                        <input
                            type="search"
                            className="flex-1 min-w-0 border-0 outline-none bg-transparent text-slate-900 text-sm placeholder:text-slate-400"
                            placeholder="Search by customer, email, or session ID"
                            value={workspace.searchQuery}
                            onChange={(e) => workspace.setSearchQuery(e.target.value)}
                        />
                    </label>

                    <span className="inline-flex items-center justify-center min-h-10 px-3.5 rounded-full bg-white border border-slate-300/25 text-slate-700 text-xs font-semibold whitespace-nowrap max-md:hidden">
                        {workspace.queueInsights.waitingOnAdmin} waiting on admin
                    </span>

                    <button
                        type="button"
                        className={btn}
                        onClick={() => void workspace.refreshSessions()}
                        disabled={workspace.isLoadingSessions}
                    >
                        <RefreshCw size={16} />
                        {workspace.isLoadingSessions ? 'Refreshing…' : 'Refresh'}
                    </button>

                    <button
                        type="button"
                        className={btn}
                        onClick={() => void handleSignOut()}
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </header>

            {/* ── Alerts ──────────────────────────────────────────────── */}
            {workspace.errorMessage ? (
                <div className="mx-6 mt-3 px-4 py-3 rounded-[18px] border border-red-200/70 bg-red-50/85 text-red-800 text-sm max-lg:mx-3">
                    {workspace.errorMessage}
                </div>
            ) : null}

            {workspace.successMessage ? (
                <div className="mx-6 mt-3 px-4 py-3 rounded-[18px] border border-green-500/20 bg-green-50/85 text-green-800 text-sm max-lg:mx-3">
                    {workspace.successMessage}
                </div>
            ) : null}

            {/* ── Three-column layout ──────────────────────────────────── */}
            <div
                className={[
                    'grid gap-[18px] px-6 pt-[18px] pb-6',
                    'min-h-[calc(100vh-96px)]',
                    'grid-cols-[minmax(320px,360px)_minmax(0,1fr)_minmax(260px,300px)]',
                    'max-xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]',
                    'max-lg:grid-cols-1 max-lg:px-3 max-lg:pt-3',
                ].join(' ')}
            >
                {/* Sidebar */}
                <aside
                    className={[
                        'min-h-0 flex flex-col overflow-hidden',
                        'bg-white/[.96] border border-slate-200/20 rounded-[24px]',
                        'shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                        workspace.selectedSessionId ? 'max-lg:hidden' : '',
                    ].filter(Boolean).join(' ')}
                >
                    <AdminChatRceSidebar
                        workspace={workspace}
                        chatListItems={chatListItems}
                    />
                </aside>

                {/* Thread */}
                <section
                    className={[
                        'min-h-0 flex flex-col overflow-hidden',
                        'bg-white/[.96] border border-slate-200/20 rounded-[24px]',
                        'shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                        !workspace.selectedSessionId ? 'max-lg:hidden' : '',
                    ].filter(Boolean).join(' ')}
                >
                    <AdminChatRceThread
                        workspace={workspace}
                        messageListItems={messageListItems}
                        composerRef={composerRef}
                        threadScrollerRef={threadScrollerRef}
                    />
                </section>

                {/* Details — hidden below xl */}
                <aside
                    className={[
                        'min-h-0 flex flex-col p-5 gap-[18px]',
                        'bg-white/[.96] border border-slate-200/20 rounded-[24px]',
                        'shadow-[0_18px_50px_rgba(15,23,42,0.08)]',
                        'max-xl:hidden',
                    ].join(' ')}
                >
                    {workspace.currentConversation ? (
                        <AdminChatRceDetails workspace={workspace} />
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500 text-sm">
                            Select a conversation to inspect session metadata and export tools.
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
