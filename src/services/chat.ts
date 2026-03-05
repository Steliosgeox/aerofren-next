import type { AuthUser, JsonObject } from '@/services/http';
import { fetchJson, fetchWithAuth } from '@/services/http';

export type EscalationResponse = JsonObject & {
    success: boolean;
    status: 'pending' | 'in_progress' | 'resolved';
    alreadyEscalated?: boolean;
};

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

