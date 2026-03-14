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
import styles from './admin-chat-rce.module.css';

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
        <div className={`${styles.root} admin-chat-rce`}>
            <header className={styles.header}>
                <div className={styles.headerPrimary}>
                    <Link href="/admin" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to admin
                    </Link>

                    <div className={styles.headerTitle}>
                        <span className={styles.eyebrow}>Support Workspace</span>
                        <h1>Admin conversations</h1>
                        <span className={styles.subtitle}>
                            Live Firestore feed — realtime inbox and thread sync.
                        </span>
                    </div>
                </div>

                <div className={styles.headerSecondary}>
                    <label className={styles.searchWrap} aria-label="Search conversations">
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="search"
                            className={styles.searchInput}
                            placeholder="Search by customer, email, or session ID"
                            value={workspace.searchQuery}
                            onChange={(event) => workspace.setSearchQuery(event.target.value)}
                        />
                    </label>

                    <span className={styles.statsPill}>
                        {workspace.queueInsights.waitingOnAdmin} waiting on admin
                    </span>

                    <button
                        type="button"
                        className={styles.headerButton}
                        onClick={() => void workspace.refreshSessions()}
                        disabled={workspace.isLoadingSessions}
                    >
                        <RefreshCw size={16} />
                        {workspace.isLoadingSessions ? 'Refreshing…' : 'Refresh'}
                    </button>

                    <button
                        type="button"
                        className={styles.headerButton}
                        onClick={() => void handleSignOut()}
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </header>

            {workspace.errorMessage ? (
                <div className={`${styles.alert} ${styles.alertError}`}>
                    {workspace.errorMessage}
                </div>
            ) : null}

            {workspace.successMessage ? (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                    {workspace.successMessage}
                </div>
            ) : null}

            <div className={styles.layout}>
                <aside
                    className={`${styles.sidebarPane} ${workspace.selectedSessionId ? styles.sidebarHiddenMobile : ''}`}
                >
                    <AdminChatRceSidebar
                        workspace={workspace}
                        chatListItems={chatListItems}
                    />
                </aside>

                <section
                    className={`${styles.threadPane} ${!workspace.selectedSessionId ? styles.threadHiddenMobile : ''}`}
                >
                    <AdminChatRceThread
                        workspace={workspace}
                        messageListItems={messageListItems}
                        composerRef={composerRef}
                        threadScrollerRef={threadScrollerRef}
                    />
                </section>

                <aside className={styles.detailsPane}>
                    {workspace.currentConversation ? (
                        <AdminChatRceDetails workspace={workspace} />
                    ) : (
                        <div className={styles.emptyState}>
                            Select a conversation to inspect session metadata and export tools.
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
