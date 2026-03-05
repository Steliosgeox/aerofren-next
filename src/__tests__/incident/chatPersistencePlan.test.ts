import { createChatPersistencePlan } from '@/lib/chat/persistence-plan';

describe('createChatPersistencePlan', () => {
    it('creates two message drafts and a +2 session delta for authenticated users', () => {
        const now = new Date('2026-03-03T10:00:00.000Z');
        const plan = createChatPersistencePlan({
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            userMessage: 'hello',
            assistantMessage: 'hi there',
            occurredAt: now,
            user: {
                uid: 'user-1',
                email: 'admin@aerofren.gr',
                name: 'Admin User',
            },
        });

        expect(plan.messages).toHaveLength(2);
        expect(plan.messages[0]).toMatchObject({
            role: 'user',
            content: 'hello',
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            userId: 'user-1',
            userEmail: 'admin@aerofren.gr',
            userName: 'Admin User',
        });
        expect(plan.messages[1]).toMatchObject({
            role: 'assistant',
            content: 'hi there',
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            userId: 'user-1',
        });
        expect(plan.sessionUpdate).toMatchObject({
            sessionId: '550e8400-e29b-41d4-a716-446655440000',
            messageCountDelta: 2,
            userId: 'user-1',
            userEmail: 'admin@aerofren.gr',
            userName: 'Admin User',
        });
        expect(plan.sessionUpdate.lastMessageAt).toEqual(now);
        expect(plan.uniqueUserMarkerId).toBe('user-1');
    });

    it('keeps anonymous sessions persistable without unique-user marker', () => {
        const plan = createChatPersistencePlan({
            sessionId: 'session-anon',
            userMessage: 'anonymous hello',
            assistantMessage: 'anonymous reply',
            occurredAt: new Date('2026-03-03T11:00:00.000Z'),
            user: null,
        });

        expect(plan.messages).toHaveLength(2);
        expect(plan.messages[0].userId).toBeUndefined();
        expect(plan.sessionUpdate.userId).toBeUndefined();
        expect(plan.uniqueUserMarkerId).toBeNull();
    });
});
