"use client";

import React, { useEffect, useRef } from "react";
import {
  DEFAULT_GLOW_COLOR,
  DEFAULT_SPOTLIGHT_RADIUS,
} from "@/components/magic-bento/constants";
import {
  calculateSpotlightValues,
  updateCardGlowProperties,
} from "@/components/magic-bento/shared";
import type {
  CardBoundsEntry,
  PointerThrottleMode,
} from "@/components/magic-bento/types";

type GlobalSpotlightProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
  pointerThrottle?: PointerThrottleMode;
  cacheBounds?: boolean;
};

export const GlobalSpotlight: React.FC<GlobalSpotlightProps> = ({
  containerRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
  pointerThrottle = "raf",
  cacheBounds = true,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestPointRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef(false);
  const inViewRef = useRef(true);
  const cachedBoundsRef = useRef<CardBoundsEntry[]>([]);
  const boundsDirtyRef = useRef(true);

  useEffect(() => {
    if (disableAnimations || !containerRef.current || !enabled) return;

    const container = containerRef.current;
    const spotlight = document.createElement("div");
    const spotlightSize = Math.max(460, Math.round(spotlightRadius * 1.9));
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: ${spotlightSize}px;
      height: ${spotlightSize}px;
      border-radius: 999px;
      pointer-events: none;
      z-index: 180;
      opacity: 0;
      transform: translate3d(-9999px, -9999px, 0) translate(-50%, -50%);
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.23) 0%,
        rgba(${glowColor}, 0.12) 16%,
        rgba(${glowColor}, 0.055) 34%,
        rgba(${glowColor}, 0.02) 48%,
        transparent 66%
      );
      filter: saturate(1.08);
      will-change: transform, opacity;
    `;

    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const resetCardGlow = () => {
      container
        .querySelectorAll<HTMLElement>(".bento-card--border-glow")
        .forEach((card) => {
          card.style.setProperty("--glow-intensity", "0");
        });
    };

    const collectCardBounds = (): CardBoundsEntry[] =>
      Array.from(
        container.querySelectorAll<HTMLElement>(".bento-card--border-glow")
      ).map((element) => ({
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
      if (!spotlightRef.current || !activeRef.current || !inViewRef.current) {
        return;
      }

      spotlightRef.current.style.opacity = "0.78";
      spotlightRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

      const cardBounds = getCardBounds();
      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);

      for (const { element, rect } of cardBounds) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance =
          Math.hypot(x - centerX, y - centerY) -
          Math.max(rect.width, rect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          element,
          rect,
          x,
          y,
          glowIntensity,
          spotlightRadius
        );
      }
    };

    const flushFrame = () => {
      frameRef.current = null;
      if (!latestPointRef.current) return;
      renderSpotlight(latestPointRef.current.x, latestPointRef.current.y);
    };

    const scheduleRender = (x: number, y: number) => {
      latestPointRef.current = { x, y };

      if (pointerThrottle === "none") {
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
      if (!inViewRef.current) return;

      activeRef.current = true;
      boundsDirtyRef.current = true;
      scheduleRender(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!activeRef.current || !inViewRef.current) return;
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
        spotlightRef.current.style.opacity = "0";
      }

      resetCardGlow();
    };

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            const [entry] = entries;
            inViewRef.current = entry?.isIntersecting ?? true;

            if (!inViewRef.current) {
              handleMouseLeave();
            }
          })
        : null;

    intersectionObserver?.observe(container);

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    window.addEventListener("resize", markBoundsDirty);
    window.addEventListener("scroll", markBoundsDirty, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (cacheBounds && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(markBoundsDirty);
      resizeObserver.observe(container);
    }

    return () => {
      activeRef.current = false;
      inViewRef.current = true;
      latestPointRef.current = null;
      boundsDirtyRef.current = true;

      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);

      window.removeEventListener("resize", markBoundsDirty);
      window.removeEventListener("scroll", markBoundsDirty);

      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      spotlightRef.current?.remove();
      spotlightRef.current = null;
    };
  }, [
    cacheBounds,
    containerRef,
    disableAnimations,
    enabled,
    glowColor,
    pointerThrottle,
    spotlightRadius,
  ]);

  return null;
};
