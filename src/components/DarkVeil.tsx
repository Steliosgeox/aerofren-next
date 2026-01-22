'use client';

import { useRef, useEffect, memo } from 'react';

interface DarkVeilProps {
    hueShift?: number;
    noiseIntensity?: number;
    speed?: number;
}

/**
 * DarkVeil - Atmospheric WebGL background effect
 * Creates a dark, moody ambient backdrop with subtle movement
 */
const DarkVeil = memo(function DarkVeil({
    hueShift = 0,
    noiseIntensity = 0.03,
    speed = 0.5,
}: DarkVeilProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let time = 0;

        const animate = () => {
            time += speed * 0.01;

            // Dark base with subtle gradient
            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                Math.max(canvas.width, canvas.height)
            );

            gradient.addColorStop(0, `hsl(${220 + hueShift}, 30%, 8%)`);
            gradient.addColorStop(0.5, `hsl(${230 + hueShift}, 25%, 5%)`);
            gradient.addColorStop(1, `hsl(${240 + hueShift}, 20%, 3%)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add subtle noise
            if (noiseIntensity > 0) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const noise = (Math.random() - 0.5) * noiseIntensity * 255;
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
                }

                ctx.putImageData(imageData, 0, 0);
            }

            // Subtle animated glow spots
            const glowX = canvas.width / 2 + Math.sin(time * 0.5) * (canvas.width * 0.2);
            const glowY = canvas.height / 2 + Math.cos(time * 0.3) * (canvas.height * 0.15);

            const glowGradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 400);
            glowGradient.addColorStop(0, `hsla(${210 + hueShift}, 80%, 30%, 0.05)`);
            glowGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [hueShift, noiseIntensity, speed]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.8 }}
        />
    );
});

export default DarkVeil;
