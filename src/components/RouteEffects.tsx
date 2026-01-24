'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const ScrollFrameAnimation = dynamic(() => import('@/components/ScrollFrameAnimation'), { ssr: false });
const Chatbot = dynamic(() => import('@/components/Chatbot').then((mod) => mod.Chatbot), { ssr: false });
const BackToTop = dynamic(() => import('@/components/BackToTop').then((mod) => mod.BackToTop), { ssr: false });

const CHATBOT_ROUTE_PREFIXES = ['/', '/products', '/contact'];
const BACK_TO_TOP_ROUTE_PREFIXES = ['/', '/products', '/contact'];

function matchesPrefix(pathname: string, prefix: string): boolean {
    if (prefix === '/') {
        return pathname === '/';
    }
    return pathname.startsWith(prefix);
}

function shouldRender(pathname: string, prefixes: string[]): boolean {
    return prefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

export function RouteEffects() {
    const pathname = usePathname();

    if (!pathname) {
        return null;
    }

    const showScrollFrame = pathname === '/';
    const showChatbot = shouldRender(pathname, CHATBOT_ROUTE_PREFIXES);
    const showBackToTop = shouldRender(pathname, BACK_TO_TOP_ROUTE_PREFIXES);

    return (
        <>
            {showScrollFrame && <ScrollFrameAnimation />}
            {showChatbot && <Chatbot />}
            {showBackToTop && <BackToTop />}
        </>
    );
}
