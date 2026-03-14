'use client';

import styles from './admin-chat-rce.module.css';
import type { AdminChatWorkspaceState } from './adapter-helpers';

interface AdminChatRceDetailsProps {
    workspace: AdminChatWorkspaceState;
    mobile?: boolean;
}

export function AdminChatRceDetails({
    workspace,
    mobile = false,
}: AdminChatRceDetailsProps) {
    if (!workspace.currentConversation) {
        return null;
    }

    const { currentConversation } = workspace;

    return (
        <div className={mobile ? styles.mobileOnly : undefined}>
            <div className={styles.detailHeading}>
                <span className={styles.eyebrow}>Conversation Details</span>
                <h3>Session metadata</h3>
                <span className={styles.detailText}>
                    Operational context and quick utilities for the selected thread.
                </span>
            </div>

            <div className={styles.detailList}>
                {workspace.conversationDetails.map((detail) => (
                    <div key={detail.label} className={styles.detailItem}>
                        <span className={styles.detailLabel}>{detail.label}</span>
                        <span className={styles.detailValue}>{detail.value}</span>
                    </div>
                ))}
            </div>

            <div className={styles.detailActions}>
                <button
                    type="button"
                    className={styles.headerButton}
                    onClick={() =>
                        void workspace.handleCopy(
                            currentConversation.sessionId,
                            'The session ID was copied.',
                        )
                    }
                >
                    Copy session ID
                </button>

                {currentConversation.userEmail ? (
                    <button
                        type="button"
                        className={styles.headerButton}
                        onClick={() =>
                            void workspace.handleCopy(
                                currentConversation.userEmail!,
                                'The customer email was copied.',
                            )
                        }
                    >
                        Copy email
                    </button>
                ) : null}

                <button
                    type="button"
                    className={styles.headerButton}
                    onClick={workspace.exportToCSV}
                >
                    Export CSV
                </button>
            </div>
        </div>
    );
}
