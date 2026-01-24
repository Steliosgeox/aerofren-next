'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const DISABLE_SMOOTH_SCROLL_PREFIXES = ['/admin', '/login', '/signup'];

function shouldDisableSmoothScroll(pathname: string): boolean {
    return DISABLE_SMOOTH_SCROLL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function RouteScrollShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (!pathname || shouldDisableSmoothScroll(pathname)) {
        return <>{children}</>;
    }

    return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
