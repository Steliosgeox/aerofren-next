'use client';

import { useEffect, useState } from 'react';

/**
 * CinematicBackgroundLine
 *
 * Exact replication of TrickyKnot.com's SVG scrollytelling technique.
 * Source: reverse-engineered from TrickyKnot CDN (trickyknot.com)
 *
 * Architecture:
 *   — Path data fetched verbatim from string_path_desktop.svg on TrickyKnot CDN
 *   — 10 cubic bezier <path> elements + 1 starting <line>
 *   — viewBox="0 0 661 9940" — the real TrickyKnot geometry
 *   — Narrow centered column, max-width: 660px — NOT full-width
 *   — stroke="var(--theme-accent)" opacity="0.5" — ZERO blur/glow filters
 *   — Default stroke-width: 1px (same as TrickyKnot original)
 *   — Dynamic height: docH − viewportH × 1.65  (TrickyKnot's svgResize formula)
 *   — Dynamic width:  height / 15.09 + 10, capped at 660px
 *   — Container starts at top: 95vh (below hero fold, same as TrickyKnot)
 *   — preserveAspectRatio="xMidYMin meet" — proportional scaling, not stretched
 *   — The path NEVER moves — scroll creates the illusion of the thread being drawn
 *
 * CSS variables used (auto-adapts to theme):
 *   --theme-accent → cyan (dark) / blue (light) / pink (dim)
 */

export default function CinematicBackgroundLine() {
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    function calcDims() {
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const height = Math.max(docH - viewportH * 1.65, viewportH * 3);
      const width = Math.min(height / 15.09 + 10, 660);
      setDims({ width: Math.round(width), height: Math.round(height) });
    }

    calcDims();
    window.addEventListener('resize', calcDims, { passive: true });
    return () => window.removeEventListener('resize', calcDims);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '95vh',
        left: 0,
        right: 0,
        margin: '0 auto',
        maxWidth: '660px',
        width: dims ? `${dims.width}px` : '100%',
        height: dims ? `${dims.height}px` : '500svh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 11,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 661 9940"
        fill="none"
        preserveAspectRatio="xMidYMin meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Starting vertical line: center top → first curve ── */}
        <line
          x1="330.5"
          y1="0"
          x2="330.5"
          y2="92"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 1: center → swings left ── */}
        <path
          d="M330.5 92C326.5 490 503.229 607.5 238.729 1298.5"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 2: left → crosses right ── */}
        <path
          d="M238.727 1298.5C127.729 1622 641.222 2153.5 308.225 2395.5"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 3: center → swings hard left ── */}
        <path
          d="M308.228 2395.5C-241.771 2796.5 125.728 3079 71.2284 3410.5"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 4: far left → crosses to far right ── */}
        <path
          d="M71.2281 3410.5C10.2282 3797.5 464.728 4298.5 560.228 4558"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 5: far right → loops back left ── */}
        <path
          d="M560.229 4558C670.229 4862 765.729 5310.5 402.729 5576.5"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 6: right-center → swings far left ── */}
        <path
          d="M402.727 5576.5C-6.27148 5873.5 -133.272 6065.5 243.229 6651.5"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 7: left → arcs right then back ── */}
        <path
          d="M243.228 6651.5C401.227 6903 45.7287 7358.5 177.228 7692"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 8: left → crosses to right ── */}
        <path
          d="M177.229 7692C229.729 7830 493.729 8315.5 484.729 8663"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Segment 9: right → settles toward center ── */}
        <path
          d="M484.729 8663C471.729 8999 120.228 9317 240.224 9705"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />

        {/* ── Closing segment: path returns to center bottom ── */}
        <path
          d="M240 9705C272.938 9817.74 330 9836.28 330 9940"
          stroke="var(--theme-accent)"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
