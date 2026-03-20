import {
    buildRceChatListItems,
    buildRceMessageListItems,
} from '@/components/admin/chats/rce/adapter-helpers';
import type { AdminChatWorkspaceState } from '@/components/admin/chats/rce/adapter-helpers';

function createWorkspaceStub(): Pick<
    AdminChatWorkspaceState,
    'sessionRows' | 'currentConversation' | 'groupedMessages'
> {
    return {
        sessionRows: [
            {
                sessionId: 'session-1',
                name: 'Jane Customer',
                initials: 'JC',
                email: 'jane@example.com',
                preview: 'Customer: Need help with order 483',
                timestampLabel: '14:32',
                unreadCount: 2,
                messageCountLabel: '4 messages',
                waitingLabel: 'Waiting on admin',
                statusLabel: 'Pending',
                statusTone: 'pending',
                stateDotTone: 'amber',
                waitingTone: 'amber',
                isSelected: true,
            },
        ],
        currentConversation: {
            sessionId: 'session-1',
            userEmail: 'jane@example.com',
            userName: 'Jane Customer',
            userPhotoURL: undefined,
            messageCount: 4,
            lastMessage: '2026-03-14T12:32:00.000Z',
            adminUnreadCount: 2,
            customerUnreadCount: 0,
            waitingOn: 'admin',
            isEscalated: true,
            escalationStatus: 'pending',
        },
        groupedMessages: [
            {
                type: 'day',
                key: 'day-2026-03-14',
                label: 'Today',
            },
            {
                type: 'message',
                key: 'm-1',
                message: {
                    id: 'm-1',
                    role: 'user',
                    content: 'Need help with order 483',
                    timestamp: '2026-03-14T12:30:00.000Z',
                    userEmail: 'jane@example.com',
                    userName: 'Jane Customer',
                },
            },
            {
                type: 'message',
                key: 'm-2',
                message: {
                    id: 'm-2',
                    role: 'assistant',
                    content: 'I am escalating this to support.',
                    timestamp: '2026-03-14T12:31:00.000Z',
                    senderLabel: 'AI AEROFREN',
                },
            },
            {
                type: 'message',
                key: 'm-3',
                message: {
                    id: 'm-3',
                    role: 'admin',
                    content: 'We are checking the order now.',
                    timestamp: '2026-03-14T12:32:00.000Z',
                    senderLabel: 'AEROFREN Support',
                },
            },
        ],
    };
}

describe('RCE adapter helpers', () => {
    it('maps session rows into ChatList items with selection state and unread count', () => {
        const items = buildRceChatListItems(createWorkspaceStub());

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            id: 'session-1',
            title: 'Jane Customer',
            subtitle: 'Customer: Need help with order 483',
            unread: 2,
        });
        expect(items[0]?.className).toContain('admin-chat-rce__chat-item--active');
        expect(items[0]?.avatar).toContain('data:image/svg+xml');
    });

    it('maps grouped messages into system, left, and right message list items', () => {
        const items = buildRceMessageListItems(createWorkspaceStub());

        expect(items.map((item) => item.type)).toEqual(['system', 'text', 'text', 'text']);
        expect(items[0]).toMatchObject({
            type: 'system',
            text: 'Today',
        });
        expect(items[1]).toMatchObject({
            position: 'left',
            text: 'Need help with order 483',
        });
        expect(items[2]).toMatchObject({
            position: 'left',
            title: 'AI AEROFREN',
        });
        expect(items[3]).toMatchObject({
            position: 'right',
            status: 'read',
        });
    });
});
