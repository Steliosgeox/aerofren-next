import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

import { useAppTheme } from '@/lib/theme/useAppTheme';

describe('useAppTheme', () => {
  beforeEach(() => {
    mockSetTheme.mockReset();
    mockUseTheme.mockReset();
    document.documentElement.removeAttribute('data-theme');
  });

  it('resolves to dark when no theme values are available', async () => {
    mockUseTheme.mockReturnValue({
      theme: undefined,
      resolvedTheme: undefined,
      setTheme: mockSetTheme,
    });

    const { result } = renderHook(() => useAppTheme());

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    expect(result.current.effectiveTheme).toBe('dark');
  });

  it('uses resolvedTheme when available after mount', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'dim',
      resolvedTheme: 'light',
      setTheme: mockSetTheme,
    });

    const { result } = renderHook(() => useAppTheme());

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    expect(result.current.effectiveTheme).toBe('light');
  });

  it('exposes setTheme from next-themes without direct DOM mutation', async () => {
    const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');

    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dim',
      setTheme: mockSetTheme,
    });

    const { result } = renderHook(() => useAppTheme());

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    result.current.setTheme('light');
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    expect(setAttributeSpy).not.toHaveBeenCalled();
  });
});
