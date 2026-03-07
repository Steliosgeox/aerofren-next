'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import LenisProvider from '@/components/LenisProvider';

const DISABLE_SMOOTH_SCROLL_PREFIXES = ['/admin', '/login', '/signup'];
const LIGHTWEIGHT_LENIS_PREFIXES = ['/contact'];

export function shouldDisableSmoothScroll(pathname: string): boolean {
    return DISABLE_SMOOTH_SCROLL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function shouldUseLightweightLenis(pathname: string): boolean {
    return LIGHTWEIGHT_LENIS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function RouteScrollShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (!pathname || shouldDisableSmoothScroll(pathname)) {
        return <>{children}</>;
    }

    return <LenisProvider syncWithGsap={!shouldUseLightweightLenis(pathname)}>{children}</LenisProvider>;
}
