"use client";

import { useEffect, useState } from "react";
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
    const [mounted, setMounted] = useState(false);
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
    const layerClass = layer === "overlay" ? "page-background-layer page-background-layer--overlay" : "page-background-layer page-background-layer--base";

    useEffect(() => {
        setMounted(true);
        // Find the portal target defined in MainLayout
        const el = document.getElementById("page-background-portal");
        setPortalElement(el);

        // Cleanup not strictly necessary for simple retrieval, 
        // but good practice to reset state if unmounting
        return () => {
            setPortalElement(null);
        };
    }, []);

    // Don't render until client-side and portal target is found
    if (!mounted || !portalElement) return null;

    return createPortal(
        <div className={layerClass} aria-hidden="true">
            {children}
        </div>,
        portalElement
    );
};
