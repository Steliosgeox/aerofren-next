'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminAccessDenied() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--theme-bg-solid)]">
            <div
                className="w-full max-w-md rounded-2xl p-8 text-center"
                style={{
                    background: 'var(--theme-glass-bg)',
                    border: '1px solid var(--theme-glass-border)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-red-500/15">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--theme-text)' }}
                >
                    Πρόσβαση μόνο για διαχειριστές
                </h2>
                <p className="mb-6" style={{ color: 'var(--theme-text-muted)' }}>
                    {!user
                        ? 'Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα.'
                        : 'Ο λογαριασμός σας δεν έχει δικαιώματα διαχειριστή.'}
                </p>
                <div className="flex flex-col gap-3">
                    {!user ? (
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] hover:-translate-y-0.5 transition-transform"
                        >
                            Σύνδεση
                        </button>
                    ) : (
                        <>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--theme-text-muted)' }}
                            >
                                Συνδεδεμένος ως: {user.email}
                            </p>
                            <button
                                onClick={handleSignOut}
                                className="w-full py-3 px-6 rounded-xl font-semibold transition-colors text-[var(--theme-text)] border border-[var(--theme-glass-border)] hover:bg-white/5"
                            >
                                Αποσύνδεση
                            </button>
                        </>
                    )}
                    <Link
                        href="/"
                        className="text-sm hover:underline"
                        style={{ color: 'var(--theme-accent)' }}
                    >
                        Επιστροφή στην αρχική
                    </Link>
                </div>
            </div>
        </div>
    );
}
