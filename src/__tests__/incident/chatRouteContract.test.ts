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
        expect(source).toMatch(/ζήτησε προώθηση σε εκπρόσωπο/);
        expect(source).toMatch(/FieldValue\.increment\(1\)/);
    });
});
