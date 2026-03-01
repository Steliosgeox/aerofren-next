import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthAlert } from '@/components/auth/AuthAlert';

describe('AuthAlert', () => {
  it('renders semantic error variant without hardcoded tailwind color utilities', () => {
    render(<AuthAlert variant="error">Σφάλμα</AuthAlert>);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('auth-alert');
    expect(alert.className).toContain('auth-alert--error');
    expect(alert.className).not.toContain('text-red-300');
    expect(alert.className).not.toContain('bg-red-500');
  });

  it('renders semantic warning variant without hardcoded tailwind color utilities', () => {
    render(<AuthAlert variant="warning">Προσοχή</AuthAlert>);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('auth-alert');
    expect(alert.className).toContain('auth-alert--warning');
    expect(alert.className).not.toContain('text-amber-300');
    expect(alert.className).not.toContain('bg-amber-500');
  });
});
