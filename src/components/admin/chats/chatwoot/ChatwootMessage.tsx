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

type RoleStyle = {
    bgColor: string;
    borderColor: string;
    textColor: string;
    alignment: 'left' | 'right';
    borderTopLeftRadius: string;
    borderTopRightRadius: string;
};

function getRoleStyle(role: AdminChatThreadMessage['role']): RoleStyle {
    switch (role) {
        case 'user':
            return {
                bgColor: 'var(--cw-msg-user)',
                borderColor: 'rgba(255,255,255,0.08)',
                textColor: '#c5cad8',
                alignment: 'left',
                borderTopLeftRadius: '2px',
                borderTopRightRadius: '8px',
            };
        case 'assistant':
            return {
                bgColor: 'var(--cw-msg-bot)',
                borderColor: 'rgba(79,70,229,0.18)',
                textColor: '#b5b8f0',
                alignment: 'left',
                borderTopLeftRadius: '2px',
                borderTopRightRadius: '8px',
            };
        case 'admin':
            return {
                bgColor: 'var(--cw-msg-admin)',
                borderColor: 'transparent',
                textColor: '#ffffff',
                alignment: 'right',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '2px',
            };
        default:
            return {
                bgColor: 'transparent',
                borderColor: 'transparent',
                textColor: 'var(--cw-text-3)',
                alignment: 'left',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
            };
    }
}

function getSenderLabel(message: AdminChatThreadMessage): string {
    switch (message.role) {
        case 'admin':
            return 'AEROFREN Support';
        case 'assistant':
            return 'AI AEROFREN';
        case 'user':
            return message.userName ?? message.userEmail ?? 'Πελάτης';
        default:
            return '';
    }
}

export default function ChatwootMessage({ entry }: ChatwootMessageProps) {
    // Day separator
    if (entry.type === 'day') {
        return (
            <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-[var(--cw-border)]" />
                <span className="text-[10px] text-[var(--cw-text-3)] font-medium uppercase tracking-wider flex-shrink-0">
                    {entry.label}
                </span>
                <div className="flex-1 h-px bg-[var(--cw-border)]" />
            </div>
        );
    }

    const { message } = entry;

    // System message — no bubble
    if (message.role === 'system') {
        return (
            <div className="text-center text-[10px] text-[var(--cw-text-3)] py-0.5 italic my-1">
                {message.content}
            </div>
        );
    }

    const style = getRoleStyle(message.role);
    const isAdmin = message.role === 'admin';
    const senderLabel = getSenderLabel(message);

    return (
        <div className={`flex flex-col mb-3 ${isAdmin ? 'items-end' : 'items-start'}`}>
            {/* Sender label */}
            <span
                className={`text-[9px] uppercase font-medium tracking-wider mb-1 text-[var(--cw-text-3)] ${isAdmin ? 'text-right' : 'text-left'}`}
            >
                {senderLabel}
            </span>

            {/* Message bubble */}
            <div
                className="relative rounded-lg border px-3 py-2 max-w-[65%]"
                style={{
                    background: style.bgColor,
                    borderColor: style.borderColor,
                    borderTopLeftRadius: style.borderTopLeftRadius,
                    borderTopRightRadius: style.borderTopRightRadius,
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                }}
            >
                <p
                    className="text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                    style={{ color: style.textColor }}
                >
                    {message.content}
                </p>
                <time
                    className="block text-[9px] mt-1 opacity-60 text-right"
                    style={{ color: style.textColor }}
                >
                    {formatTime(message.timestamp)}
                </time>
            </div>
        </div>
    );
}
