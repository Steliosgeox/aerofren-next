'use client';

import type { AdminChatWorkspaceState } from './adapter-helpers';

interface AdminChatRceDetailsProps {
    workspace: AdminChatWorkspaceState;
    mobile?: boolean;
}

const btn =
    'inline-flex items-center gap-1.5 min-h-[30px] px-3 rounded-full border border-white/[0.12] bg-white/[0.06] text-white/75 text-xs font-semibold cursor-pointer transition-colors duration-150 hover:bg-white/[0.10] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed';

export function AdminChatRceDetails({
    workspace,
    mobile = false,
}: AdminChatRceDetailsProps) {
    if (!workspace.currentConversation) {
        return (
            <div className={[
                'flex flex-1 items-center justify-center p-8 text-center text-white/30 text-sm',
                mobile ? 'hidden max-xl:flex' : '',
            ].join(' ')}>
                Επίλεξε συνομιλία.
            </div>
        );
    }

    const { currentConversation } = workspace;

    return (
        <div className={mobile ? 'hidden max-xl:block' : undefined}>
            {/* ── Section heading ───────────────────────────────────── */}
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/40">
                    Στοιχεία
                </span>
                <h3 className="m-0 text-sm font-semibold tracking-tight text-[var(--theme-text)]">
                    Μεταδεδομένα
                </h3>
            </div>

            {/* ── Detail rows ───────────────────────────────────────── */}
            <div className="grid gap-2 mt-3">
                {workspace.conversationDetails.map((detail) => (
                    <div
                        key={detail.label}
                        className="grid gap-1 p-3 rounded-[12px] bg-white/[0.03] border border-white/[0.06]"
                    >
                        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/40">
                            {detail.label}
                        </span>
                        <span className="text-xs leading-snug text-white/80 break-words">
                            {detail.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Action buttons ────────────────────────────────────── */}
            <div className="flex flex-col gap-2 mt-3">
                <button
                    type="button"
                    className={btn}
                    onClick={() =>
                        void workspace.handleCopy(
                            currentConversation.sessionId,
                            'The session ID was copied.',
                        )
                    }
                >
                    Αντιγραφή ID
                </button>

                {currentConversation.userEmail ? (
                    <button
                        type="button"
                        className={btn}
                        onClick={() =>
                            void workspace.handleCopy(
                                currentConversation.userEmail!,
                                'The customer email was copied.',
                            )
                        }
                    >
                        Αντιγραφή email
                    </button>
                ) : null}

                <button
                    type="button"
                    className={btn}
                    onClick={workspace.exportToCSV}
                >
                    Εξαγωγή CSV
                </button>
            </div>
        </div>
    );
}
