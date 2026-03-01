import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetTheme = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

import { LiquidGlassSwitcher } from '@/components/LiquidGlassSwitcher';

describe('LiquidGlassSwitcher theme writes', () => {
  beforeEach(() => {
    mockSetTheme.mockReset();
    mockUseTheme.mockReset();

    mockUseTheme.mockReturnValue({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: mockSetTheme,
    });
  });

  it('uses setTheme without direct html data-theme mutation when view transitions exist', () => {
    const setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');
    const startViewTransitionMock = vi.fn((callback: () => void) => {
      callback();
      return { finished: Promise.resolve() };
    });

    Object.defineProperty(document, 'startViewTransition', {
      value: startViewTransitionMock,
      configurable: true,
      writable: true,
    });

    const { container } = render(<LiquidGlassSwitcher />);
    const lightInput = container.querySelector('input[value="light"]');
    expect(lightInput).not.toBeNull();

    fireEvent.click(lightInput!);

    expect(startViewTransitionMock).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
    expect(setAttributeSpy).not.toHaveBeenCalledWith('data-theme', 'light');
  });
});
