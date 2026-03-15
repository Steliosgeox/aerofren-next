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

type RoleStyle = {
    bgColor: string;
    textColor: string;
    alignment: 'left' | 'right';
    borderRadius: string;
};

function getRoleStyle(role: AdminChatThreadMessage['role']): RoleStyle {
    switch (role) {
        case 'user':
            return {
                bgColor: 'var(--cw-msg-user)',
                textColor: '#c5cad8',
                alignment: 'left',
                borderRadius: '2px 8px 8px 8px',
            };
        case 'assistant':
            return {
                bgColor: 'var(--cw-msg-bot)',
                textColor: '#b5b8f0',
                alignment: 'left',
                borderRadius: '2px 8px 8px 8px',
            };
        case 'admin':
            return {
                bgColor: 'var(--cw-msg-admin)',
                textColor: '#ffffff',
                alignment: 'right',
                borderRadius: '8px 2px 8px 8px',
            };
        default:
            return {
                bgColor: 'transparent',
                textColor: 'var(--cw-text-3)',
                alignment: 'left',
                borderRadius: '6px',
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

export default function ChatwootMessage({ entry, prevEntry }: ChatwootMessageProps) {
    // Day separator
    if (entry.type === 'day') {
        return (
            <div className="flex items-center gap-2 my-1.5">
                <div className="flex-1 h-px bg-[var(--cw-border)]" />
                <span className="text-[9px] text-[var(--cw-text-3)] font-medium uppercase tracking-wider flex-shrink-0 px-1">
                    {entry.label}
                </span>
                <div className="flex-1 h-px bg-[var(--cw-border)]" />
            </div>
        );
    }

    const { message } = entry;

    // System message — centered, no bubble
    if (message.role === 'system') {
        return (
            <div className="text-center my-1">
                <span className="text-[10px] text-[var(--cw-text-3)] italic bg-[var(--cw-border)] px-2 py-0.5 rounded">
                    {message.content}
                </span>
            </div>
        );
    }

    const style = getRoleStyle(message.role);
    const isAdmin = message.role === 'admin';
    const senderLabel = getSenderLabel(message);

    // Check if previous message was from same sender (group consecutive same-sender messages)
    const isSameAsPrev =
        prevEntry?.type === 'message' && prevEntry.message.role === message.role;

    return (
        <div className={`flex flex-col mb-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
            {/* Sender label — only show when sender changes */}
            {!isSameAsPrev && (
                <span
                    className={`text-[9px] font-medium tracking-wide mb-0.5 text-[var(--cw-text-3)] ${isAdmin ? 'text-right' : 'text-left'}`}
                >
                    {senderLabel}
                </span>
            )}

            {/* Message bubble */}
            <div
                className="px-2.5 py-1.5 max-w-[62%]"
                style={{
                    background: style.bgColor,
                    borderRadius: style.borderRadius,
                    color: style.textColor,
                }}
            >
                <p className="text-[12px] leading-snug whitespace-pre-wrap break-words">
                    {message.content}
                </p>
                <time
                    className="block text-[9px] mt-0.5 opacity-60 text-right"
                    style={{ color: style.textColor }}
                >
                    {formatTime(message.timestamp)}
                </time>
            </div>
        </div>
    );
}
