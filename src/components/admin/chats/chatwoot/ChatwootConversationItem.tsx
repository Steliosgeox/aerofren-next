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

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'w-full h-[68px] flex items-center gap-2.5 border-b border-[var(--cw-border)] transition-colors cursor-pointer text-left',
                row.isSelected
                    ? 'bg-[var(--cw-accent-dim)] border-l-2 border-l-[var(--cw-accent)] px-3 pl-[10px]'
                    : 'px-3 hover:bg-white/[0.04]',
            ].join(' ')}
        >
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
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

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Top row: name + time */}
                <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[var(--cw-text-1)] truncate leading-tight">
                        {row.name}
                    </span>
                    <span className="text-[10px] text-[var(--cw-text-3)] flex-shrink-0 ml-1">
                        {row.timestampLabel}
                    </span>
                </div>

                {/* Bottom row: preview + unread badge */}
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[12px] text-[var(--cw-text-2)] truncate leading-tight flex-1">
                        {row.preview}
                    </span>
                    {row.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[16px] px-1 h-4 rounded-full bg-[var(--cw-accent)] text-white text-[9px] font-bold flex items-center justify-center">
                            {row.unreadCount > 99 ? '99+' : row.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
