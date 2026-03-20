import type { AuthUser, JsonObject } from '@/services/http';
import { fetchJson, fetchWithAuth } from '@/services/http';
import type {
    ChatEscalationStatus,
    ChatMessageRole,
    ChatWaitingOn,
} from '@/lib/chat/types';

export type EscalationResponse = JsonObject & {
    success: boolean;
    status: ChatEscalationStatus;
    alreadyEscalated?: boolean;
};

export interface ChatHistoryMessage {
    id: string;
    role: ChatMessageRole;
    content: string;
    timestamp: string;
    userEmail?: string;
    userName?: string;
    senderLabel?: string;
}

export interface ChatSessionSummary {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userPhotoURL?: string;
    escalationStatus?: ChatEscalationStatus;
    waitingOn?: ChatWaitingOn;
    lastMessageAt?: string;
    lastMessagePreview?: string;
    lastMessageRole?: ChatMessageRole;
    messageCount?: number;
    adminUnreadCount?: number;
    customerUnreadCount?: number;
    isEscalated?: boolean;
}

export interface PaginatedChatHistoryResult {
    items: ChatHistoryMessage[];
    nextCursor: string | null;
    session: ChatSessionSummary | null;
}

export interface ChatCompletionRequest {
    message: string;
    sessionId?: string;
    history?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

export type ChatCompletionResponse = JsonObject & {
    response: string;
    sessionId: string;
    error?: string;
    persisted?: boolean;
    traceId?: string;
    persistenceError?: string;
};

export async function requestChatCompletion(
    user: AuthUser | null,
    payload: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
    const headers = new Headers({ 'Content-Type': 'application/json' });

    if (user) {
        const token = await user.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetchJson<ChatCompletionResponse>('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
}

export async function requestEscalation(
    user: AuthUser | null,
    sessionId: string
): Promise<EscalationResponse> {
    return fetchWithAuth<EscalationResponse>(user, '/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
    });
}

export async function fetchChatHistoryPage(
    user: AuthUser | null,
    sessionId: string,
    options?: { cursor?: string | null; limit?: number }
): Promise<PaginatedChatHistoryResult> {
    const params = new URLSearchParams({ sessionId });
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.limit) params.set('limit', String(options.limit));

    const data = await fetchWithAuth<{
        messages: ChatHistoryMessage[];
        nextCursor: string | null;
        session?: ChatSessionSummary | null;
    }>(user, `/api/chat/history?${params.toString()}`);

    return {
        items: data.messages ?? [],
        nextCursor: data.nextCursor ?? null,
        session: data.session ?? null,
    };
}

export async function markChatSessionRead(
    user: AuthUser | null,
    sessionId: string
): Promise<boolean> {
    const data = await fetchWithAuth<{ success: boolean }>(
        user,
        `/api/chat/sessions/${encodeURIComponent(sessionId)}/read`,
        {
            method: 'POST',
        }
    );

    return data.success === true;
}

