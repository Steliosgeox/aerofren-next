"use client";

import { useEffect } from "react";

/**
 * PageVisibilityHandler
 *
 * Adds 'page-hidden' class to body when tab is hidden.
 * This triggers CSS rules that pause all animations,
 * saving significant GPU resources when user switches tabs.
 *
 * Works in conjunction with globals.css:
 * body.page-hidden * { animation-play-state: paused !important; }
 */
export default function PageVisibilityHandler() {
    useEffect(() => {
        if (typeof document === "undefined") return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                document.body.classList.add("page-hidden");
            } else {
                document.body.classList.remove("page-hidden");
            }
        };

        // Set initial state
        handleVisibilityChange();

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.body.classList.remove("page-hidden");
        };
    }, []);

    return null;
}
