/**
 * NexusHero ray-marched metaball shader.
 *
 * Uses compile-time #define directives for device-specific optimizations:
 * - IS_MOBILE: Fewer spheres (4), fewer march steps (10)
 * - LOW_POWER: Moderate spheres (6), moderate steps (16), larger epsilon
 * - IS_SAFARI: Moderate march steps (14)
 * - Desktop default: Full spheres (10), 20 march steps
 *
 * AO and shadows are currently disabled at compile time (strength 0.0).
 * To re-enable: uncomment the ambientOcclusion/softShadow functions and
 * add their uniforms back to the material in NexusHero.tsx.
 */

export const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const createFragmentShader = (isLowPower: boolean, isMobile: boolean, isSafari: boolean) => `
    ${isLowPower || isMobile || isSafari ? "precision mediump float;" : "precision highp float;"}

    // Compile-time device branching - eliminates runtime uniform checks in shader
    ${isMobile ? "#define IS_MOBILE" : ""}
    ${isLowPower ? "#define LOW_POWER" : ""}
    ${isSafari ? "#define IS_SAFARI" : ""}

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

        #ifdef IS_MOBILE
          const int MAX_SPHERES = 4;
        #elif defined(LOW_POWER)
          const int MAX_SPHERES = 6;
        #else
          const int MAX_SPHERES = 10;
        #endif
        for (int i = 0; i < MAX_SPHERES; i++) {
            if (i >= uSphereCount) break;

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
        #ifdef LOW_POWER
          const float NORMAL_EPS = 0.003;
        #else
          const float NORMAL_EPS = 0.002;
        #endif
        return normalize(vec3(
            sceneSDF(p + vec3(NORMAL_EPS, 0, 0)) - sceneSDF(p - vec3(NORMAL_EPS, 0, 0)),
            sceneSDF(p + vec3(0, NORMAL_EPS, 0)) - sceneSDF(p - vec3(0, NORMAL_EPS, 0)),
            sceneSDF(p + vec3(0, 0, NORMAL_EPS)) - sceneSDF(p - vec3(0, 0, NORMAL_EPS))
        ));
    }

    // AO and shadows are compile-time disabled (both strengths are 0.0)
    // When re-enabled, set ENABLE_AO/ENABLE_SHADOWS to 1 and uncomment the functions below

    // #if ENABLE_AO
    // float ambientOcclusion(vec3 p, vec3 n) {
    //     #ifdef LOW_POWER
    //         float h1 = sceneSDF(p + n * 0.03);
    //         float h2 = sceneSDF(p + n * 0.06);
    //         float occ = (0.03 - h1) + (0.06 - h2) * 0.5;
    //         return clamp(1.0 - occ * 2.0, 0.0, 1.0);
    //     #else
    //         float occ = 0.0;
    //         float weight = 1.0;
    //         for (int i = 0; i < 3; i++) {
    //             float dist = 0.01 + 0.015 * float(i * i);
    //             float h = sceneSDF(p + n * dist);
    //             occ += (dist - h) * weight;
    //             weight *= 0.85;
    //         }
    //         return clamp(1.0 - occ, 0.0, 1.0);
    //     #endif
    // }
    // #endif

    // #if ENABLE_SHADOWS
    // float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    //     #ifdef LOW_POWER
    //         float result = 1.0;
    //         float t = mint;
    //         for (int i = 0; i < 3; i++) {
    //             t += 0.3;
    //             if (t >= maxt) break;
    //             float h = sceneSDF(ro + rd * t);
    //             if (h < EPSILON) return 0.0;
    //             result = min(result, k * h / t);
    //         }
    //         return result;
    //     #else
    //         float result = 1.0;
    //         float t = mint;
    //         for (int i = 0; i < 8; i++) {
    //             if (t >= maxt) break;
    //             float h = sceneSDF(ro + rd * t);
    //             if (h < EPSILON) return 0.0;
    //             result = min(result, k * h / t);
    //             t += h;
    //         }
    //         return result;
    //     #endif
    // }
    // #endif

    float rayMarch(vec3 ro, vec3 rd) {
        float t = 0.0;

        #ifdef IS_MOBILE
          const int MAX_STEPS = 10;
          const float STEP_SCALE = 1.2;
        #elif defined(IS_SAFARI)
          const int MAX_STEPS = 14;
          const float STEP_SCALE = 0.9;
        #elif defined(LOW_POWER)
          const int MAX_STEPS = 16;
          const float STEP_SCALE = 1.2;
        #else
          const int MAX_STEPS = 20;
          const float STEP_SCALE = 0.9;
        #endif

        for (int i = 0; i < MAX_STEPS; i++) {
            vec3 p = ro + rd * t;
            float d = sceneSDF(p);

            if (d < EPSILON) return t;
            if (t > 5.0) break;

            t += d * STEP_SCALE;
        }

        return -1.0;
    }

    vec3 lighting(vec3 p, vec3 rd, float t) {
        if (t < 0.0) return vec3(0.0);

        vec3 normal = calcNormal(p);
        vec3 viewDir = -rd;
        vec3 baseColor = uSphereColor;
        float ao = 1.0;  // AO disabled at compile time (strength 0.0)
        vec3 ambient = uLightColor * uAmbientIntensity * ao;
        vec3 lightDir = normalize(uLightPosition);
        float diff = max(dot(normal, lightDir), 0.0);
        float shadow = 1.0;  // Shadows disabled at compile time (strength 0.0)
        vec3 diffuse = uLightColor * diff * uDiffuseIntensity;
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
