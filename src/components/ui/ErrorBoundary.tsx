'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch and handle runtime errors
 * Prevents the entire app from crashing on component errors
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)] text-[var(--theme-text)] p-8">
                    <div className="max-w-md text-center">
                        <h1 className="text-2xl font-bold mb-4">Κάτι πήγε στραβά</h1>
                        <p className="text-[var(--theme-text-muted)] mb-6">
                            Παρουσιάστηκε ένα σφάλμα. Παρακαλώ ανανεώστε τη σελίδα.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white rounded-lg font-medium transition-colors"
                        >
                            Ανανέωση Σελίδας
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
