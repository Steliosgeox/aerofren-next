import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('GlassSurface token contract', () => {
  it('does not hardcode theme branch colors or fixed focus hex values', () => {
    const file = readFileSync(
      join(process.cwd(), 'src/components/ui/GlassSurface.tsx'),
      'utf8'
    );

    expect(file).not.toContain('#0A84FF');
    expect(file).not.toContain('#007AFF');
    expect(file).not.toContain('rgba(0, 0, 0');
    expect(file).not.toContain('rgba(255, 255, 255');
  });

  it('uses semantic glass surface tokens', () => {
    const file = readFileSync(
      join(process.cwd(), 'src/components/ui/GlassSurface.tsx'),
      'utf8'
    );

    expect(file).toContain('--glass-surface-base');
    expect(file).toContain('--glass-surface-border');
    expect(file).toContain('--glass-surface-shadow');
    expect(file).toContain('--focus-ring-color');
  });
});
