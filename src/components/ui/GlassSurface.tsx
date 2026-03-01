"use client";

import React from "react";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  className?: string;
  style?: React.CSSProperties;
}

const EMPTY_STYLE: React.CSSProperties = {};

const GlassSurface: React.FC<GlassSurfaceProps> = (props) => {
  const {
    children,
    width = 200,
    height = 80,
    borderRadius = 20,
    blur = 11,
    backgroundOpacity = 0.05,
    saturation = 1,
    className = "",
    style = EMPTY_STYLE,
  } = props;

  const surfaceMix = Math.max(0, Math.min(100, Math.round(backgroundOpacity * 100)));

  const containerStyles: React.CSSProperties = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    backdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    background: `color-mix(in srgb, var(--glass-surface-base) ${surfaceMix}%, transparent)`,
    border: "1px solid var(--glass-surface-border)",
    boxShadow: "var(--glass-surface-shadow)",
  };

  const classes =
    "relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out " +
    "focus-visible:outline-2 focus-visible:outline-[var(--focus-ring-color)] focus-visible:outline-offset-2";

  return (
    <div className={`${classes} ${className}`} style={containerStyles}>
      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] p-2">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
