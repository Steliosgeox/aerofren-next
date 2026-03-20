export type ChatMessageRole = 'user' | 'assistant' | 'admin' | 'system';

export type ChatWaitingOn = 'admin' | 'customer' | 'none';

export type ChatEscalationStatus = 'pending' | 'in_progress' | 'resolved';

export type AdminChatStatusFilter = 'open' | 'pending' | 'in_progress' | 'resolved' | 'all';
