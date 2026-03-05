export interface ChatPersistenceUser {
    uid?: string | null;
    email?: string | null;
    name?: string | null;
}

export interface ChatMessageDraft {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    userId?: string;
    userEmail?: string;
    userName?: string;
}

export interface ChatSessionUpdateDraft {
    sessionId: string;
    lastMessageAt: Date;
    messageCountDelta: number;
    userId?: string;
    userEmail?: string;
    userName?: string;
}

export interface ChatPersistencePlan {
    messages: [ChatMessageDraft, ChatMessageDraft];
    sessionUpdate: ChatSessionUpdateDraft;
    uniqueUserMarkerId: string | null;
}

export interface CreateChatPersistencePlanInput {
    sessionId: string;
    userMessage: string;
    assistantMessage: string;
    occurredAt: Date;
    user?: ChatPersistenceUser | null;
}

export function createChatPersistencePlan(
    input: CreateChatPersistencePlanInput
): ChatPersistencePlan {
    const userId = input.user?.uid ?? undefined;
    const userEmail = input.user?.email ?? undefined;
    const userName = input.user?.name ?? undefined;

    const base = {
        sessionId: input.sessionId,
        timestamp: input.occurredAt,
        ...(userId ? { userId } : {}),
        ...(userEmail ? { userEmail } : {}),
        ...(userName ? { userName } : {}),
    };

    return {
        messages: [
            {
                ...base,
                role: 'user',
                content: input.userMessage,
            },
            {
                ...base,
                role: 'assistant',
                content: input.assistantMessage,
            },
        ],
        sessionUpdate: {
            sessionId: input.sessionId,
            lastMessageAt: input.occurredAt,
            messageCountDelta: 2,
            ...(userId ? { userId } : {}),
            ...(userEmail ? { userEmail } : {}),
            ...(userName ? { userName } : {}),
        },
        uniqueUserMarkerId: userId ?? null,
    };
}

