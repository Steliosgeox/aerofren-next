"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import {
  DEFAULT_GLOW_COLOR,
  DEFAULT_PARTICLE_COUNT,
  HOVER_PARTICLE_INTERVAL_MS,
  MAX_PARTICLE_POOL,
  MAX_PARTICLES_PER_BURST,
} from "@/components/magic-bento/constants";
import { createParticleElement } from "@/components/magic-bento/shared";
import type { ParticleCardProps } from "@/components/magic-bento/types";

export const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  className = "",
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
  const hoverLoopRef = useRef<number | null>(null);
  const timelinesRef = useRef<Set<gsap.core.Timeline>>(new Set());
  const isHoveredRef = useRef(false);
  const moveFrameRef = useRef<number | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
  const particlesInitializedRef = useRef(false);
  const transformTweenRef = useRef<gsap.core.Tween | null>(null);

  const stopHoverLoop = useCallback(() => {
    if (hoverLoopRef.current !== null) {
      window.clearInterval(hoverLoopRef.current);
      hoverLoopRef.current = null;
    }
  }, []);

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
    stopHoverLoop();
    clearHoverTimeouts();
    clearParticleAnimations();
    transformTweenRef.current?.kill();
  }, [clearHoverTimeouts, clearParticleAnimations, stopHoverLoop]);

  const initializeParticlePool = useCallback(() => {
    if (particlesInitializedRef.current || !cardRef.current) return;

    const poolSize = Math.max(1, Math.min(particleCount, MAX_PARTICLE_POOL));
    const pool = Array.from({ length: poolSize }, () =>
      createParticleElement(glowColor)
    );

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
      .fromTo(
        particle,
        { scale: 0.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.14, ease: "power2.out" }
      )
      .to(
        particle,
        {
          x: (Math.random() - 0.5) * 78,
          y: (Math.random() - 0.5) * 78,
          rotation: (Math.random() - 0.5) * 190,
          scale: 0.52,
          opacity: 0,
          duration: 1.05 + Math.random() * 0.45,
          ease: "power2.out",
        },
        0
      );

    timelinesRef.current.add(timeline);
  }, []);

  const animateParticles = useCallback(
    (burstRatio: number = 1) => {
      if (!cardRef.current || !isHoveredRef.current) return;

      if (!particlesInitializedRef.current) {
        initializeParticlePool();
      }

      const rect = cardRef.current.getBoundingClientRect();
      const burstCount = Math.max(
        1,
        Math.min(
          Math.round(particleCount * burstRatio),
          MAX_PARTICLES_PER_BURST
        )
      );

      for (let index = 0; index < burstCount; index += 1) {
        const timeoutId = window.setTimeout(() => {
          if (!isHoveredRef.current) return;
          spawnParticle(Math.random() * rect.width, Math.random() * rect.height);
        }, index * 65);

        hoverTimeoutsRef.current.push(timeoutId);
      }
    },
    [initializeParticlePool, particleCount, spawnParticle]
  );

  const startHoverLoop = useCallback(() => {
    stopHoverLoop();

    hoverLoopRef.current = window.setInterval(() => {
      if (!isHoveredRef.current) return;
      animateParticles(0.45);
    }, HOVER_PARTICLE_INTERVAL_MS);
  }, [animateParticles, stopHoverLoop]);

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
        ease: "power2.out",
        overwrite: "auto",
      };

      if (enableTilt) {
        tweenVars.rotateX = ((y - centerY) / centerY) * -8.5;
        tweenVars.rotateY = ((x - centerX) / centerX) * 8.5;
        tweenVars.transformPerspective = 1000;
      }

      if (enableMagnetism) {
        tweenVars.x = (x - centerX) * 0.042;
        tweenVars.y = (y - centerY) * 0.042;
      }

      transformTweenRef.current = gsap.to(element, tweenVars);
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles(1);
      startHoverLoop();
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
          ease: "power2.out",
          overwrite: "auto",
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

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(${glowColor}, 0.34) 0%, rgba(${glowColor}, 0.14) 36%, transparent 72%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 4;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      latestPointerRef.current = null;

      if (moveFrameRef.current !== null) {
        cancelAnimationFrame(moveFrameRef.current);
        moveFrameRef.current = null;
      }

      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);

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
    startHoverLoop,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden ${
        enableBorderGlow ? "bento-card--border-glow" : ""
      }`}
      style={
        {
          ...style,
          position: "relative",
          overflow: "hidden",
          "--bento-glow-color": glowColor,
          "--glow-x": "50%",
          "--glow-y": "50%",
          "--glow-intensity": "0",
          "--glow-radius": "200px",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};
