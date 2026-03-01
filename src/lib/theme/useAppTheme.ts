'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';

export type AppTheme = 'dark' | 'light' | 'dim';

interface UseAppThemeResult {
  mounted: boolean;
  theme: string | undefined;
  resolvedTheme: string | undefined;
  effectiveTheme: AppTheme;
  setTheme: (theme: string) => void;
}

const subscribe = () => () => {};

/**
 * useAppTheme
 * Single mounted-safe theme contract for all client components.
 */
export function useAppTheme(): UseAppThemeResult {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const effectiveTheme = useMemo<AppTheme>(() => {
    if (!mounted) {
      return 'dark';
    }

    const candidate = (resolvedTheme || theme) as AppTheme | undefined;
    if (candidate === 'light' || candidate === 'dim' || candidate === 'dark') {
      return candidate;
    }

    return 'dark';
  }, [mounted, resolvedTheme, theme]);

  return {
    mounted,
    theme,
    resolvedTheme,
    effectiveTheme,
    setTheme,
  };
}
