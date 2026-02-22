"use client";

/**
 * Root error boundary
 * Catches errors that escape the root layout.
 * Must render its own <html> and <body> tags since the root layout is unavailable.
 * Uses hardcoded inline styles (no CSS vars available at this level).
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    if (process.env.NODE_ENV !== "production") {
        console.error("Global error:", error);
    }

    return (
        <html lang="el">
            <body style={{
                margin: 0,
                padding: 0,
                background: "#06101f",
                color: "#e0e8f0",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
            }}>
                <div style={{
                    textAlign: "center",
                    maxWidth: 480,
                    padding: "3rem 2rem",
                    borderRadius: "1.5rem",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠</div>
                    <h2 style={{
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        margin: "0 0 0.75rem",
                    }}>
                        Κρίσιμο σφάλμα
                    </h2>
                    <p style={{
                        fontSize: "1rem",
                        color: "#8899aa",
                        margin: "0 0 1.5rem",
                        lineHeight: 1.5,
                    }}>
                        Παρουσιάστηκε ένα κρίσιμο σφάλμα. Παρακαλούμε δοκιμάστε ξανά.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.625rem 1.5rem",
                            borderRadius: "0.75rem",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            border: "none",
                            cursor: "pointer",
                            background: "#00bae2",
                            color: "#fff",
                        }}
                    >
                        Δοκιμάστε ξανά
                    </button>
                </div>
            </body>
        </html>
    );
}
