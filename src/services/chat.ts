import type { AuthUser, JsonObject } from '@/services/http';
import { saveChatMessage, type ChatUser } from '@/lib/firebase';
import { fetchWithAuth } from '@/services/http';

export type EscalationResponse = JsonObject & {
    success: boolean;
    status: 'pending' | 'in_progress' | 'resolved';
    alreadyEscalated?: boolean;
};

export async function persistChatMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    user?: ChatUser | null
): Promise<string | null> {
    return saveChatMessage(sessionId, role, content, user);
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
