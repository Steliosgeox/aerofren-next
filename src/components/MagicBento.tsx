'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

export interface BentoCardProps {
    color?: string;
    title?: string;
    description?: string;
    label?: string;
    textAutoHide?: boolean;
    disableAnimations?: boolean;
}

export interface BentoProps {
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    disableAnimations?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    enableTilt?: boolean;
    glowColor?: string;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
    pointerThrottle?: 'raf' | 'none';
    cacheBounds?: boolean;
    children?: React.ReactNode;
}

const DEFAULT_PARTICLE_COUNT = 12;
const MAX_PARTICLE_POOL = 24;
const MAX_PARTICLES_PER_HOVER = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = 'var(--theme-accent-rgb)';
const MOBILE_BREAKPOINT = 768;

type CardBoundsEntry = {
    element: HTMLElement;
    rect: DOMRect;
};

const createParticleElement = (color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: 0;
    top: 0;
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(0);
  `;
    return el;
};

const calculateSpotlightValues = (radius: number) => ({
    proximity: radius * 0.5,
    fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
    card: HTMLElement,
    cardRect: DOMRect,
    mouseX: number,
    mouseY: number,
    glow: number,
    radius: number
) => {
    const relativeX = ((mouseX - cardRect.left) / cardRect.width) * 100;
    const relativeY = ((mouseY - cardRect.top) / cardRect.height) * 100;

    card.style.setProperty('--glow-x', `${relativeX}%`);
    card.style.setProperty('--glow-y', `${relativeY}%`);
    card.style.setProperty('--glow-intensity', glow.toString());
    card.style.setProperty('--glow-radius', `${radius}px`);
};

export const ParticleCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    disableAnimations?: boolean;
    style?: React.CSSProperties;
    particleCount?: number;
    glowColor?: string;
    enableTilt?: boolean;
    clickEffect?: boolean;
    enableMagnetism?: boolean;
    enableBorderGlow?: boolean;
}> = ({
    children,
    className = '',
    disableAnimations = false,
    style,
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = false,
    clickEffect = true,
    enableMagnetism = false,
    enableBorderGlow = true,
}) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const particlePoolRef = useRef<HTMLDivElement[]>([]);
        const particleIndexRef = useRef(0);
        const hoverTimeoutsRef = useRef<number[]>([]);
        const timelinesRef = useRef<Set<gsap.core.Timeline>>(new Set());
        const isHoveredRef = useRef(false);
        const moveFrameRef = useRef<number | null>(null);
        const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
        const particlesInitializedRef = useRef(false);
        const transformTweenRef = useRef<gsap.core.Tween | null>(null);

        const clearHoverTimeouts = useCallback(() => {
            hoverTimeoutsRef.current.forEach(clearTimeout);
            hoverTimeoutsRef.current = [];
        }, []);

        const clearParticleAnimations = useCallback(() => {
            timelinesRef.current.forEach((timeline) => timeline.kill());
            timelinesRef.current.clear();

            particlePoolRef.current.forEach((particle) => {
                gsap.killTweensOf(particle);
                gsap.set(particle, { opacity: 0, scale: 0, x: 0, y: 0, rotation: 0 });
            });
        }, []);

        const clearAllParticles = useCallback(() => {
            clearHoverTimeouts();
            clearParticleAnimations();
            transformTweenRef.current?.kill();
        }, [clearHoverTimeouts, clearParticleAnimations]);

        const initializeParticlePool = useCallback(() => {
            if (particlesInitializedRef.current || !cardRef.current) return;

            const poolSize = Math.max(1, Math.min(particleCount, MAX_PARTICLE_POOL));
            const pool = Array.from({ length: poolSize }, () => createParticleElement(glowColor));

            pool.forEach((particle) => {
                cardRef.current?.appendChild(particle);
            });

            particlePoolRef.current = pool;
            particlesInitializedRef.current = true;
        }, [particleCount, glowColor]);

        const spawnParticle = useCallback((x: number, y: number) => {
            const pool = particlePoolRef.current;
            if (!pool.length) return;

            const particle = pool[particleIndexRef.current % pool.length];
            particleIndexRef.current += 1;

            gsap.killTweensOf(particle);
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            const timeline = gsap.timeline({
                onComplete: () => {
                    timelinesRef.current.delete(timeline);
                    gsap.set(particle, { opacity: 0, scale: 0, x: 0, y: 0, rotation: 0 });
                },
            });

            timeline
                .fromTo(particle, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: 'power2.out' })
                .to(
                    particle,
                    {
                        x: (Math.random() - 0.5) * 72,
                        y: (Math.random() - 0.5) * 72,
                        rotation: (Math.random() - 0.5) * 180,
                        scale: 0.5,
                        opacity: 0,
                        duration: 1.1 + Math.random() * 0.5,
                        ease: 'power2.out',
                    },
                    0
                );

            timelinesRef.current.add(timeline);
        }, []);

        const animateParticles = useCallback(() => {
            if (!cardRef.current || !isHoveredRef.current) return;

            if (!particlesInitializedRef.current) {
                initializeParticlePool();
            }

            const rect = cardRef.current.getBoundingClientRect();
            const spawnCount = Math.max(1, Math.min(particleCount, MAX_PARTICLES_PER_HOVER));

            for (let index = 0; index < spawnCount; index += 1) {
                const timeoutId = window.setTimeout(() => {
                    if (!isHoveredRef.current) return;
                    const x = Math.random() * rect.width;
                    const y = Math.random() * rect.height;
                    spawnParticle(x, y);
                }, index * 70);

                hoverTimeoutsRef.current.push(timeoutId);
            }
        }, [initializeParticlePool, particleCount, spawnParticle]);

        useEffect(() => {
            if (disableAnimations || !cardRef.current) return;

            const element = cardRef.current;

            const flushPointerMotion = () => {
                moveFrameRef.current = null;

                if (!latestPointerRef.current) return;
                const rect = element.getBoundingClientRect();
                const x = latestPointerRef.current.x - rect.left;
                const y = latestPointerRef.current.y - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const tweenVars: gsap.TweenVars = {
                    duration: 0.16,
                    ease: 'power2.out',
                    overwrite: 'auto',
                };

                if (enableTilt) {
                    tweenVars.rotateX = ((y - centerY) / centerY) * -10;
                    tweenVars.rotateY = ((x - centerX) / centerX) * 10;
                    tweenVars.transformPerspective = 1000;
                }

                if (enableMagnetism) {
                    tweenVars.x = (x - centerX) * 0.05;
                    tweenVars.y = (y - centerY) * 0.05;
                }

                transformTweenRef.current = gsap.to(element, tweenVars);
            };

            const handleMouseEnter = () => {
                isHoveredRef.current = true;
                animateParticles();
            };

            const handleMouseLeave = () => {
                isHoveredRef.current = false;
                latestPointerRef.current = null;
                if (moveFrameRef.current !== null) {
                    cancelAnimationFrame(moveFrameRef.current);
                    moveFrameRef.current = null;
                }
                clearAllParticles();

                if (enableTilt || enableMagnetism) {
                    transformTweenRef.current = gsap.to(element, {
                        rotateX: 0,
                        rotateY: 0,
                        x: 0,
                        y: 0,
                        duration: 0.22,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                }
            };

            const handleMouseMove = (event: MouseEvent) => {
                if (!enableTilt && !enableMagnetism) return;
                latestPointerRef.current = { x: event.clientX, y: event.clientY };

                if (moveFrameRef.current === null) {
                    moveFrameRef.current = requestAnimationFrame(flushPointerMotion);
                }
            };

            const handleClick = (event: MouseEvent) => {
                if (!clickEffect) return;

                const rect = element.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const maxDistance = Math.max(
                    Math.hypot(x, y),
                    Math.hypot(x - rect.width, y),
                    Math.hypot(x, y - rect.height),
                    Math.hypot(x - rect.width, y - rect.height)
                );

                const ripple = document.createElement('div');
                ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.38) 0%, rgba(${glowColor}, 0.16) 35%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

                element.appendChild(ripple);

                gsap.fromTo(
                    ripple,
                    { scale: 0, opacity: 1 },
                    {
                        scale: 1,
                        opacity: 0,
                        duration: 0.7,
                        ease: 'power2.out',
                        onComplete: () => ripple.remove(),
                    }
                );
            };

            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('click', handleClick);

            return () => {
                isHoveredRef.current = false;
                latestPointerRef.current = null;
                if (moveFrameRef.current !== null) {
                    cancelAnimationFrame(moveFrameRef.current);
                    moveFrameRef.current = null;
                }

                element.removeEventListener('mouseenter', handleMouseEnter);
                element.removeEventListener('mouseleave', handleMouseLeave);
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('click', handleClick);

                clearAllParticles();
                particlePoolRef.current.forEach((particle) => particle.remove());
                particlePoolRef.current = [];
                particlesInitializedRef.current = false;
            };
        }, [
            animateParticles,
            clearAllParticles,
            clickEffect,
            disableAnimations,
            enableMagnetism,
            enableTilt,
            glowColor,
        ]);

        return (
            <>
                <style>{`
        .bento-card--border-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: radial-gradient(var(--glow-radius, 200px) circle at var(--glow-x, 50%) var(--glow-y, 50%),
              rgba(var(--bento-glow-color), calc(var(--glow-intensity, 0) * 0.8)) 0%,
              rgba(var(--bento-glow-color), calc(var(--glow-intensity, 0) * 0.4)) 30%,
              transparent 60%);
          border-radius: inherit;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.25s ease;
          z-index: 1;
        }
      `}</style>
                <div
                    ref={cardRef}
                    className={`${className} relative overflow-hidden ${enableBorderGlow ? 'bento-card--border-glow' : ''}`}
                    style={{
                        ...style,
                        position: 'relative',
                        overflow: 'hidden',
                        '--bento-glow-color': glowColor,
                        '--glow-x': '50%',
                        '--glow-y': '50%',
                        '--glow-intensity': '0',
                        '--glow-radius': '200px',
                    } as React.CSSProperties}
                >
                    {children}
                </div>
            </>
        );
    };

const GlobalSpotlight: React.FC<{
    containerRef: React.RefObject<HTMLDivElement | null>;
    disableAnimations?: boolean;
    enabled?: boolean;
    spotlightRadius?: number;
    glowColor?: string;
    pointerThrottle?: 'raf' | 'none';
    cacheBounds?: boolean;
}> = ({
    containerRef,
    disableAnimations = false,
    enabled = true,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR,
    pointerThrottle = 'raf',
    cacheBounds = true,
}) => {
        const spotlightRef = useRef<HTMLDivElement | null>(null);
        const frameRef = useRef<number | null>(null);
        const latestPointRef = useRef<{ x: number; y: number } | null>(null);
        const activeRef = useRef(false);
        const cachedBoundsRef = useRef<CardBoundsEntry[]>([]);
        const boundsDirtyRef = useRef(true);

        useEffect(() => {
            if (disableAnimations || !containerRef.current || !enabled) return;

            const container = containerRef.current;
            const spotlight = document.createElement('div');
            spotlight.className = 'global-spotlight';
            spotlight.style.cssText = `
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 200;
      opacity: 0;
      transform: translate3d(-9999px, -9999px, 0) translate(-50%, -50%);
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.12) 0%,
        rgba(${glowColor}, 0.06) 15%,
        rgba(${glowColor}, 0.03) 25%,
        rgba(${glowColor}, 0.015) 40%,
        transparent 60%
      );
      mix-blend-mode: screen;
      will-change: transform, opacity;
    `;

            document.body.appendChild(spotlight);
            spotlightRef.current = spotlight;

            const resetCardGlow = () => {
                container.querySelectorAll<HTMLElement>('.bento-card--border-glow').forEach((card) => {
                    card.style.setProperty('--glow-intensity', '0');
                });
            };

            const collectCardBounds = (): CardBoundsEntry[] =>
                Array.from(container.querySelectorAll<HTMLElement>('.bento-card--border-glow')).map((element) => ({
                    element,
                    rect: element.getBoundingClientRect(),
                }));

            const getCardBounds = (): CardBoundsEntry[] => {
                if (!cacheBounds) {
                    return collectCardBounds();
                }

                if (boundsDirtyRef.current || cachedBoundsRef.current.length === 0) {
                    cachedBoundsRef.current = collectCardBounds();
                    boundsDirtyRef.current = false;
                }

                return cachedBoundsRef.current;
            };

            const renderSpotlight = (x: number, y: number) => {
                if (!spotlightRef.current || !activeRef.current) return;

                spotlightRef.current.style.opacity = '0.8';
                spotlightRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

                const cardBounds = getCardBounds();
                const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);

                for (const { element, rect } of cardBounds) {
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const distance = Math.hypot(x - centerX, y - centerY) - Math.max(rect.width, rect.height) / 2;
                    const effectiveDistance = Math.max(0, distance);

                    let glowIntensity = 0;
                    if (effectiveDistance <= proximity) {
                        glowIntensity = 1;
                    } else if (effectiveDistance <= fadeDistance) {
                        glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
                    }

                    updateCardGlowProperties(element, rect, x, y, glowIntensity, spotlightRadius);
                }
            };

            const flushFrame = () => {
                frameRef.current = null;
                if (!latestPointRef.current) return;
                renderSpotlight(latestPointRef.current.x, latestPointRef.current.y);
            };

            const scheduleRender = (x: number, y: number) => {
                latestPointRef.current = { x, y };

                if (pointerThrottle === 'none') {
                    renderSpotlight(x, y);
                    return;
                }

                if (frameRef.current === null) {
                    frameRef.current = requestAnimationFrame(flushFrame);
                }
            };

            const markBoundsDirty = () => {
                boundsDirtyRef.current = true;
            };

            const handleMouseEnter = (event: MouseEvent) => {
                activeRef.current = true;
                boundsDirtyRef.current = true;
                scheduleRender(event.clientX, event.clientY);
            };

            const handleMouseMove = (event: MouseEvent) => {
                if (!activeRef.current) return;
                scheduleRender(event.clientX, event.clientY);
            };

            const handleMouseLeave = () => {
                activeRef.current = false;
                latestPointRef.current = null;
                if (frameRef.current !== null) {
                    cancelAnimationFrame(frameRef.current);
                    frameRef.current = null;
                }
                if (spotlightRef.current) {
                    spotlightRef.current.style.opacity = '0';
                }
                resetCardGlow();
            };

            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
            window.addEventListener('resize', markBoundsDirty);
            window.addEventListener('scroll', markBoundsDirty, { passive: true });

            let resizeObserver: ResizeObserver | null = null;
            if (cacheBounds && typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(markBoundsDirty);
                resizeObserver.observe(container);
            }

            return () => {
                activeRef.current = false;
                latestPointRef.current = null;
                boundsDirtyRef.current = true;

                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseLeave);
                window.removeEventListener('resize', markBoundsDirty);
                window.removeEventListener('scroll', markBoundsDirty);

                resizeObserver?.disconnect();

                if (frameRef.current !== null) {
                    cancelAnimationFrame(frameRef.current);
                    frameRef.current = null;
                }

                spotlightRef.current?.remove();
                spotlightRef.current = null;
            };
        }, [cacheBounds, containerRef, disableAnimations, enabled, glowColor, pointerThrottle, spotlightRadius]);

        return null;
    };

const useMobileDetection = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

export const MagicBento: React.FC<BentoProps> = ({
    enableSpotlight = true,
    disableAnimations = false,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR,
    pointerThrottle = 'raf',
    cacheBounds = true,
    children,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMobileDetection();
    const shouldDisableAnimations = disableAnimations || isMobile;

    return (
        <div ref={containerRef} className="relative">
            {enableSpotlight && !shouldDisableAnimations && (
                <GlobalSpotlight
                    containerRef={containerRef}
                    disableAnimations={shouldDisableAnimations}
                    enabled={enableSpotlight}
                    spotlightRadius={spotlightRadius}
                    glowColor={glowColor}
                    pointerThrottle={pointerThrottle}
                    cacheBounds={cacheBounds}
                />
            )}
            {children}
        </div>
    );
};

export default MagicBento;
