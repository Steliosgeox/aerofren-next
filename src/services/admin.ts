import type { AuthUser } from '@/services/http';
import { fetchWithAuth } from '@/services/http';
import type {
    AdminChatStatusFilter,
    ChatEscalationStatus,
    ChatMessageRole,
    ChatWaitingOn,
} from '@/lib/chat/types';

export interface AdminStats {
    totalChats: number;
    escalatedChats: number;
    pendingEscalations: number;
    uniqueUsers: number;
    uniqueUsersInitialized?: boolean;
    uniqueUsersSource?: 'sys_stats' | 'chat_users' | 'uninitialized';
    todayChats: number;
    traceId?: string;
}

export interface EscalatedChat {
    sessionId: string;
    userId: string;
    userEmail: string;
    userName: string;
    escalatedAt: string;
    status: ChatEscalationStatus;
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface AdminChatSession {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userPhotoURL?: string;
    messageCount: number;
    lastMessage: string;
    lastMessagePreview?: string;
    lastMessageRole?: ChatMessageRole;
    adminUnreadCount: number;
    customerUnreadCount: number;
    waitingOn?: ChatWaitingOn;
    assignedAdminEmail?: string;
    teamId?: string;
    userEmailNormalized?: string;
    userNameNormalized?: string;
    userEmailLocalPartNormalized?: string;
    isEscalated?: boolean;
    escalationStatus?: ChatEscalationStatus;
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
    options?: {
        cursor?: string | null;
        limit?: number;
        status?: AdminChatStatusFilter;
        needsReply?: boolean;
        search?: string;
    }
): Promise<PaginatedResult<AdminChatSession>> {
    const params = new URLSearchParams();
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.status) params.set('status', options.status);
    if (options?.needsReply !== undefined) params.set('needsReply', String(options.needsReply));
    if (options?.search) params.set('search', options.search);

    const data = await fetchWithAuth<{ sessions: AdminChatSession[]; nextCursor: string | null }>(
        user,
        `/api/admin/chats${params.toString() ? `?${params.toString()}` : ''}`
    );

    return {
        items: data.sessions ?? [],
        nextCursor: data.nextCursor ?? null,
    };
}

export async function replyToChatSession(
    user: AuthUser | null,
    sessionId: string,
    content: string
): Promise<{ success: boolean }> {
    return fetchWithAuth<{ success: boolean }>(
        user,
        `/api/admin/chats/${encodeURIComponent(sessionId)}/reply`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        }
    );
}

export async function updateChatSessionStatus(
    user: AuthUser | null,
    sessionId: string,
    status: ChatEscalationStatus
): Promise<{ success: boolean; status: ChatEscalationStatus }> {
    return fetchWithAuth<{ success: boolean; status: ChatEscalationStatus }>(
        user,
        `/api/admin/chats/${encodeURIComponent(sessionId)}/status`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }
    );
}

export async function assignChatSession(
    user: AuthUser | null,
    sessionId: string,
    agentEmail: string | null,
    teamId?: string | null
): Promise<boolean> {
    const data = await fetchWithAuth<{ success: boolean }>(
        user,
        `/api/admin/chats/${encodeURIComponent(sessionId)}/assign`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentEmail, ...(teamId !== undefined ? { teamId } : {}) }),
        }
    );
    return data.success === true;
}

export async function markAdminChatRead(
    user: AuthUser | null,
    sessionId: string
): Promise<boolean> {
    const data = await fetchWithAuth<{ success: boolean }>(
        user,
        `/api/admin/chats/${encodeURIComponent(sessionId)}/read`,
        {
            method: 'POST',
        }
    );

    return data.success === true;
}

export interface ContactSubmission {
    id: string;
    requestId: string;
    name: string;
    email: string;
    message: string;
    phone?: string;
    company?: string;
    subject?: string;
    submittedAt: string;
    status: 'new' | 'read' | 'replied';
    source: string;
}

export async function fetchContactSubmissionsPage(
    user: AuthUser | null,
    options?: { cursor?: string | null; limit?: number }
): Promise<PaginatedResult<ContactSubmission>> {
    const params = new URLSearchParams();
    if (options?.cursor) params.set('cursor', options.cursor);
    if (options?.limit) params.set('limit', String(options.limit));

    const data = await fetchWithAuth<{ contacts: ContactSubmission[]; nextCursor: string | null }>(
        user,
        `/api/admin/contacts${params.toString() ? `?${params.toString()}` : ''}`
    );

    return {
        items: data.contacts ?? [],
        nextCursor: data.nextCursor ?? null,
    };
}

export async function updateContactStatus(
    user: AuthUser | null,
    id: string,
    status: ContactSubmission['status']
): Promise<boolean> {
    const data = await fetchWithAuth<{ success: boolean }>(
        user,
        `/api/admin/contacts/${encodeURIComponent(id)}`,
        {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        }
    );
    return data.success === true;
}
