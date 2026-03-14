'use client';

import type { AdminChatWorkspaceState } from './adapter-helpers';

interface AdminChatRceDetailsProps {
    workspace: AdminChatWorkspaceState;
    mobile?: boolean;
}

const btn =
    'inline-flex items-center gap-2 min-h-[42px] px-3.5 rounded-full border border-slate-300/25 bg-white text-slate-900 text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:border-blue-600/30 hover:text-blue-700 disabled:opacity-55 disabled:cursor-not-allowed';

export function AdminChatRceDetails({
    workspace,
    mobile = false,
}: AdminChatRceDetailsProps) {
    if (!workspace.currentConversation) {
        return null;
    }

    const { currentConversation } = workspace;

    return (
        <div className={mobile ? 'hidden max-xl:block' : undefined}>
            {/* ── Section heading ───────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">
                    Conversation Details
                </span>
                <h3 className="m-0 text-lg font-bold tracking-tight text-slate-900">
                    Session metadata
                </h3>
                <span className="text-[13px] text-slate-500">
                    Operational context and quick utilities for the selected thread.
                </span>
            </div>

            {/* ── Detail rows ───────────────────────────────────────── */}
            <div className="grid gap-2.5 mt-4">
                {workspace.conversationDetails.map((detail) => (
                    <div
                        key={detail.label}
                        className="grid gap-1.5 p-3.5 rounded-[18px] bg-slate-50 border border-slate-200"
                    >
                        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400">
                            {detail.label}
                        </span>
                        <span className="text-sm leading-snug text-slate-900 break-words">
                            {detail.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Action buttons ────────────────────────────────────── */}
            <div className="flex flex-col gap-2.5 mt-4">
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
                    Copy session ID
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
                        Copy email
                    </button>
                ) : null}

                <button
                    type="button"
                    className={btn}
                    onClick={workspace.exportToCSV}
                >
                    Export CSV
                </button>
            </div>
        </div>
    );
}
