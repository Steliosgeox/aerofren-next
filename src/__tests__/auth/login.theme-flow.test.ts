import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Login auth primitive integration', () => {
  it('uses shared auth primitives and no hardcoded alert utility colors', () => {
    const file = readFileSync(join(process.cwd(), 'src/components/Login.tsx'), 'utf8');

    expect(file).toContain('AuthAlert');
    expect(file).toContain('AuthDivider');
    expect(file).toContain('AuthPrimaryButton');
    expect(file).toContain('AuthSocialButton');

    expect(file).not.toContain('bg-amber-500/15');
    expect(file).not.toContain('border-amber-500/30');
    expect(file).not.toContain('text-amber-300');
    expect(file).not.toContain('bg-red-500/15');
    expect(file).not.toContain('border-red-500/30');
    expect(file).not.toContain('text-red-300');
  });
});
