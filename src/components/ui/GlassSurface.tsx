"use client";

import React, { useEffect, useState } from "react";

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

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const html = document.documentElement;

    const readTheme = () => {
      const theme = html.getAttribute("data-theme");
      if (theme === "light") return false;
      if (theme === "dark" || theme === "dim") return true;
      return mediaQuery.matches;
    };

    const sync = () => setIsDark(readTheme());

    sync();
    mediaQuery.addEventListener("change", sync);

    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      mediaQuery.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return isDark;
};

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

  const isDarkMode = useDarkMode();

  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...style,
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
      // Add modern webkit support for older Safari/iOS
      backdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    };

    if (isDarkMode) {
      return {
        ...baseStyles,
        background: `rgba(0, 0, 0, ${backgroundOpacity})`,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
                    inset 0 -1px 0 0 rgba(255, 255, 255, 0.02),
                    0 8px 32px 0 rgba(0, 0, 0, 0.3)`,
      };
    } else {
      return {
        ...baseStyles,
        background: `rgba(255, 255, 255, ${Math.max(backgroundOpacity, 0.15)})`,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                    inset 0 -1px 0 0 rgba(255, 255, 255, 0.2),
                    0 8px 32px 0 rgba(31, 38, 135, 0.15)`,
      };
    }
  };

  const glassSurfaceClasses =
    "relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out";

  const focusVisibleClasses = isDarkMode
    ? "focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2"
    : "focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2";

  return (
    <div
      className={`${glassSurfaceClasses} ${focusVisibleClasses} ${className}`}
      style={getContainerStyles()}
    >
      <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
