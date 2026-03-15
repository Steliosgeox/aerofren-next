'use client';

import React from 'react';

interface AdminChatThreadMessage {
    id: string;
    role: 'user' | 'assistant' | 'admin' | 'system';
    content: string;
    timestamp: string;
    userEmail?: string | null;
    userName?: string | null;
    senderLabel?: string | null;
}

interface AdminChatGroupedMessageDayEntry {
    type: 'day';
    key: string;
    label: string;
}

interface AdminChatGroupedMessageItemEntry {
    type: 'message';
    key: string;
    message: AdminChatThreadMessage;
}

type AdminChatGroupedMessageEntry =
    | AdminChatGroupedMessageDayEntry
    | AdminChatGroupedMessageItemEntry;

interface ChatwootMessageProps {
    entry: AdminChatGroupedMessageEntry;
    prevEntry?: AdminChatGroupedMessageEntry;
}

function formatTime(timestamp: string): string {
    try {
        return new Date(timestamp).toLocaleTimeString('el-GR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '';
    }
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

function getSenderLabel(message: AdminChatThreadMessage): string {
    switch (message.role) {
        case 'admin':
            return 'AEROFREN Support';
        case 'assistant':
            return 'AI Bot';
        case 'user':
            return message.userName ?? message.userEmail ?? 'Πελάτης';
        default:
            return '';
    }
}

function getSenderInitials(message: AdminChatThreadMessage): string {
    const label = getSenderLabel(message);
    return getInitials(label) || '??';
}

type BubbleConfig = {
    bgColor: string;
    textColor: string;
    isRight: boolean;
    borderRadius: string;
    avatarBg: string;
};

function getBubbleConfig(role: AdminChatThreadMessage['role']): BubbleConfig {
    switch (role) {
        case 'user':
            return {
                bgColor: 'var(--cw-msg-user)',
                textColor: '#cdd3e4',
                isRight: false,
                borderRadius: '0px 8px 8px 8px',
                avatarBg: '#2a3a4f',
            };
        case 'assistant':
            return {
                bgColor: 'var(--cw-msg-bot)',
                textColor: '#b5bce0',
                isRight: false,
                borderRadius: '0px 8px 8px 8px',
                avatarBg: '#3d2a4f',
            };
        case 'admin':
            return {
                bgColor: 'var(--cw-msg-admin)',
                textColor: '#ffffff',
                isRight: true,
                borderRadius: '8px 0px 8px 8px',
                avatarBg: 'var(--cw-accent)',
            };
        default:
            return {
                bgColor: 'transparent',
                textColor: 'var(--cw-text-3)',
                isRight: false,
                borderRadius: '6px',
                avatarBg: '#2a2a2a',
            };
    }
}

export default function ChatwootMessage({ entry, prevEntry }: ChatwootMessageProps) {
    // Day separator — Chatwoot style: thin line + date pill
    if (entry.type === 'day') {
        return (
            <div className="flex items-center gap-3 my-4 px-4">
                <div className="flex-1 h-px bg-[var(--cw-border)]" />
                <span className="text-[10px] text-[var(--cw-text-3)] font-medium flex-shrink-0 px-2 py-0.5 rounded-full border border-[var(--cw-border)] bg-[var(--cw-bg-main)]">
                    {entry.label}
                </span>
                <div className="flex-1 h-px bg-[var(--cw-border)]" />
            </div>
        );
    }

    const { message } = entry;

    // System message — Chatwoot centered activity pill
    if (message.role === 'system') {
        return (
            <div className="flex items-center justify-center my-1.5 px-6">
                <span className="text-[10px] text-[var(--cw-text-3)] bg-[var(--cw-bg-sidebar)] border border-[var(--cw-border)] px-3 py-0.5 rounded-full leading-5">
                    {message.content}
                </span>
            </div>
        );
    }

    const cfg = getBubbleConfig(message.role);
    const senderLabel = getSenderLabel(message);

    // Grouping: hide sender info when same role continues
    const isSameAsPrev =
        prevEntry?.type === 'message' && prevEntry.message.role === message.role;

    // Spacing: tight between grouped messages, normal gap on sender change
    const wrapperMb = isSameAsPrev ? 'mb-0.5' : 'mb-1';

    return (
        <div
            className={`flex items-end gap-2 ${cfg.isRight ? 'flex-row-reverse' : 'flex-row'} ${wrapperMb} px-4`}
        >
            {/* Avatar — only show on first message of each group */}
            <div className="w-6 h-6 flex-shrink-0 self-end mb-0.5">
                {!isSameAsPrev && (
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white select-none"
                        style={{ background: cfg.avatarBg }}
                        title={senderLabel}
                    >
                        {getSenderInitials(message)}
                    </div>
                )}
            </div>

            {/* Bubble column */}
            <div className={`flex flex-col max-w-[65%] ${cfg.isRight ? 'items-end' : 'items-start'}`}>
                {/* Sender name — only on first in group */}
                {!isSameAsPrev && (
                    <span className="text-[10px] font-medium text-[var(--cw-text-3)] mb-0.5 px-1">
                        {senderLabel}
                    </span>
                )}

                {/* Bubble */}
                <div
                    className="px-3 py-2"
                    style={{
                        background: cfg.bgColor,
                        borderRadius: cfg.borderRadius,
                        color: cfg.textColor,
                    }}
                >
                    <p className="text-[13px] leading-[1.45] whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                    <time
                        className="block text-[9px] mt-1 opacity-55 leading-none"
                        style={{ textAlign: cfg.isRight ? 'right' : 'left', color: cfg.textColor }}
                    >
                        {formatTime(message.timestamp)}
                    </time>
                </div>
            </div>
        </div>
    );
}
