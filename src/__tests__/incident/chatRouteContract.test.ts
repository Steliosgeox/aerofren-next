import { readFileSync } from 'node:fs';
import path from 'node:path';

const readSource = (relativePath: string) =>
    readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('chat route incident contract', () => {
    it('returns traceable persistence fields in response payload', () => {
        const source = readSource('src/app/(main)/api/chat/route.ts');

        expect(source).toMatch(/persisted:/);
        expect(source).toMatch(/traceId:/);
    });

    it('persists both message docs and session aggregate server-side', () => {
        const source = readSource('src/app/(main)/api/chat/route.ts');

        expect(source).toMatch(/collection\('chatMessages'\)/);
        expect(source).toMatch(/collection\('chatSessions'\)/);
    });

    it('seeds a chat session when escalation happens before prior history exists', () => {
        const source = readSource('src/app/(main)/api/chat/escalate/route.ts');

        expect(source).toMatch(/messagesSnapshot\.empty/);
        expect(source).toMatch(/lastMessagePreview/);
        expect(source).toMatch(/waitingOn:\s*'admin'/);
        expect(source).toMatch(/FieldValue\.increment\(1\)/);
    });

    it('loads chat history through an indexed sessionId plus timestamp query', () => {
        const source = readSource('src/app/(main)/api/chat/history/route.ts');

        expect(source).toMatch(/collection\('chatMessages'\)/);
        expect(source).toMatch(/where\('sessionId', '==', sessionId\)/);
        expect(source).toMatch(/orderBy\('timestamp', 'desc'\)/);
        expect(source).toMatch(/startAfter\(Timestamp\.fromMillis\(tsMillis\)\)/);
        expect(source).not.toMatch(/sortedDocs/);
    });

    it('stores human admin replies in chat messages and advances unread state', () => {
        const source = readSource('src/app/api/admin/chats/[sessionId]/reply/route.ts');

        expect(source).toMatch(/role:\s*'admin'/);
        expect(source).toMatch(/customerUnreadCount:\s*FieldValue\.increment\(1\)/);
        expect(source).toMatch(/waitingOn:\s*'customer'/);
    });

    it('clears customer unread state when the end user opens the session', () => {
        const source = readSource('src/app/(main)/api/chat/sessions/[sessionId]/read/route.ts');

        expect(source).toMatch(/customerUnreadCount:\s*0/);
        expect(source).toMatch(/sessionRef\.set/);
    });

    it('hides the public mobile dock on admin routes to protect the workspace layout', () => {
        const source = readSource('src/components/Header.tsx');

        expect(source).toMatch(/const showMobileDock = !\(pathname\?\.startsWith\('\/admin'\)\);/);
        expect(source).toMatch(/\{showMobileDock && <MobileBottomNav items=\{mobileDockItems\} \/>\}/);
    });
});
