'use client';

import React from 'react';

/**
 * LiquidSurface
 * 
 * Reusable glass surface component based on Aerofren's "Liquid Glass" system.
 * Extracts the premium CSS variables and mixing logic from LiquidGlassSwitcher.
 * 
 * Usage:
 * <LiquidSurface type="card">Content</LiquidSurface>
 * <LiquidSurface type="button" onClick={...}>Click Me</LiquidSurface>
 */

interface LiquidSurfaceProps {
    children: React.ReactNode;
    type?: 'card' | 'button';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function LiquidSurface({
    children,
    type = 'card',
    className = '',
    onClick,
    disabled
}: LiquidSurfaceProps) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = type === 'button' ? 'button' : 'div' as any;

    return (
        <Component
            className={`liquid-surface ${type} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            <style jsx>{`
                .liquid-surface {
                    /* INHERIT CSS VARS FROM GLOBAL THEME OR DEFINE FALLBACKS */
                    --glass-reflex-opacity: 0.1;
                    --glass-highlight: rgba(255, 255, 255, 0.4);
                    
                    position: relative;
                    isolation: isolate;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    
                    /* THE MAGIC: Liquid Glass Mix */
                    background-color: color-mix(in srgb, var(--c-glass, #bbbbbc) 8%, transparent);
                    backdrop-filter: blur(12px) saturate(var(--saturation, 120%));
                    
                    /* Premium Shadows */
                    box-shadow: 
                        /* Inner bevel highlight - top/left */
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
                        inset 1px 0 0 0 rgba(255, 255, 255, 0.1),
                        /* Deep shadow */
                        0 8px 32px -4px rgba(0, 0, 0, 0.2);
                }

                /* CARD VARIANT */
                .liquid-surface.card {
                    border-radius: 20px;
                    overflow: hidden;
                }
                
                /* BUTTON VARIANT */
                .liquid-surface.button {
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    
                    /* Button specific glass enhancement */
                    background-color: color-mix(in srgb, var(--c-glass, #bbbbbc) 12%, transparent);
                    color: inherit;
                }

                .liquid-surface.button:hover:not(:disabled) {
                    /* Brighter on hover */
                    background-color: color-mix(in srgb, var(--c-glass, #bbbbbc) 18%, transparent);
                    transform: translateY(-2px);
                    box-shadow: 
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
                        0 12px 24px -2px rgba(0, 0, 0, 0.25),
                        0 0 0 1px rgba(255, 255, 255, 0.1);
                }

                .liquid-surface.button:active:not(:disabled) {
                    transform: translateY(0);
                    box-shadow: 
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                        0 4px 12px -2px rgba(0, 0, 0, 0.2);
                }
                
                .liquid-surface.button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    backdrop-filter: none;
                }

                /* THEME AWARE OVERRIDES */
                :global([data-theme="light"]) .liquid-surface {
                    background-color: color-mix(in srgb, var(--c-glass) 30%, transparent);
                    border-color: rgba(0, 0, 0, 0.05);
                    box-shadow: 
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
                        0 8px 24px -4px rgba(0, 0, 0, 0.05);
                }
            `}</style>
            {children}
        </Component>
    );
}
