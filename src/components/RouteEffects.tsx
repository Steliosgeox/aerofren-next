'use client';

import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '@/contexts/ChatContext';

const ScrollFrameAnimation = dynamic(() => import('@/components/ScrollFrameAnimation'), { ssr: false });
const Chatbot = dynamic(() => import('@/components/Chatbot').then((mod) => mod.Chatbot), { ssr: false });
const BackToTop = dynamic(() => import('@/components/BackToTop').then((mod) => mod.BackToTop), { ssr: false });

const BACK_TO_TOP_ROUTE_PREFIXES = ['/', '/products', '/contact'];
const CHATBOT_IDLE_TIMEOUT_MS = 1500;
const ENABLE_SCROLL_FRAME = process.env.NEXT_PUBLIC_ENABLE_SCROLL_FRAME === '1';

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
    const searchParams = useSearchParams();
    const { openChat, selectSession } = useChat();
    const [idleReadyPath, setIdleReadyPath] = useState<string | null>(null);
    const activePathname = pathname ?? '';
    const showScrollFrame = ENABLE_SCROLL_FRAME && activePathname === '/';
    const showChatbot = Boolean(activePathname);
    const showBackToTop = activePathname
        ? shouldRender(activePathname, BACK_TO_TOP_ROUTE_PREFIXES)
        : false;
    const delayChatbotMount = activePathname.startsWith('/contact');

    useEffect(() => {
        if (searchParams.get('chat') === 'open') {
            openChat();
        }

        const sessionParam = searchParams.get('session');
        if (sessionParam) {
            selectSession(sessionParam, { persist: false });
        }
    }, [openChat, searchParams, selectSession]);

    useEffect(() => {
        if (!activePathname || !showChatbot || !delayChatbotMount) {
            return;
        }

        let timeoutId: number | null = null;
        let idleId: number | null = null;
        const idleWindow = window as Window & {
            requestIdleCallback?: (
                callback: IdleRequestCallback,
                options?: IdleRequestOptions
            ) => number;
            cancelIdleCallback?: (id: number) => void;
        };

        const setReady = () => setIdleReadyPath(activePathname);

        if (typeof idleWindow.requestIdleCallback === 'function') {
            idleId = idleWindow.requestIdleCallback(setReady, { timeout: CHATBOT_IDLE_TIMEOUT_MS });
        } else {
            timeoutId = window.setTimeout(setReady, CHATBOT_IDLE_TIMEOUT_MS);
        }

        return () => {
            if (idleId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
                idleWindow.cancelIdleCallback(idleId);
            }
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [activePathname, delayChatbotMount, showChatbot]);

    if (!activePathname) {
        return null;
    }

    const chatbotReady = showChatbot && (!delayChatbotMount || idleReadyPath === activePathname);

    return (
        <>
            {showScrollFrame && <ScrollFrameAnimation />}
            {showChatbot && chatbotReady && <Chatbot />}
            {showBackToTop && <BackToTop />}
        </>
    );
}
