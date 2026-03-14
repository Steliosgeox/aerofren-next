'use client';

import { ChatList } from '@/vendor/react-chat-elements';
import { WORKSPACE_TABS } from '@/lib/admin-chat/workspace';
import styles from './admin-chat-rce.module.css';
import type { AdminChatWorkspaceState } from './adapter-helpers';
import type { IChatItemProps } from '@/vendor/react-chat-elements';

interface AdminChatRceSidebarProps {
    workspace: AdminChatWorkspaceState;
    chatListItems: IChatItemProps[];
}

export function AdminChatRceSidebar({
    workspace,
    chatListItems,
}: AdminChatRceSidebarProps) {
    return (
        <>
            <div className={styles.sidebarHeader}>
                <div className={styles.sidebarTitleRow}>
                    <div className={styles.sidebarTitle}>
                        <span className={styles.eyebrow}>Inbox</span>
                        <h2>Admin conversations</h2>
                        <span className={styles.subtitle}>{workspace.inboxSummary}</span>
                    </div>

                    <div className={styles.sidebarMetaBox}>
                        <span className={styles.sidebarMetaValue}>{workspace.sessions.length}</span>
                        <span className={styles.sidebarMetaLabel}>Threads</span>
                    </div>
                </div>

                <div className={styles.tabRow} role="radiogroup" aria-label="Chat queue tabs">
                    {WORKSPACE_TABS.map((tab, index) => {
                        const isActive = workspace.statusTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                title={tab.description}
                                onClick={() => workspace.handleTabChange(tab.id)}
                                onKeyDown={(event) => workspace.handleTabKeyDown(event, index)}
                                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
                            >
                                {tab.shortLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.chatListWrap}>
                {chatListItems.length > 0 ? (
                    <ChatList
                        id="admin-chat-rce-list"
                        lazyLoadingImage=""
                        dataSource={chatListItems}
                        onClick={(item) => workspace.selectSession(String(item.id))}
                    />
                ) : (
                    <div className={styles.emptyState}>
                        No conversations match the active filters. Adjust the search or queue tab.
                    </div>
                )}
            </div>

            {workspace.hasMoreSessions ? (
                <div className={styles.listFooter}>
                    <button
                        type="button"
                        className={styles.headerButton}
                        onClick={() =>
                            void workspace.fetchSessions({
                                append: true,
                                cursor: workspace.sessionsCursor,
                            })
                        }
                        disabled={workspace.isLoadingMoreSessions}
                    >
                        {workspace.isLoadingMoreSessions ? 'Loading…' : 'Load more threads'}
                    </button>
                </div>
            ) : null}
        </>
    );
}
