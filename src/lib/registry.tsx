"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/**
 * StyledComponentsRegistry
 * 
 * Required for styled-components to work with Next.js App Router SSR.
 * This collects styles during server rendering and injects them into the HTML.
 * 
 * Without this, styled-components generates different class names on server vs client,
 * causing hydration mismatches.
 */
export default function StyledComponentsRegistry({
    children,
}: {
    children: React.ReactNode;
}) {
    // Only create stylesheet once with lazy initial state
    // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
    });

    // Always wrap with StyleSheetManager to ensure consistent rendering
    // between server and client (prevents hydration mismatch)
    return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
            {children}
        </StyleSheetManager>
    );
}
