"use client";

import { createPortal } from "react-dom";

interface PageBackgroundProps {
    children: React.ReactNode;
    layer?: "base" | "overlay";
}

/**
 * PageBackground
 * 
 * A portal component that renders content into the fixed #page-background-portal div
 * in the MainLayout. This allows page-specific backgrounds to sit outside the
 * GSAP ScrollSmoother transform context, ensuring they remain truly fixed/sticky
 * and aren't affected by the scroll container's transforms.
 * 
 * Usage:
 * <PageBackground>
 *   <DarkVeil ... />
 * </PageBackground>
 */
export const PageBackground = ({ children, layer = "base" }: PageBackgroundProps) => {
    const layerClass = layer === "overlay" ? "page-background-layer page-background-layer--overlay" : "page-background-layer page-background-layer--base";
    const portalId = "page-background-portal";

    if (typeof document === "undefined") return null;
    const portalElement = document.getElementById(portalId) ?? document.body;

    return createPortal(
        <div className={layerClass} aria-hidden="true">
            {children}
        </div>,
        portalElement
    );
};
