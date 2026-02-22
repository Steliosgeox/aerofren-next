import type React from "react";

export type PointerThrottleMode = "raf" | "none";

export interface BentoProps {
  enableSpotlight?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
  pointerThrottle?: PointerThrottleMode;
  cacheBounds?: boolean;
  children?: React.ReactNode;
}

export interface ParticleCardProps {
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
}

export type CardBoundsEntry = {
  element: HTMLElement;
  rect: DOMRect;
};
