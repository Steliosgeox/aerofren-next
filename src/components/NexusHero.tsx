"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import LiquidButton from "./LiquidButton";
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import { debounce } from "@/lib/debounce";
import { getDynamicViewportHeight } from "@/lib/viewport";
import { getDeviceInfo } from "./nexus-hero/device";
import { createPresets } from "./nexus-hero/theme-presets";
import { vertexShader, createFragmentShader } from "./nexus-hero/shader";

/**
 * NexusHero - Premium Three.js Metaballs Hero Section
 *
 * Based on the Nexus metaballs effect, customized for AEROFREN.
 * Features:
 * - Ray-marched metaballs with smooth blending
 * - Theme-aware color presets (dark/light/dim)
 * - Interactive cursor tracking
 * - Mobile-optimized performance (compile-time shader branching)
 * - Greek language content for water/air systems
 *
 * Extracted modules:
 * - nexus-hero/device.ts: Device detection
 * - nexus-hero/theme-presets.ts: Theme color presets
 * - nexus-hero/shader.ts: GLSL vertex/fragment shaders
 */
// ============================================
// MAIN COMPONENT
// ============================================
export default function NexusHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const clockRef = useRef<THREE.Clock | null>(null);
    const animationFrameRef = useRef<number>(0);
    const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
    const cursorSphere3DRef = useRef(new THREE.Vector3(0, 0, 0));
    const targetMousePositionRef = useRef(new THREE.Vector2(0.5, 0.5));
    const mousePositionRef = useRef(new THREE.Vector2(0.5, 0.5));
    const cachedRectRef = useRef<DOMRect | null>(null);
    const tempVector3Ref = useRef(new THREE.Vector3(0, 0, 0)); // Reusable vector

    const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "dim">("dark");
    const [isLoaded, setIsLoaded] = useState(false);
    const isVisibleRef = useRef(true);
    const fadeProgressRef = useRef(0); // 0 = fully visible, 1 = fully faded
    const animateRef = useRef<(() => void) | null>(null); // Store animate function for restart

    // Watch for theme changes
    useEffect(() => {
        const checkTheme = () => {
            const html = document.documentElement;
            const theme = html.getAttribute("data-theme") as "dark" | "light" | "dim" || "dark";
            setCurrentTheme(theme);
        };

        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        return () => observer.disconnect();
    }, []);

    // Visibility detection - THROTTLE (not stop) WebGL when scrolled away
    // Keeps GPU "warm" to avoid cold-start stutter when scrolling back
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                isVisibleRef.current = entries[0]?.isIntersecting ?? true;
                // Animation loop keeps running but throttles when not visible
            },
            { threshold: 0.05 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Convert screen to world coordinates - reuses vector to avoid GC
    const getViewportMetrics = useCallback(() => {
        const width =
            containerRef.current?.clientWidth || window.innerWidth;
        const height =
            containerRef.current?.clientHeight || getDynamicViewportHeight();

        return {
            width: Math.max(1, width),
            height: Math.max(1, height),
        };
    }, []);

    const screenToWorldJS = useCallback((normalizedX: number, normalizedY: number) => {
        const uvX = normalizedX * 2.0 - 1.0;
        const uvY = normalizedY * 2.0 - 1.0;
        const { width, height } =
            typeof window !== "undefined"
                ? getViewportMetrics()
                : { width: 1, height: 1 };
        const aspect = width / height;
        tempVector3Ref.current.set(uvX * aspect * 2.0, uvY * 2.0, 0.0);
        return tempVector3Ref.current;
    }, [getViewportMetrics]);

    // Handle pointer movement - uses CACHED rect to avoid layout thrashing
    const handlePointerMove = useCallback((clientX: number, clientY: number) => {
        if (typeof window === "undefined") return;

        // Use cached rect - updated only on resize, NOT every mouse move
        const rect = cachedRectRef.current;
        if (!rect) return;

        // Calculate position relative to the canvas container
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;

        // Normalize to 0-1 range, with Y flipped for WebGL coordinates
        targetMousePositionRef.current.x = relativeX / rect.width;
        targetMousePositionRef.current.y = 1.0 - (relativeY / rect.height);

        const worldPos = screenToWorldJS(
            targetMousePositionRef.current.x,
            targetMousePositionRef.current.y
        );
        cursorSphere3DRef.current.copy(worldPos);

        if (materialRef.current) {
            materialRef.current.uniforms.uCursorSphere.value.copy(cursorSphere3DRef.current);
        }
    }, [screenToWorldJS]);

    // Apply theme preset
    const applyPreset = useCallback((theme: "dark" | "light" | "dim") => {
        if (!materialRef.current) return;

        const device = getDeviceInfo();
        const presets = createPresets(device.isMobile);
        const preset = presets[theme];

        const uniforms = materialRef.current.uniforms;
        uniforms.uSphereCount.value = preset.sphereCount;
        uniforms.uAmbientIntensity.value = preset.ambientIntensity;
        uniforms.uDiffuseIntensity.value = preset.diffuseIntensity;
        uniforms.uSpecularIntensity.value = preset.specularIntensity;
        uniforms.uSpecularPower.value = preset.specularPower;
        uniforms.uFresnelPower.value = preset.fresnelPower;
        uniforms.uBackgroundColor.value = preset.backgroundColor;
        uniforms.uSphereColor.value = preset.sphereColor;
        uniforms.uLightColor.value = preset.lightColor;
        uniforms.uLightPosition.value = preset.lightPosition;
        uniforms.uSmoothness.value = preset.smoothness;
        uniforms.uContrast.value = preset.contrast;
        uniforms.uFogDensity.value = preset.fogDensity;
        uniforms.uCursorGlowIntensity.value = preset.cursorGlowIntensity;
        uniforms.uCursorGlowRadius.value = preset.cursorGlowRadius;
        uniforms.uCursorGlowColor.value = preset.cursorGlowColor;
    }, []);

    // Update theme when it changes
    useEffect(() => {
        applyPreset(currentTheme);
    }, [currentTheme, applyPreset]);

    // Initialize Three.js
    useEffect(() => {
        if (!containerRef.current || typeof window === "undefined") return;

        const device = getDeviceInfo();
        const presets = createPresets(device.isMobile);
        const themeFromDom = (document.documentElement.getAttribute("data-theme") as "dark" | "light" | "dim") || "dark";
        const initialPreset = presets[themeFromDom];
        let loadedRevealTimeout: ReturnType<typeof setTimeout> | null = null;

        // Create scene
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        clockRef.current = new THREE.Clock();

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: !device.isMobile && !device.isLowPower,
            alpha: true,
            powerPreference: device.isMobile ? "default" : "high-performance",
            preserveDrawingBuffer: false,
            premultipliedAlpha: false,
        });

        const { width, height } = getViewportMetrics();

        // Clamp ACTUAL render resolution to prevent excessive GPU load
        // This is the max pixels the shader will process (after pixelRatio)
        // Reduced for 4K support: 1.3M max = ~1480x880 effective resolution
        const MAX_RENDER_PIXELS = device.isMobile ? 1280 * 720 : 1440 * 900; // ~920K mobile, ~1.3M desktop
        const RENDER_SCALE = device.isMobile ? 0.65 : (device.isLowPower ? 0.7 : 0.75);

        const getRenderMetrics = (viewportWidth: number, viewportHeight: number) => {
            const dpr = window.devicePixelRatio || 1;

            // Calculate what actual pixels would be at full resolution
            const fullWidth = viewportWidth * dpr;
            const fullHeight = viewportHeight * dpr;
            const fullPixels = fullWidth * fullHeight;

            // Scale down if exceeding max pixels (preserves aspect ratio)
            let scale = RENDER_SCALE;
            if (fullPixels * scale * scale > MAX_RENDER_PIXELS) {
                scale = Math.sqrt(MAX_RENDER_PIXELS / fullPixels);
            }

            const renderWidth = Math.max(1, Math.round(viewportWidth * scale));
            const renderHeight = Math.max(1, Math.round(viewportHeight * scale));
            const actualWidth = Math.round(renderWidth * dpr);
            const actualHeight = Math.round(renderHeight * dpr);

            return { renderWidth, renderHeight, actualWidth, actualHeight, pixelRatio: dpr };
        };

        const applyRenderSize = (viewportWidth: number, viewportHeight: number) => {
            const { renderWidth, renderHeight, actualWidth, actualHeight, pixelRatio } = getRenderMetrics(viewportWidth, viewportHeight);

            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(renderWidth, renderHeight, false);

            if (materialRef.current) {
                materialRef.current.uniforms.uResolution.value.set(renderWidth, renderHeight);
                materialRef.current.uniforms.uActualResolution.value.set(actualWidth, actualHeight);
                materialRef.current.uniforms.uPixelRatio.value = pixelRatio;
            }
        };

        const { renderWidth: initialRenderWidth, renderHeight: initialRenderHeight, actualWidth, actualHeight, pixelRatio } = getRenderMetrics(width, height);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(initialRenderWidth, initialRenderHeight, false);
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        containerRef.current.appendChild(renderer.domElement);
        canvasRef.current = renderer.domElement;
        rendererRef.current = renderer;

        // Create material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(initialRenderWidth, initialRenderHeight) },
                uActualResolution: { value: new THREE.Vector2(actualWidth, actualHeight) },
                uPixelRatio: { value: pixelRatio },
                uMousePosition: { value: new THREE.Vector2(0.5, 0.5) },
                uCursorSphere: { value: new THREE.Vector3(0, 0, 0) },
                uCursorRadius: { value: 0.22 }, // Between 0.20-0.25
                uSphereCount: { value: initialPreset.sphereCount },
                // Ball radii - mobile removes bottom-left corner entirely for cleaner look
                uFixedTopLeftRadius: { value: 0.90 },
                uFixedBottomRightRadius: { value: 0.90 },
                uFixedBottomLeftRadius: { value: device.isMobile ? 0 : 0.85 }, // Hidden on mobile
                uSmallTopLeftRadius: { value: 0.30 },
                uSmallBottomRightRadius: { value: 0.35 },
                uSmallBottomLeftRadius: { value: device.isMobile ? 0 : 0.28 }, // Hidden on mobile
                uMergeDistance: { value: 1.5 },
                uSmoothness: { value: initialPreset.smoothness },
                uAmbientIntensity: { value: initialPreset.ambientIntensity },
                uDiffuseIntensity: { value: initialPreset.diffuseIntensity },
                uSpecularIntensity: { value: initialPreset.specularIntensity },
                uSpecularPower: { value: initialPreset.specularPower },
                uFresnelPower: { value: initialPreset.fresnelPower },
                uBackgroundColor: { value: initialPreset.backgroundColor },
                uSphereColor: { value: initialPreset.sphereColor },
                uLightColor: { value: initialPreset.lightColor },
                uLightPosition: { value: initialPreset.lightPosition },
                uContrast: { value: initialPreset.contrast },
                uFogDensity: { value: initialPreset.fogDensity },
                uAnimationSpeed: { value: 1.3 },
                uMovementScale: { value: 2.0 },
                uMouseProximityEffect: { value: true },
                uMinMovementScale: { value: 1.0 },
                uMaxMovementScale: { value: 2.0 },
                uCursorGlowIntensity: { value: initialPreset.cursorGlowIntensity },
                uCursorGlowRadius: { value: initialPreset.cursorGlowRadius },
                uCursorGlowColor: { value: initialPreset.cursorGlowColor },
                // AO, shadows, and device flags are now compile-time (#define)
                // Restore uShadowStrength/uAOStrength uniforms here if re-enabling those features
            },
            vertexShader,
            fragmentShader: createFragmentShader(device.isLowPower, device.isMobile, device.isSafari),
            transparent: true,
        });

        materialRef.current = material;

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Track if component is mounted for animation loop
        let isMounted = true;
        let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

        // Animation loop - THROTTLES based on fade opacity (not just intersection)
        // This prevents GPU from rendering invisible pixels at 60fps
        const animate = () => {
            if (!isMounted) return;
            if (!clockRef.current || !materialRef.current || !rendererRef.current) return;

            // Skip render when scrolled out of viewport (visibility observer at line 486)
            // 500ms heartbeat keeps GPU "warm" to avoid cold-start stutter on scroll-back
            if (!isVisibleRef.current) {
                throttleTimeout = setTimeout(animate, 500);
                return;
            }

            const fadeProgress = fadeProgressRef.current;

            // SKIP RENDER entirely when fully faded (>95% progress)
            // Just schedule next check at low frequency
            if (fadeProgress > 0.95) {
                throttleTimeout = setTimeout(animate, 500); // 2fps heartbeat
                return;
            }

            // Smooth mouse movement (0.20 smoothness factor)
            mousePositionRef.current.x += (targetMousePositionRef.current.x - mousePositionRef.current.x) * 0.20;
            mousePositionRef.current.y += (targetMousePositionRef.current.y - mousePositionRef.current.y) * 0.20;

            materialRef.current.uniforms.uTime.value = clockRef.current.getElapsedTime();
            materialRef.current.uniforms.uMousePosition.value = mousePositionRef.current;

            rendererRef.current.render(scene, camera);

            // Throttle based on fade progress:
            // 0-50% faded: full 60fps
            // 50-95% faded: throttled (lower fps as more faded)
            // 95%+: skip render entirely (handled above)
            if (fadeProgress < 0.5) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                // Interpolate delay: 50% faded = 33ms (30fps), 95% faded = 200ms (5fps)
                const delay = Math.round(33 + (fadeProgress - 0.5) * 370);
                throttleTimeout = setTimeout(animate, delay);
            }
        };

        // Store animate function for reference
        animateRef.current = animate;

        // Event handlers
        const handleMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleResize = () => {
            const { width: viewportWidth, height: viewportHeight } = getViewportMetrics();
            applyRenderSize(viewportWidth, viewportHeight);

            // Update cached rect for mouse position calculations
            if (containerRef.current) {
                cachedRectRef.current = containerRef.current.getBoundingClientRect();
            }
        };

        // Debounce resize handler (100ms) to prevent layout thrashing
        const debouncedResize = debounce(handleResize, 100);

        // Add event listeners
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("resize", debouncedResize, { passive: true });
        window.visualViewport?.addEventListener?.("resize", debouncedResize, {
            passive: true,
        });

        // Initialize cached rect for mouse calculations
        cachedRectRef.current = containerRef.current.getBoundingClientRect();

        // Initialize cursor position
        const { width: viewportWidth, height: viewportHeight } = getViewportMetrics();
        handlePointerMove(viewportWidth / 2, viewportHeight / 2);

        // Start animation
        loadedRevealTimeout = setTimeout(() => setIsLoaded(true), 0);
        animate();

        // Add GSAP ScrollTrigger for canvas fade-out
        // This allows the ScrollFrameAnimation beneath to show through
        // ALSO tracks progress to throttle WebGL when faded
        const fadeAnimation = gsap.fromTo(containerRef.current,
            { opacity: 1 },
            {
                opacity: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "+=30vh", // Fade over 30vh of scroll
                    scrub: 0.2,
                    onUpdate: (self) => {
                        fadeProgressRef.current = self.progress;
                    },
                },
            }
        );
        scrollTriggerRef.current = fadeAnimation.scrollTrigger as ScrollTrigger;

        // Cleanup - CRITICAL: Must be synchronous and thorough
        return () => {
            // FIRST: Stop animation loop immediately
            isMounted = false;
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = 0;
            if (throttleTimeout) clearTimeout(throttleTimeout);

            // SECOND: Remove all event listeners and cancel debounced handler
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            debouncedResize?.cancel?.();
            window.removeEventListener("resize", debouncedResize);
            window.visualViewport?.removeEventListener?.("resize", debouncedResize);

            // THIRD: Kill ScrollTrigger BEFORE disposing renderer
            if (scrollTriggerRef.current) {
                scrollTriggerRef.current.kill();
                scrollTriggerRef.current = null;
            }

            // FOURTH: Dispose Three.js resources synchronously
            if (materialRef.current) {
                materialRef.current.dispose();
                materialRef.current = null;
            }

            geometry.dispose();

            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                const canvas = rendererRef.current.domElement;
                if (canvas && canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
                rendererRef.current = null;
            }

            // FIFTH: Clear refs
            canvasRef.current = null;
            clockRef.current = null;
            animateRef.current = null;

            if (loadedRevealTimeout) {
                clearTimeout(loadedRevealTimeout);
                loadedRevealTimeout = null;
            }
        };
    }, [getViewportMetrics, handlePointerMove]);

    return (
        <section className="nexus-hero">
            {/* Three.js Canvas Container */}
            <div ref={containerRef} className="nexus-hero__canvas" />

            {/* Noise Texture Overlay */}
            <div className="nexus-hero__noise" />

            {/* Content Overlay */}
            <div className={`nexus-hero__content ${isLoaded ? "nexus-hero__content--visible" : ""}`}>
                {/* Eyebrow */}
                <span className="nexus-hero__eyebrow">AEROFREN</span>

                {/* Main Headline */}
                <h1 className="nexus-hero__headline">
                    Εκεί που το νερό<br />
                    γίνεται <span className="nexus-hero__headline--accent">Εξέλιξη</span>
                </h1>

                {/* Description */}
                <p className="nexus-hero__description">
                    Συστήματα αέρος και εξοπλισμός επεξεργασίας νερού για επαγγελματίες, με 45+ χρόνια εμπειρίας.
                </p>

                {/* Tagline */}
                <p className="nexus-hero__tagline">
                    Η ποιότητα ξεκινά από τη σωστή εγκατάσταση.
                </p>

                {/* CTA */}
                <div className="nexus-hero__cta">
                    <LiquidButton text="Δείτε τα προϊόντα" href="/products" />
                </div>
            </div>

            {/* Bottom Info - Hidden on mobile to prevent overlap */}
            <div className={`nexus-hero__info ${isLoaded ? "nexus-hero__info--visible" : ""}`}>
                <div className="nexus-hero__info-left">
                    <span className="nexus-hero__info-label">Έδρα</span>
                    <span className="nexus-hero__info-value">Μοσχάτο Αττικής</span>
                </div>
                <div className="nexus-hero__info-right">
                    <span className="nexus-hero__info-label">Τεχνική κατεύθυνση</span>
                    <span className="nexus-hero__info-value">και λύσεις εφαρμογής</span>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className={`nexus-hero__scroll ${isLoaded ? "nexus-hero__scroll--visible" : ""}`}>
                <div className="nexus-hero__scroll-line" />
                <span className="nexus-hero__scroll-text">Κύλιση</span>
            </div>

            <style jsx>{`
                .nexus-hero {
                    position: relative;
                    z-index: 1; /* Above ScrollFrameAnimation (z-index: 0) */
                    width: 100%;
                    min-height: 100vh;
                    min-height: 100dvh;
                    min-height: var(--app-viewport-height, 100dvh);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow-x: clip;
                    overflow-y: visible; /* Preserve the LiquidButton blob reveal without leaking page width */
                    background: transparent; /* Let ScrollFrameAnimation show through */
                }

                .nexus-hero__canvas {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    will-change: opacity;
                    transform: translateZ(0); /* GPU acceleration */
                }

                .nexus-hero__canvas :global(canvas) {
                    width: 100% !important;
                    height: 100% !important;
                    display: block;
                }

                .nexus-hero__noise {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    opacity: 0.03;
                    pointer-events: none;
                }

                .nexus-hero__content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    max-width: 900px;
                    padding: 0 24px;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 1s ease, transform 1s ease;
                    transition-delay: 0.5s;
                }

                .nexus-hero__content--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .nexus-hero__eyebrow {
                    display: inline-block;
                    font-size: clamp(16px, 2.5vw, 20px);
                    font-weight: 800;
                    letter-spacing: 0.3em;
                    color: var(--theme-accent, #5cb8ff);
                    text-transform: uppercase;
                    margin-bottom: 24px;
                    position: relative;
                    padding-bottom: 12px;
                }

                .nexus-hero__eyebrow::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--theme-accent, #5cb8ff), transparent);
                }

                .nexus-hero__headline {
                    font-family: var(--font-sans);
                    font-size: clamp(2.5rem, 7vw, 5rem);
                    font-weight: 800;
                    line-height: 1.05;
                    letter-spacing: -0.03em;
                    color: var(--theme-text, #ffffff);
                    margin: 0 0 24px 0;
                    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
                }

                .nexus-hero__headline--accent {
                    background: linear-gradient(135deg, var(--theme-accent, #5cb8ff), var(--theme-accent-hover, #00bae2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .nexus-hero__description {
                    font-size: clamp(1rem, 2vw, 1.25rem);
                    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
                    line-height: 1.6;
                    max-width: 600px;
                    margin: 0 auto 16px;
                }

                .nexus-hero__tagline {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--theme-accent, #5cb8ff);
                    letter-spacing: 0.05em;
                    margin: 0 0 32px;
                    opacity: 0.9;
                }

                .nexus-hero__cta {
                    display: flex;
                    justify-content: center;
                    overflow: visible;
                    position: relative;
                    z-index: 11;
                }

                /* Bottom Info */
                .nexus-hero__info {
                    position: absolute;
                    bottom: 48px;
                    left: 48px;
                    right: 48px;
                    display: flex;
                    justify-content: space-between;
                    z-index: 10;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                    transition-delay: 1s;
                }

                .nexus-hero__info--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .nexus-hero__info-left,
                .nexus-hero__info-right {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .nexus-hero__info-right {
                    text-align: right;
                }

                .nexus-hero__info-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
                }

                .nexus-hero__info-value {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--theme-text, #ffffff);
                    opacity: 0.8;
                }

                /* Scroll Indicator */
                .nexus-hero__scroll {
                    position: absolute;
                    bottom: 48px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.8s ease;
                    transition-delay: 1.5s;
                }

                .nexus-hero__scroll--visible {
                    opacity: 0.6;
                }

                .nexus-hero__scroll-line {
                    width: 1px;
                    height: 40px;
                    background: linear-gradient(to bottom, var(--theme-accent, #5cb8ff), transparent);
                    animation: scroll-pulse 2s ease-in-out infinite;
                }

                @keyframes scroll-pulse {
                    0%, 100% { opacity: 0.3; height: 30px; }
                    50% { opacity: 1; height: 50px; }
                }

                .nexus-hero__scroll-text {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
                }

                /* Light theme - no background, canvas handles it */
                :global([data-theme="light"]) .nexus-hero {
                    /* No background */
                }

                :global([data-theme="light"]) .nexus-hero__headline {
                    color: #0a1628;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                :global([data-theme="light"]) .nexus-hero__description {
                    color: rgba(10, 22, 40, 0.7);
                }

                :global([data-theme="light"]) .nexus-hero__info-label {
                    color: rgba(10, 22, 40, 0.5);
                }

                :global([data-theme="light"]) .nexus-hero__info-value {
                    color: #0a1628;
                }

                :global([data-theme="light"]) .nexus-hero__scroll-text {
                    color: rgba(10, 22, 40, 0.5);
                }

                :global([data-theme="dim"]) .nexus-hero {
                    /* No background */
                }

                :global([data-theme="dim"]) .nexus-hero__eyebrow {
                    color: #9f7aea;
                }

                :global([data-theme="dim"]) .nexus-hero__headline--accent {
                    background: linear-gradient(135deg, #9f7aea, #b794f4);
                    -webkit-background-clip: text;
                    background-clip: text;
                }

                :global([data-theme="dim"]) .nexus-hero__tagline {
                    color: #9f7aea;
                }

                :global([data-theme="dim"]) .nexus-hero__eyebrow::after {
                    background: linear-gradient(90deg, transparent, #9f7aea, transparent);
                }

                :global([data-theme="dim"]) .nexus-hero__scroll-line {
                    background: linear-gradient(to bottom, #9f7aea, transparent);
                }

                /* Responsive - Tablet */
                @media (max-width: 768px) {
                    .nexus-hero__content {
                        padding: 0 20px;
                        padding-bottom: 140px; /* Space for bottom elements */
                    }

                    .nexus-hero__headline {
                        font-size: clamp(1.75rem, 7vw, 2.5rem);
                        margin-bottom: 16px;
                    }

                    .nexus-hero__description {
                        font-size: clamp(0.875rem, 3.5vw, 1rem);
                        margin-bottom: 12px;
                    }

                    .nexus-hero__tagline {
                        font-size: 12px;
                        margin-bottom: 24px;
                    }

                    .nexus-hero__info {
                        display: none; /* Hide on mobile to prevent overlap */
                    }

                    .nexus-hero__scroll {
                        bottom: 20px;
                    }

                    .nexus-hero__eyebrow {
                        font-size: clamp(14px, 3vw, 16px);
                        margin-bottom: 16px;
                    }
                }

                /* Responsive - Small phones */
                @media (max-width: 480px) {
                    .nexus-hero__content {
                        padding: 0 16px;
                        padding-bottom: 100px;
                    }

                    .nexus-hero__headline {
                        font-size: clamp(1.5rem, 8vw, 2rem);
                        line-height: 1.1;
                    }

                    .nexus-hero__description {
                        font-size: 0.875rem;
                    }

                    .nexus-hero__tagline {
                        font-size: 11px;
                        margin-bottom: 20px;
                    }

                    .nexus-hero__scroll {
                        bottom: 16px;
                    }

                    .nexus-hero__scroll-line {
                        height: 30px;
                    }
                }

                /* Reduced Motion */
                @media (prefers-reduced-motion: reduce) {
                    .nexus-hero__content,
                    .nexus-hero__info,
                    .nexus-hero__scroll {
                        transition: none;
                        opacity: 1;
                        transform: none;
                    }

                    .nexus-hero__scroll-line {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}
