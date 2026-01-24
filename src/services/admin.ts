import type { AuthUser } from '@/services/http';
import { fetchWithAuth } from '@/services/http';

export interface AdminStats {
    totalChats: number;
    escalatedChats: number;
    pendingEscalations: number;
    uniqueUsers: number;
    todayChats: number;
}

export interface EscalatedChat {
    sessionId: string;
    userId: string;
    userEmail: string;
    userName: string;
    escalatedAt: string;
    status: 'pending' | 'in_progress' | 'resolved';
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface AdminChatSession {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    messageCount: number;
    lastMessage: string;
    isEscalated?: boolean;
    escalationStatus?: 'pending' | 'in_progress' | 'resolved';
}

export interface ChatHistoryMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    userEmail?: string;
    userName?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    nextCursor: string | null;
}

export async function fetchAdminStats(user: AuthUser | null): Promise<AdminStats> {
    return fetchWithAuth<AdminStats>(user, '/api/admin/stats');
}

export async function fetchEscalations(user: AuthUser | null): Promise<EscalatedChat[]> {
    return fetchWithAuth<EscalatedChat[]>(user, '/api/admin/escalations');
}

export async function resolveEscalation(user: AuthUser | null, sessionId: string): Promise<boolean> {
    const data = await fetchWithAuth<{ success: boolean }>(
        user,
        '/api/admin/escalations/resolve',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        }
    );
    return data.success === true;
}

export async function fetchChatSessionsPage(
    user: AuthUser | null,
    options?: { cursor?: string | null; limit?: number }
): Promise<PaginatedResult<AdminChatSession>> {
    const params = new URLSearchParams();
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.limit) params.set('limit', String(options.limit));

    const data = await fetchWithAuth<{ sessions: AdminChatSession[]; nextCursor: string | null }>(
        user,
        `/api/admin/chats${params.toString() ? `?${params.toString()}` : ''}`
    );

    return {
        items: data.sessions ?? [],
        nextCursor: data.nextCursor ?? null,
    };
}

export async function fetchChatHistoryPage(
    user: AuthUser | null,
    sessionId: string,
    options?: { cursor?: string | null; limit?: number }
): Promise<PaginatedResult<ChatHistoryMessage>> {
    const params = new URLSearchParams({ sessionId });
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.limit) params.set('limit', String(options.limit));

    const data = await fetchWithAuth<{ messages: ChatHistoryMessage[]; nextCursor: string | null }>(
        user,
        `/api/chat/history?${params.toString()}`
    );
    return {
        items: data.messages ?? [],
        nextCursor: data.nextCursor ?? null,
    };
}
