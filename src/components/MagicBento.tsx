"use client";

import React, { useRef } from "react";
import { GlobalSpotlight } from "@/components/magic-bento/GlobalSpotlight";
import {
  DEFAULT_GLOW_COLOR,
  DEFAULT_SPOTLIGHT_RADIUS,
} from "@/components/magic-bento/constants";
import { ParticleCard } from "@/components/magic-bento/ParticleCard";
import { useMobileDetection } from "@/components/magic-bento/useMobileDetection";
import type { BentoProps, ParticleCardProps } from "@/components/magic-bento/types";

export type { BentoProps, ParticleCardProps };
export { ParticleCard };

export const MagicBento: React.FC<BentoProps> = ({
  enableSpotlight = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
  pointerThrottle = "raf",
  cacheBounds = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <div ref={containerRef} className="relative [perspective:1200px]">
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
