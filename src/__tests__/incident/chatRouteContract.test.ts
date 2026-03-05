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
});
