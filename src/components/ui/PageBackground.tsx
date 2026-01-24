"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PageBackgroundProps {
    children: React.ReactNode;
    className?: string;
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
export const PageBackground = ({ children, className = "" }: PageBackgroundProps) => {
    const [mounted, setMounted] = useState(false);
    const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

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
        <div className={`absolute inset-0 w-full h-full ${className}`}>
            {children}
        </div>,
        portalElement
    );
};
