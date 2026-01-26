"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import LiquidButton from "./LiquidButton";
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import { debounce } from "@/lib/debounce";

/**
 * NexusHero - Premium Three.js Metaballs Hero Section
 *
 * Based on the Nexus metaballs effect, customized for AEROFREN.
 * Features:
 * - Ray-marched metaballs with smooth blending
 * - Theme-aware color presets (dark/light/dim)
 * - Interactive cursor tracking
 * - Mobile-optimized performance
 * - Greek language content for water/air systems
 */

// ============================================
// DEVICE DETECTION
// ============================================
const getDeviceInfo = () => {
    if (typeof window === "undefined") {
        return { isMobile: false, isSafari: false, isLowPower: false, pixelRatio: 1 };
    }
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isLowPower = isMobile || Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    return { isMobile, isSafari, isLowPower, pixelRatio };
};

// ============================================
// THEME PRESETS - Maps to AEROFREN themes
// ============================================
interface ThemePreset {
    sphereCount: number;
    ambientIntensity: number;
    diffuseIntensity: number;
    specularIntensity: number;
    specularPower: number;
    fresnelPower: number;
    backgroundColor: THREE.Color;
    sphereColor: THREE.Color;
    lightColor: THREE.Color;
    lightPosition: THREE.Vector3;
    smoothness: number;
    contrast: number;
    fogDensity: number;
    cursorGlowIntensity: number;
    cursorGlowRadius: number;
    cursorGlowColor: THREE.Color;
}

const createPresets = (isMobile: boolean): Record<string, ThemePreset> => ({
    // DARK THEME - Deep blue industrial water aesthetic (Holographic style)
    dark: {
        sphereCount: isMobile ? 3 : 4,
        ambientIntensity: 0.10,
        diffuseIntensity: 1.0,
        specularIntensity: 0.65,
        specularPower: 1,
        fresnelPower: 1.0,
        backgroundColor: new THREE.Color(0x06101f), // AEROFREN dark bg
        sphereColor: new THREE.Color(0x0a1628),
        lightColor: new THREE.Color(0x5cb8ff), // AEROFREN accent blue
        lightPosition: new THREE.Vector3(0.8, 1, 0.8),
        smoothness: 0.8,
        contrast: 2.0,
        fogDensity: 0.1,
        cursorGlowIntensity: 0.6,
        cursorGlowRadius: 1.4,
        cursorGlowColor: new THREE.Color(0x00bae2), // AEROFREN cyan
    },
    // LIGHT THEME - Clean water, bright and professional (Holographic style)
    light: {
        sphereCount: isMobile ? 3 : 4,
        ambientIntensity: 0.10,
        diffuseIntensity: 1.0,
        specularIntensity: 0.65,
        specularPower: 1,
        fresnelPower: 1.0,
        backgroundColor: new THREE.Color(0xe8f4fc),
        sphereColor: new THREE.Color(0xd0e8f7),
        lightColor: new THREE.Color(0x0066cc),
        lightPosition: new THREE.Vector3(1, 0.8, 1),
        smoothness: 0.8,
        contrast: 2.0,
        fogDensity: 0.06,
        cursorGlowIntensity: 0.4,
        cursorGlowRadius: 1.2,
        cursorGlowColor: new THREE.Color(0x0066cc),
    },
    // DIM THEME - Purple accent, moody industrial
    dim: {
        sphereCount: isMobile ? 3 : 4,
        ambientIntensity: 0.10,
        diffuseIntensity: 1.0,
        specularIntensity: 0.65,
        specularPower: 1,
        fresnelPower: 1.0,
        backgroundColor: new THREE.Color(0x15202b),
        sphereColor: new THREE.Color(0x192734),
        lightColor: new THREE.Color(0x9f7aea), // Purple accent
        lightPosition: new THREE.Vector3(0.7, 1.2, 0.7),
        smoothness: 0.8,
        contrast: 2.0,
        fogDensity: 0.08,
        cursorGlowIntensity: 0.7,
        cursorGlowRadius: 1.5,
        cursorGlowColor: new THREE.Color(0x9f7aea), // Purple glow
    },
});

