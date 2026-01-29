'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import GlassSurface from '@/components/ui/GlassSurface';

// Load Silk dynamically
const Silk = dynamic(() => import('@/components/ui/Silk'), {
    ssr: false,
    loading: () => null
});

interface AuthLayoutProps {
    children: React.ReactNode;
    valuePanel?: React.ReactNode;
}

/**
 * AuthLayout - Unified glass card with auth form + value panel
 * 
 * Desktop: Single large glass card with two columns and divider
 * Mobile: Single column, value panel hidden
 */
export function AuthLayout({ children, valuePanel }: AuthLayoutProps) {
    const [silkColor, setSilkColor] = useState('#0d2a45');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const html = document.documentElement;
        let frame = 0;

        const readSilkColor = () => {
            const value = getComputedStyle(html)
                .getPropertyValue('--silk-color')
                .trim();
            if (value) {
                setSilkColor(value);
            }
        };

        const scheduleRead = () => {
            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(readSilkColor);
        };

        // Initial read + react to data-theme changes
        scheduleRead();
        const observer = new MutationObserver(scheduleRead);
        observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

        return () => {
            observer.disconnect();
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    }, []);

    return (
        <main className="auth-layout">
            <style jsx>{`
                .auth-layout {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    padding-top: 100px;
                    background: var(--theme-bg-solid);
                    position: relative;
                    overflow: hidden;
                }

                .silk-wrapper {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                }

                .unified-card-wrapper {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 440px;
                    animation: cardEntrance 0.6s ease-out;
                }

                @keyframes cardEntrance {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Desktop: Wider card for two columns */
                @media (min-width: 1024px) {
                    .unified-card-wrapper {
                        max-width: 880px;
                    }
                }

                .card-content {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0;
                    /* Containment for better render performance */
                    contain: layout style;
                }

                @media (min-width: 1024px) {
                    .card-content {
                        grid-template-columns: 1fr auto 1fr;
                    }
                }

                .auth-section {
                    padding: 40px 36px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                @media (max-width: 480px) {
                    .auth-section {
                        padding: 32px 24px;
                    }
                }

                .divider-section {
                    display: none;
                    align-items: stretch;
                    justify-content: center;
                    padding: 40px 0;
                }

                @media (min-width: 1024px) {
                    .divider-section {
                        display: flex;
                    }
                }

                .vertical-divider {
                    width: 1px;
                    background: linear-gradient(
                        180deg,
                        transparent 0%,
                        color-mix(in srgb, var(--theme-glass-border) 60%, transparent) 20%,
                        color-mix(in srgb, var(--theme-accent) 30%, transparent) 50%,
                        color-mix(in srgb, var(--theme-glass-border) 60%, transparent) 80%,
                        transparent 100%
                    );
                }

                .value-section {
                    display: none;
                    padding: 40px 36px;
                    align-items: center;
                    justify-content: center;
                }

                @media (min-width: 1024px) {
                    .value-section {
                        display: flex;
                    }
                }
            `}</style>

            {/* Silk Background */}
            <div className="silk-wrapper">
                <Silk color={silkColor} speed={4} scale={1} noiseIntensity={0} rotation={0} />
            </div>

            <div className="unified-card-wrapper">
                <GlassSurface
                    width="100%"
                    height="auto"
                    borderRadius={28}
                    blur={20}
                    backgroundOpacity={0.1}
                    saturation={1.6}
                    brightness={1.1}
                >
                    <div className="card-content">
                        {/* Left: Auth Form */}
                        <div className="auth-section">
                            {children}
                        </div>

                        {/* Vertical Divider */}
                        {valuePanel && (
                            <div className="divider-section">
                                <div className="vertical-divider" />
                            </div>
                        )}

                        {/* Right: Value Panel */}
                        {valuePanel && (
                            <div className="value-section">
                                {valuePanel}
                            </div>
                        )}
                    </div>
                </GlassSurface>
            </div>
        </main>
    );
}

export default AuthLayout;
