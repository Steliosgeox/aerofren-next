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
type StyledComponentsRegistryProps = {
    children: React.ReactNode;
    nonce?: string | null;
};

type WebpackNonceGlobal = typeof globalThis & { __webpack_nonce__?: string };

export default function StyledComponentsRegistry({
    children,
    nonce,
}: StyledComponentsRegistryProps) {
    // Only create stylesheet once with lazy initial state
    // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const nonceValue = nonce ?? undefined;
        const globalWithNonce = globalThis as WebpackNonceGlobal;
        const previousNonce = globalWithNonce.__webpack_nonce__;

        if (nonceValue) {
            globalWithNonce.__webpack_nonce__ = nonceValue;
        }

        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();

        if (nonceValue) {
            if (previousNonce === undefined) {
                delete globalWithNonce.__webpack_nonce__;
            } else {
                globalWithNonce.__webpack_nonce__ = previousNonce;
            }
        }

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