// ============================================
// SHADER CODE
// ============================================
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const createFragmentShader = (isLowPower: boolean, isMobile: boolean, isSafari: boolean) => `
    ${isLowPower || isMobile || isSafari ? "precision mediump float;" : "precision highp float;"}

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uActualResolution;
    uniform float uPixelRatio;
    uniform vec2 uMousePosition;
    uniform vec3 uCursorSphere;
    uniform float uCursorRadius;
    uniform int uSphereCount;
    uniform float uFixedTopLeftRadius;
    uniform float uFixedBottomRightRadius;
    uniform float uFixedBottomLeftRadius;
    uniform float uSmallTopLeftRadius;
    uniform float uSmallBottomRightRadius;
    uniform float uSmallBottomLeftRadius;
    uniform float uMergeDistance;
    uniform float uSmoothness;
    uniform float uAmbientIntensity;
    uniform float uDiffuseIntensity;
    uniform float uSpecularIntensity;
    uniform float uSpecularPower;
    uniform float uFresnelPower;
    uniform vec3 uBackgroundColor;
    uniform vec3 uSphereColor;
    uniform vec3 uLightColor;
    uniform vec3 uLightPosition;
    uniform float uContrast;
    uniform float uFogDensity;
    uniform float uAnimationSpeed;
    uniform float uMovementScale;
    uniform bool uMouseProximityEffect;
    uniform float uMinMovementScale;
    uniform float uMaxMovementScale;
    uniform float uCursorGlowIntensity;
    uniform float uCursorGlowRadius;
    uniform vec3 uCursorGlowColor;
    uniform float uShadowStrength;
    uniform float uAOStrength;
    uniform float uIsSafari;
    uniform float uIsMobile;
    uniform float uIsLowPower;

    varying vec2 vUv;

    const float PI = 3.14159265359;
    const float EPSILON = 0.001;
    const float MAX_DIST = 100.0;

    float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * k * 0.25;
    }

    float sdSphere(vec3 p, float r) {
        return length(p) - r;
    }

    vec3 screenToWorld(vec2 normalizedPos) {
        vec2 uv = normalizedPos * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;
        return vec3(uv * 2.0, 0.0);
    }

    float getDistanceToCenter(vec2 pos) {
        float dist = length(pos - vec2(0.5, 0.5)) * 2.0;
        return smoothstep(0.0, 1.0, dist);
    }

    float sceneSDF(vec3 pos) {
        float result = MAX_DIST;

        // Top-left group
        vec3 topLeftPos = screenToWorld(vec2(0.08, 0.92));
        float topLeft = sdSphere(pos - topLeftPos, uFixedTopLeftRadius);

        vec3 smallTopLeftPos = screenToWorld(vec2(0.25, 0.72));
        float smallTopLeft = sdSphere(pos - smallTopLeftPos, uSmallTopLeftRadius);

        // Bottom-right group
        vec3 bottomRightPos = screenToWorld(vec2(0.92, 0.08));
        float bottomRight = sdSphere(pos - bottomRightPos, uFixedBottomRightRadius);

        vec3 smallBottomRightPos = screenToWorld(vec2(0.72, 0.25));
        float smallBottomRight = sdSphere(pos - smallBottomRightPos, uSmallBottomRightRadius);

        // Bottom-left group
        vec3 bottomLeftPos = screenToWorld(vec2(0.08, 0.08));
        float bottomLeft = sdSphere(pos - bottomLeftPos, uFixedBottomLeftRadius);

        vec3 smallBottomLeftPos = screenToWorld(vec2(0.28, 0.25));
        float smallBottomLeft = sdSphere(pos - smallBottomLeftPos, uSmallBottomLeftRadius);

        float t = uTime * uAnimationSpeed;

        float dynamicMovementScale = uMovementScale;
        if (uMouseProximityEffect) {
            float distToCenter = getDistanceToCenter(uMousePosition);
            float mixFactor = smoothstep(0.0, 1.0, distToCenter);
            dynamicMovementScale = mix(uMinMovementScale, uMaxMovementScale, mixFactor);
        }

        int maxIter = uIsMobile > 0.5 ? 4 : (uIsLowPower > 0.5 ? 6 : min(uSphereCount, 10));
        for (int i = 0; i < 10; i++) {
            if (i >= uSphereCount || i >= maxIter) break;

            float fi = float(i);
            float speed = 0.4 + fi * 0.12;
            float radius = 0.12 + mod(fi, 3.0) * 0.06;
            float orbitRadius = (0.3 + mod(fi, 3.0) * 0.15) * dynamicMovementScale;
            float phaseOffset = fi * PI * 0.35;

            float distToCursor = length(vec3(0.0) - uCursorSphere);
            float proximityScale = 1.0 + (1.0 - smoothstep(0.0, 1.0, distToCursor)) * 0.5;
            orbitRadius *= proximityScale;

            vec3 offset;
            if (i == 0) {
                offset = vec3(
                    sin(t * speed) * orbitRadius * 0.7,
                    sin(t * 0.5) * orbitRadius,
                    cos(t * speed * 0.7) * orbitRadius * 0.5
                );
            } else if (i == 1) {
                offset = vec3(
                    sin(t * speed + PI) * orbitRadius * 0.5,
                    -sin(t * 0.5) * orbitRadius,
                    cos(t * speed * 0.7 + PI) * orbitRadius * 0.5
                );
            } else {
                offset = vec3(
                    sin(t * speed + phaseOffset) * orbitRadius * 0.8,
                    cos(t * speed * 0.85 + phaseOffset * 1.3) * orbitRadius * 0.6,
                    sin(t * speed * 0.5 + phaseOffset) * 0.3
                );
            }

            vec3 toCursor = uCursorSphere - offset;
            float cursorDist = length(toCursor);
            if (cursorDist < uMergeDistance && cursorDist > 0.0) {
                float attraction = (1.0 - cursorDist / uMergeDistance) * 0.3;
                offset += normalize(toCursor) * attraction;
            }

            float movingSphere = sdSphere(pos - offset, radius);

            float blend = 0.05;
            if (cursorDist < uMergeDistance) {
                float influence = 1.0 - (cursorDist / uMergeDistance);
                blend = mix(0.05, uSmoothness, influence * influence * influence);
            }

            result = smin(result, movingSphere, blend);
        }

        float cursorBall = sdSphere(pos - uCursorSphere, uCursorRadius);

        float topLeftGroup = smin(topLeft, smallTopLeft, 0.4);
        float bottomRightGroup = smin(bottomRight, smallBottomRight, 0.4);
        float bottomLeftGroup = smin(bottomLeft, smallBottomLeft, 0.4);

        result = smin(result, topLeftGroup, 0.3);
        result = smin(result, bottomRightGroup, 0.3);
        result = smin(result, bottomLeftGroup, 0.3);
        result = smin(result, cursorBall, uSmoothness);

        return result;
    }

    vec3 calcNormal(vec3 p) {
        float eps = uIsLowPower > 0.5 ? 0.002 : 0.001;
        return normalize(vec3(
            sceneSDF(p + vec3(eps, 0, 0)) - sceneSDF(p - vec3(eps, 0, 0)),
            sceneSDF(p + vec3(0, eps, 0)) - sceneSDF(p - vec3(0, eps, 0)),
            sceneSDF(p + vec3(0, 0, eps)) - sceneSDF(p - vec3(0, 0, eps))
        ));
    }

    float ambientOcclusion(vec3 p, vec3 n) {
        if (uIsLowPower > 0.5) {
            float h1 = sceneSDF(p + n * 0.03);
            float h2 = sceneSDF(p + n * 0.06);
            float occ = (0.03 - h1) + (0.06 - h2) * 0.5;
            return clamp(1.0 - occ * 2.0, 0.0, 1.0);
        } else {
            float occ = 0.0;
            float weight = 1.0;
            for (int i = 0; i < 3; i++) {
                float dist = 0.01 + 0.015 * float(i * i);
                float h = sceneSDF(p + n * dist);
                occ += (dist - h) * weight;
                weight *= 0.85;
            }
            return clamp(1.0 - occ, 0.0, 1.0);
        }
    }

    float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
        if (uShadowStrength <= 0.0) {
            return 1.0;
        }
        if (uIsLowPower > 0.5) {
            float result = 1.0;
            float t = mint;
            for (int i = 0; i < 3; i++) {
                t += 0.3;
                if (t >= maxt) break;
                float h = sceneSDF(ro + rd * t);
                if (h < EPSILON) return 0.0;
                result = min(result, k * h / t);
            }
            return result;
        } else {
            float result = 1.0;
            float t = mint;
            for (int i = 0; i < 8; i++) {
                if (t >= maxt) break;
                float h = sceneSDF(ro + rd * t);
                if (h < EPSILON) return 0.0;
                result = min(result, k * h / t);
                t += h;
            }
            return result;
        }
    }

    float rayMarch(vec3 ro, vec3 rd) {
        float t = 0.0;
        int maxSteps = uIsMobile > 0.5 ? 10 : (uIsSafari > 0.5 ? 14 : 24);

        for (int i = 0; i < 24; i++) {
            if (i >= maxSteps) break;

            vec3 p = ro + rd * t;
            float d = sceneSDF(p);

            if (d < EPSILON) return t;
            if (t > 5.0) break;

            t += d * (uIsLowPower > 0.5 ? 1.2 : 0.9);
        }

        return -1.0;
    }

    vec3 lighting(vec3 p, vec3 rd, float t) {
        if (t < 0.0) return vec3(0.0);

        vec3 normal = calcNormal(p);
        vec3 viewDir = -rd;
        vec3 baseColor = uSphereColor;
        float ao = 1.0;
        if (uAOStrength > 0.0) {
            ao = mix(1.0, ambientOcclusion(p, normal), uAOStrength);
        }
        vec3 ambient = uLightColor * uAmbientIntensity * ao;
        vec3 lightDir = normalize(uLightPosition);
        float diff = max(dot(normal, lightDir), 0.0);
        float shadow = uShadowStrength > 0.0 ? softShadow(p, lightDir, 0.01, 10.0, 20.0) : 1.0;
        vec3 diffuse = uLightColor * diff * uDiffuseIntensity * mix(1.0, shadow, uShadowStrength);
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), uSpecularPower);
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), uFresnelPower);
        vec3 specular = uLightColor * spec * uSpecularIntensity * fresnel;
        vec3 fresnelRim = uLightColor * fresnel * 0.4;

        // Cursor ball highlight removed for performance/cleaner look

        vec3 color = (baseColor + ambient + diffuse + specular + fresnelRim) * ao;
        color = pow(color, vec3(uContrast * 0.9));
        color = color / (color + vec3(0.8));

        // Flatten lighting on cursor sphere to remove any shadowing
        float distToCursor = length(p - uCursorSphere);
        if (distToCursor < uCursorRadius) {
            color = baseColor;
        }

        return color;
    }

    float calculateCursorGlow(vec3 worldPos) {
        float dist = length(worldPos.xy - uCursorSphere.xy);
        float glow = 1.0 - smoothstep(0.0, uCursorGlowRadius, dist);
        glow = pow(glow, 2.0);
        return glow * uCursorGlowIntensity;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - uActualResolution.xy) / uActualResolution.xy;
        uv.x *= uResolution.x / uResolution.y;

        vec3 ro = vec3(uv * 2.0, -1.0);
        vec3 rd = vec3(0.0, 0.0, 1.0);

        float t = rayMarch(ro, rd);
        vec3 p = ro + rd * t;
        vec3 color = lighting(p, rd, t);

        float cursorGlow = calculateCursorGlow(ro);
        vec3 glowContribution = uCursorGlowColor * cursorGlow;

        if (t > 0.0) {
            float fogAmount = 1.0 - exp(-t * uFogDensity);
            color = mix(color, uBackgroundColor.rgb, fogAmount * 0.3);
            color += glowContribution * 0.3;
            gl_FragColor = vec4(color, 1.0);
        } else {
            if (cursorGlow > 0.01) {
                gl_FragColor = vec4(glowContribution, cursorGlow * 0.8);
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        }
    }
`;

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
    const screenToWorldJS = useCallback((normalizedX: number, normalizedY: number) => {
        const uvX = normalizedX * 2.0 - 1.0;
        const uvY = normalizedY * 2.0 - 1.0;
        const aspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1;
        tempVector3Ref.current.set(uvX * aspect * 2.0, uvY * 2.0, 0.0);
        return tempVector3Ref.current;
    }, []);

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
        const initialPreset = presets[currentTheme];

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

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Clamp resolution to prevent excessive GPU load (preserve aspect ratio)
        // Higher values = sharper metaballs but more GPU load
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        const MAX_PIXEL_RATIO = device.isMobile ? 1.5 : (device.isLowPower ? 1.75 : 2.0);
        const FIXED_RENDER_SCALE = device.isMobile ? 0.65 : (device.isLowPower ? 0.8 : 1.0);

        const getBaseRenderMetrics = (viewportWidth: number, viewportHeight: number) => {
            const scale = Math.min(1, MAX_WIDTH / viewportWidth, MAX_HEIGHT / viewportHeight);
            const baseWidth = Math.max(1, Math.round(viewportWidth * scale));
            const baseHeight = Math.max(1, Math.round(viewportHeight * scale));
            const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
            return { baseWidth, baseHeight, pixelRatio };
        };

        const applyRenderSize = (viewportWidth: number, viewportHeight: number) => {
            const { baseWidth, baseHeight, pixelRatio } = getBaseRenderMetrics(viewportWidth, viewportHeight);
            const renderWidth = Math.max(1, Math.round(baseWidth * FIXED_RENDER_SCALE));
            const renderHeight = Math.max(1, Math.round(baseHeight * FIXED_RENDER_SCALE));

            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(renderWidth, renderHeight, false);

            if (materialRef.current) {
                materialRef.current.uniforms.uResolution.value.set(renderWidth, renderHeight);
                materialRef.current.uniforms.uActualResolution.value.set(
                    renderWidth * pixelRatio,
                    renderHeight * pixelRatio
                );
                materialRef.current.uniforms.uPixelRatio.value = pixelRatio;
            }
        };

        const { baseWidth, baseHeight, pixelRatio } = getBaseRenderMetrics(width, height);
        const initialRenderWidth = Math.max(1, Math.round(baseWidth * FIXED_RENDER_SCALE));
        const initialRenderHeight = Math.max(1, Math.round(baseHeight * FIXED_RENDER_SCALE));
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
                uActualResolution: { value: new THREE.Vector2(initialRenderWidth * pixelRatio, initialRenderHeight * pixelRatio) },
                uPixelRatio: { value: pixelRatio },
                uMousePosition: { value: new THREE.Vector2(0.5, 0.5) },
                uCursorSphere: { value: new THREE.Vector3(0, 0, 0) },
                uCursorRadius: { value: 0.22 }, // Between 0.20-0.25
                uSphereCount: { value: initialPreset.sphereCount },
                uFixedTopLeftRadius: { value: 0.90 },
                uFixedBottomRightRadius: { value: 0.90 },
                uFixedBottomLeftRadius: { value: 0.85 },
                uSmallTopLeftRadius: { value: 0.30 },
                uSmallBottomRightRadius: { value: 0.35 },
                uSmallBottomLeftRadius: { value: 0.28 },
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
                uShadowStrength: { value: 0.0 },
                uAOStrength: { value: 0.0 },
                uIsSafari: { value: device.isSafari ? 1.0 : 0.0 },
                uIsMobile: { value: device.isMobile ? 1.0 : 0.0 },
                uIsLowPower: { value: device.isLowPower ? 1.0 : 0.0 },
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
            applyRenderSize(window.innerWidth, window.innerHeight);

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

        // Initialize cached rect for mouse calculations
        cachedRectRef.current = containerRef.current.getBoundingClientRect();

        // Initialize cursor position
        handlePointerMove(window.innerWidth / 2, window.innerHeight / 2);

        // Start animation
        setIsLoaded(true);
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
            debouncedResize.cancel();
            window.removeEventListener("resize", debouncedResize);

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
        };
    }, [handlePointerMove]);

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
                    γίνεται <span className="nexus-hero__headline--accent">έλεγχος</span>
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: visible; /* Changed from hidden to allow LiquidButton blobs to show */
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
