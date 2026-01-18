import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

import './Threads.css';

interface ThreadsProps {
  color?: [number, number, number];
  secondaryColor?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  lineCount?: number; // Allow customization, default 15
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Optimized fragment shader with reduced complexity
const createFragmentShader = (lineCount: number) => `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.14159265

const int LINE_COUNT = ${lineCount};
const float LINE_WIDTH = 7.0;
const float LINE_BLUR = 10.0;

// Simplified noise - much faster than Perlin
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float lineFn(vec2 st, float width, float perc, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = perc * 0.4;
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float finalAmplitude = amplitude_normal * 0.5 * amplitude * (1.0 + (mouse.y - 0.5) * 0.15);

    float time_scaled = time * 0.08 + (mouse.x - 0.5) * 0.8;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    // Single noise sample instead of two
    float xnoise = noise(vec2(time_scaled * 2.0, st.x + perc) * 2.0) - 0.5;

    float y = 0.5 + (perc - 0.5) * distance + xnoise * finalAmplitude;

    float pixelSize = 1.0 / max(iResolution.x, iResolution.y);
    float halfWidth = width * 0.5 * pixelSize;
    float blurAmount = LINE_BLUR * pixelSize * blur;

    float line_start = smoothstep(y + halfWidth + blurAmount, y, st.y);
    float line_end = smoothstep(y, y - halfWidth - blurAmount, st.y);

    return clamp((line_start - line_end) * (1.0 - pow(perc, 0.4)), 0.0, 1.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < LINE_COUNT; i++) {
        float p = float(i) / float(LINE_COUNT);
        float lineWidth = LINE_WIDTH * (1.0 - p * 0.5);
        line_strength *= (1.0 - lineFn(uv, lineWidth, p, uMouse, iTime, uAmplitude, uDistance));
    }

    float colorVal = 1.0 - line_strength;

    // Subtle gradient between primary and secondary color
    vec3 finalColor = mix(uColor, uSecondaryColor, uv.x * 0.5);

    gl_FragColor = vec4(finalColor * colorVal, colorVal);
}
`;

const Threads: React.FC<ThreadsProps> = ({
  color = [1, 1, 1],
  secondaryColor,
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  lineCount = 20,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const isVisibleRef = useRef(true);

  // Use secondary color or derive from primary
  const finalSecondaryColor = secondaryColor || [
    Math.min(1, color[0] * 1.3),
    Math.min(1, color[1] * 0.8),
    Math.min(1, color[2] * 1.2)
  ] as [number, number, number];

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({
      alpha: true,
      dpr: window.devicePixelRatio || 1,
      powerPreference: 'high-performance'
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: createFragmentShader(lineCount),
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uColor: { value: new Color(...color) },
        uSecondaryColor: { value: new Color(...finalSecondaryColor) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Cache rect for mouse calculations - declared here, updated in resize
    let cachedRect = container.getBoundingClientRect();

    function resize() {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = clientWidth;
      program.uniforms.iResolution.value.g = clientHeight;
      program.uniforms.iResolution.value.b = clientWidth / clientHeight;
      // Update cached rect on resize
      cachedRect = container.getBoundingClientRect();
    }

    // Debounced resize
    let resizeTimeout: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    }
    window.addEventListener('resize', handleResize, { passive: true });
    resize();

    // Visibility observer - pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e: MouseEvent) {
      // Use cached rect - updated only on resize
      const x = (e.clientX - cachedRect.left) / cachedRect.width;
      const y = 1.0 - (e.clientY - cachedRect.top) / cachedRect.height;
      targetMouse = [x, y];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }

    if (enableMouseInteraction) {
      // Use passive listeners for better scroll performance
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    let isMounted = true;

    function update(t: number) {
      if (!isMounted) return;

      // Skip if not visible - saves GPU when scrolled away
      if (!isVisibleRef.current) {
        animationFrameId.current = requestAnimationFrame(update);
        return;
      }

      if (enableMouseInteraction) {
        // Faster mouse smoothing for responsiveness
        const smoothing = 0.12;
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }
      program.uniforms.iTime.value = t * 0.001;

      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }
    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      isMounted = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (enableMouseInteraction) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, finalSecondaryColor, amplitude, distance, enableMouseInteraction, lineCount]);

  return (
    <div
      ref={containerRef}
      className={`threads-container${enableMouseInteraction ? ' threads-container--interactive' : ''}`}
      {...rest}
    />
  );
};

export default Threads;
