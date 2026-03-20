import type { ChatEscalationStatus } from '@/lib/chat/types';

const PREVIEW_LIMIT = 140;

function toWords(value: string): string[] {
    return value
        .split(/[\s._-]+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

export function normalizeChatSearchValue(value?: string | null): string {
    return (value ?? '').trim().toLowerCase();
}

export function getEmailLocalPart(email?: string | null): string {
    const normalized = normalizeChatSearchValue(email);
    if (!normalized) return '';
    const [localPart] = normalized.split('@');
    return localPart ?? '';
}

export function buildMessagePreview(content?: string | null): string {
    const collapsed = (content ?? '').replace(/\s+/g, ' ').trim();
    if (collapsed.length <= PREVIEW_LIMIT) {
        return collapsed;
    }
    return `${collapsed.slice(0, PREVIEW_LIMIT - 1).trimEnd()}…`;
}

export function getChatIdentityMetadata(input: {
    userEmail?: string | null;
    userName?: string | null;
    userPhotoURL?: string | null;
}) {
    const userEmailNormalized = normalizeChatSearchValue(input.userEmail);
    const userNameNormalized = normalizeChatSearchValue(input.userName);
    const userEmailLocalPartNormalized = getEmailLocalPart(input.userEmail);

    return {
        ...(input.userEmail ? { userEmail: input.userEmail } : {}),
        ...(input.userName ? { userName: input.userName } : {}),
        ...(input.userPhotoURL ? { userPhotoURL: input.userPhotoURL } : {}),
        ...(userEmailNormalized ? { userEmailNormalized } : {}),
        ...(userNameNormalized ? { userNameNormalized } : {}),
        ...(userEmailLocalPartNormalized ? { userEmailLocalPartNormalized } : {}),
    };
}

export function buildInitials(userName?: string | null, userEmail?: string | null): string {
    const candidates = [
        ...toWords(userName ?? ''),
        ...toWords(getEmailLocalPart(userEmail)),
    ];

    const deduped = candidates.filter((value, index) => candidates.indexOf(value) === index);
    if (deduped.length >= 2) {
        return `${deduped[0][0]}${deduped[1][0]}`.toUpperCase();
    }

    if (deduped.length === 1) {
        const [first] = deduped;
        const pair = first.slice(0, 2);
        return pair.toUpperCase();
    }

    return '??';
}

export function getConversationPrimaryLabel(input: {
    sessionId: string;
    userName?: string | null;
    userEmail?: string | null;
}) {
    const userName = input.userName?.trim();
    if (userName) {
        return userName;
    }

    const localPart = getEmailLocalPart(input.userEmail);
    if (localPart) {
        return localPart;
    }

    return `Συνεδρία ${input.sessionId.slice(0, 8)}`;
}

export function isOpenEscalationStatus(
    status?: ChatEscalationStatus | null
): status is 'pending' | 'in_progress' {
    return status === 'pending' || status === 'in_progress';
}
