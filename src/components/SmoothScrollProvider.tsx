"use client";

import type { ReactNode } from "react";

/**
 * SmoothScrollProvider — DEPRECATED
 *
 * This component previously wrapped the application with GSAP ScrollSmoother.
 * It has been superseded by LenisProvider as part of the GSAP → Lenis migration.
 *
 * ScrollSmoother has been removed from src/lib/gsap/client.ts.
 * RouteScrollShell now uses LenisProvider directly.
 *
 * This file is kept as a passthrough to avoid breaking any future accidental
 * imports during the migration phase. It renders children unchanged.
 *
 * @deprecated Use LenisProvider instead.
 */

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>;
}
