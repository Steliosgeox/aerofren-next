"use client";

import { useEffect, useRef, useState } from "react";

/**
 * FPS Overlay
 * Toggle with NEXT_PUBLIC_SHOW_FPS=1
 */
export default function FpsOverlay() {
  const enabled = process.env.NEXT_PUBLIC_SHOW_FPS === "1";
  const [fps, setFps] = useState(0);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const framesRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      framesRef.current += 1;

      const elapsed = now - lastTimeRef.current;
      if (elapsed >= 500) {
        const nextFps = Math.round((framesRef.current * 1000) / elapsed);
        setFps(nextFps);
        framesRef.current = 0;
        lastTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div className="fps-overlay" aria-live="polite">
        FPS: {fps}
      </div>
      <style jsx>{`
        .fps-overlay {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 9999;
          padding: 6px 10px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          pointer-events: none;
          user-select: none;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </>
  );
}
