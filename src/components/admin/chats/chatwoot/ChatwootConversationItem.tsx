'use client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminChatSessionRow {
    sessionId: string;
    name: string;
    initials: string;
    email: string;
    preview: string;
    timestampLabel: string;
    unreadCount: number;
    messageCountLabel: string;
    waitingLabel: string | null;
    statusLabel: string;
    statusTone: 'pending' | 'in_progress' | 'resolved';
    stateDotTone: 'amber' | 'indigo' | 'emerald';
    waitingTone: 'amber' | 'emerald' | 'slate';
    isSelected: boolean;
    avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function encodeSvg(svg: string) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildFallbackAvatar(initials: string, background: string, foreground = '#ffffff') {
    const safeInitials = initials.slice(0, 2).toUpperCase();
    return encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="16" fill="${background}" />
            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
                font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${foreground}">${safeInitials}</text>
        </svg>
    `);
}

interface ChatwootConversationItemProps {
    row: AdminChatSessionRow;
    onClick: () => void;
}

export default function ChatwootConversationItem({ row, onClick }: ChatwootConversationItemProps) {
    const dotColor =
        row.stateDotTone === 'amber'
            ? 'bg-amber-400'
            : row.stateDotTone === 'indigo'
              ? 'bg-indigo-400'
              : 'bg-emerald-400';

    const tagColor =
        row.statusTone === 'resolved'
            ? 'bg-emerald-500/20 text-emerald-400'
            : row.statusTone === 'in_progress'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-amber-500/20 text-amber-400';

    return (
        <button
            type="button"
            onClick={onClick}
            // Root is `relative` so timestamp can be absolutely positioned — exact Chatwoot ConversationCard pattern
            className={[
                'w-full relative flex items-start gap-0 border-b border-[var(--cw-border)] transition-colors cursor-pointer text-left',
                row.isSelected
                    ? 'bg-[var(--cw-accent-dim)] border-l-2 border-l-[var(--cw-accent)] px-3 pl-[10px]'
                    : 'px-3 hover:bg-white/[0.04]',
            ].join(' ')}
        >
            {/* Avatar — mt-6 to clear the InboxName row above the contact name (Chatwoot: mt-8 when showInboxName) */}
            <div className="flex-shrink-0 relative mt-6 mr-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                    {row.avatarUrl ? (
                        <img
                            src={row.avatarUrl}
                            alt={row.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={buildFallbackAvatar(row.initials, '#2a3a4f')}
                            alt={row.name}
                            className="w-full h-full"
                        />
                    )}
                </div>
                <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--cw-bg-sidebar)] ${dotColor}`}
                />
            </div>

            {/* Content — py-3, fills width, matches Chatwoot .px-0.py-3.flex-1 */}
            <div className="flex-1 min-w-0 py-3">
                {/* Row 1: InboxName equivalent — "Aerofren Chat" (Chatwoot shows inbox source here) */}
                <div className="flex items-center gap-1 mx-2 mb-0.5">
                    <span className="text-[10px] text-[var(--cw-text-3)] truncate flex items-center gap-0.5">
                        <span className="opacity-60">↩</span>
                        <span>Aerofren Chat</span>
                    </span>
                </div>

                {/* Row 2: Contact name — pr-14 reserves space for absolute timestamp (Chatwoot: ltr:pr-16) */}
                <h4 className="text-[13px] font-semibold text-[var(--cw-text-1)] mx-2 pt-0.5 pr-14 overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
                    {row.name}
                </h4>

                {/* Row 3: Message preview — text-sm h-6, matches Chatwoot MessagePreview */}
                <p className="text-[12px] text-[var(--cw-text-2)] mx-2 leading-6 h-6 overflow-hidden text-ellipsis whitespace-nowrap">
                    {row.preview}
                </p>

                {/* Row 4: Status tag (Chatwoot: CardLabels) */}
                <div className="mx-2 mt-0.5">
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-sm font-medium leading-tight ${tagColor}`}>
                        {row.statusLabel}
                    </span>
                </div>
            </div>

            {/* Timestamp + unread badge — ABSOLUTELY POSITIONED top-right (exact Chatwoot pattern: absolute right-3 top-8) */}
            <div className="absolute flex flex-col right-3 top-3 items-end gap-1">
                <span className="text-[10px] text-[var(--cw-text-3)] font-normal leading-4 whitespace-nowrap">
                    {row.timestampLabel}
                </span>
                {row.unreadCount > 0 && (
                    <span className="rounded-full text-[9px] font-semibold min-w-[1rem] h-4 px-1 text-center text-white bg-[var(--cw-accent)] flex items-center justify-center leading-none">
                        {row.unreadCount > 9 ? '9+' : row.unreadCount}
                    </span>
                )}
            </div>
        </button>
    );
}
