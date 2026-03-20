import { buildCurrentConversation, buildPrimaryAction, groupMessagesByDay } from '@/lib/admin-chat/workspace';
import type { AdminChatSession } from '@/services/admin';
import type { ChatSessionSummary } from '@/services/chat';

describe('admin chat workspace helpers', () => {
    const baseSession: AdminChatSession = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-1',
        userEmail: 'user@example.com',
        userName: 'Example User',
        messageCount: 3,
        lastMessage: '2026-03-13T18:00:00.000Z',
        adminUnreadCount: 1,
        customerUnreadCount: 0,
        waitingOn: 'admin',
        isEscalated: true,
        escalationStatus: 'pending',
    };

    it('keeps reply as the primary action for active registered chats', () => {
        expect(buildPrimaryAction(baseSession)).toEqual({
            kind: 'reply',
            label: 'Απάντηση',
        });
    });

    it('maps resolved chats to reopen as the primary action', () => {
        expect(buildPrimaryAction({ ...baseSession, escalationStatus: 'resolved' })).toEqual({
            kind: 'reopen',
            label: 'Άνοιγμα ξανά',
        });
    });

    it('falls back to live thread metadata when the selected session is not in the list slice', () => {
        const meta: ChatSessionSummary = {
            sessionId: 'missing-session',
            userEmail: 'missing@example.com',
            userName: 'Missing User',
            escalationStatus: 'in_progress',
            waitingOn: 'customer',
            lastMessageAt: '2026-03-13T19:00:00.000Z',
            messageCount: 6,
            adminUnreadCount: 0,
            customerUnreadCount: 2,
            isEscalated: true,
        };

        expect(buildCurrentConversation('missing-session', [baseSession], meta)).toMatchObject({
            sessionId: 'missing-session',
            userEmail: 'missing@example.com',
            escalationStatus: 'in_progress',
            waitingOn: 'customer',
        });
    });

    it('groups messages by day with a separator per calendar day', () => {
        const grouped = groupMessagesByDay([
            {
                id: '1',
                role: 'user',
                content: 'hello',
                timestamp: '2026-03-13T08:00:00.000Z',
            },
            {
                id: '2',
                role: 'admin',
                content: 'reply',
                timestamp: '2026-03-13T08:05:00.000Z',
            },
            {
                id: '3',
                role: 'assistant',
                content: 'later',
                timestamp: '2026-03-14T09:00:00.000Z',
            },
        ]);

        expect(grouped.filter((entry) => entry.type === 'day')).toHaveLength(2);
        expect(grouped.map((entry) => entry.type)).toEqual(['day', 'message', 'message', 'day', 'message']);
    });
});
