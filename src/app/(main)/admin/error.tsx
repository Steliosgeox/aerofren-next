'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
    useEffect(() => {
        console.error('[Admin Error Boundary]', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--theme-bg)' }}>
            <div
                className="max-w-md w-full rounded-2xl p-8 text-center"
                style={{
                    background: 'var(--theme-glass)',
                    border: '1px solid var(--theme-glass-border)',
                }}
            >
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-red-500/10">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                </div>
                <h2 className="text-xl font-bold mb-2 text-[var(--theme-text)]">
                    Σφάλμα στην Πύλη Διαχείρισης
                </h2>
                <p className="text-sm mb-6 text-[var(--theme-text-muted)]">
                    Παρουσιάστηκε ένα απρόσμενο σφάλμα. Δοκιμάστε να επαναφορτώσετε τη σελίδα.
                </p>
                {error.digest && (
                    <p className="text-xs mb-4 font-mono text-[var(--theme-text-muted)] opacity-60">
                        Κωδικός: {error.digest}
                    </p>
                )}
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--theme-accent)', color: 'white' }}
                >
                    <RefreshCw className="w-4 h-4" />
                    Δοκιμή ξανά
                </button>
            </div>
        </div>
    );
}
