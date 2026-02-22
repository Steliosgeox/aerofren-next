"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary
 * Catches errors in route segments and displays a recovery UI.
 * Uses AEROFREN glass-theme styling with Greek/English text.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error for monitoring
        console.error("Route error:", error);
    }, [error]);

    return (
        <div className="error-boundary">
            <div className="error-boundary__card">
                <div className="error-boundary__icon">⚠</div>
                <h2 className="error-boundary__title">Κάτι πήγε στραβά</h2>
                <p className="error-boundary__message">
                    Παρουσιάστηκε ένα σφάλμα. Παρακαλούμε δοκιμάστε ξανά.
                </p>
                {error.digest && (
                    <p className="error-boundary__digest">
                        Κωδικός: {error.digest}
                    </p>
                )}
                <div className="error-boundary__actions">
                    <button onClick={reset} className="error-boundary__btn error-boundary__btn--primary">
                        Δοκιμάστε ξανά
                    </button>
                    <Link href="/" className="error-boundary__btn error-boundary__btn--secondary">
                        Αρχική σελίδα
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .error-boundary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    padding: 2rem;
                }
                .error-boundary__card {
                    text-align: center;
                    max-width: 480px;
                    padding: 3rem 2rem;
                    border-radius: 1.5rem;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .error-boundary__icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .error-boundary__title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0 0 0.75rem;
                    color: var(--theme-text, #e0e8f0);
                }
                .error-boundary__message {
                    font-size: 1rem;
                    color: var(--theme-text-secondary, #8899aa);
                    margin: 0 0 0.5rem;
                    line-height: 1.5;
                }
                .error-boundary__digest {
                    font-size: 0.75rem;
                    color: var(--theme-text-secondary, #8899aa);
                    opacity: 0.6;
                    margin: 0 0 1.5rem;
                    font-family: var(--font-tt-norms-mono, monospace);
                }
                .error-boundary__actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .error-boundary__btn {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.625rem 1.5rem;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    transition: opacity 0.2s;
                }
                .error-boundary__btn:hover {
                    opacity: 0.85;
                }
                .error-boundary__btn--primary {
                    background: var(--theme-accent, #00bae2);
                    color: #fff;
                }
                .error-boundary__btn--secondary {
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--theme-text, #e0e8f0);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
