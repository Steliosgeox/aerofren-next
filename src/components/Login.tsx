'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import GlassSurface from '@/components/ui/GlassSurface';
import { AuthLayout, ValuePanel, ChatButton, AuthInput } from '@/components/auth';
import { useAuthForm, INPUT_LIMITS, validateResetPassword, getAuthErrorMessage } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Login Component - Tailwind Refactored
 * Lines reduced: 427 → ~250
 */
export default function Login() {
    const router = useRouter();
    const { resetPassword } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Forgot password states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState('');

    const {
        formData,
        error,
        fieldErrors,
        showPassword,
        isLocked,
        authLoading,
        user,
        isGoogleLoading,
        isEmailLoading,
        updateField,
        handleGoogleAuth,
        handleEmailSubmit,
        clearErrors,
        togglePassword,
        formatLockoutTime,
    } = useAuthForm('login');

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (user && !authLoading) router.push('/');
    }, [user, authLoading, router]);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateResetPassword({ email: resetEmail });
        if (!validation.success) {
            setResetError(validation.errors?.email || 'Μη έγκυρο email.');
            return;
        }

        try {
            setResetError('');
            setIsResetting(true);
            await resetPassword(validation.data!.email);
            setResetSent(true);
        } catch (err) {
            setResetError(getAuthErrorMessage(err));
        } finally {
            setIsResetting(false);
        }
    };

    const handleBackToLogin = () => {
        setShowForgotPassword(false);
        setResetSent(false);
        setResetEmail('');
        setResetError('');
        clearErrors();
    };

    return (
        <AuthLayout valuePanel={<ValuePanel />}>
            <div
                className="w-full max-w-[320px] flex flex-col items-center text-center transition-opacity duration-300"
                style={{ opacity: mounted ? 1 : 0 }}
            >
                {/* Logo */}
                <div className="w-14 h-14 mb-5 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-[14px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_60px_rgba(0,0,0,0.2)]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2v6M4.93 10.93l4.24 4.24M2 18h6M19.07 10.93l-4.24 4.24M22 18h-6M12 22a8 8 0 0 0 8-8M12 22a8 8 0 0 1-8-8" />
                    </svg>
                </div>

                <h1 className="text-[1.75rem] font-bold text-[var(--theme-text)] mb-1.5 tracking-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.4)]">
                    Σύνδεση
                </h1>
                <p className="text-[0.9375rem] text-[var(--theme-text-muted)] mb-6">Συνεχίστε στον λογαριασμό σας</p>

                {/* Lockout Warning */}
                {isLocked && (
                    <div className="w-full p-3 px-4 rounded-lg mb-4 text-sm flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300" role="alert">
                        <AlertTriangle size={18} />
                        <span>Πολλές προσπάθειες. Δοκιμάστε σε {formatLockoutTime()}.</span>
                    </div>
                )}

                {/* Error Message */}
                {(error || resetError) && !isLocked && (
                    <div className="w-full p-3 px-4 rounded-lg mb-4 text-sm flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300" role="alert">
                        <span>{error || resetError}</span>
                    </div>
                )}

                {!showEmailForm ? (
                    <>
                        {/* Google Sign-in Button */}
                        <div className="w-full">
                            <button
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] border-none rounded-xl py-3.5 px-6 cursor-pointer transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_28px_rgba(0,0,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={handleGoogleAuth}
                                disabled={isGoogleLoading || authLoading || isLocked}
                            >
                                {isGoogleLoading ? (
                                    <Loader2 size={22} className="animate-spin" color="white" />
                                ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24">
                                        <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                <span className="text-white font-semibold text-[0.9375rem]">
                                    {isGoogleLoading ? 'Σύνδεση...' : 'Συνέχεια με Google'}
                                </span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center w-full my-5 gap-3.5">
                            <div className="flex-1 h-px bg-[var(--theme-glass-border)]" />
                            <span className="text-[var(--theme-text-muted)] text-[0.8125rem] font-medium">ή</span>
                            <div className="flex-1 h-px bg-[var(--theme-glass-border)]" />
                        </div>

                        {/* Email Toggle Button */}
                        <GlassSurface width="100%" height={48} borderRadius={12} brightness={40} opacity={0.8} blur={8} backgroundOpacity={0.05} className="hover:scale-[1.02] transition-transform cursor-pointer">
                            <button
                                onClick={() => { setShowEmailForm(true); clearErrors(); }}
                                className="w-full flex items-center justify-center gap-2.5 bg-transparent border-none cursor-pointer text-[var(--theme-text)] text-sm font-semibold p-3.5 transition-colors hover:text-[var(--theme-text)]"
                                disabled={isLocked}
                            >
                                <Mail size={18} />
                                <span>Σύνδεση με Email</span>
                            </button>
                        </GlassSurface>
                    </>
                ) : showForgotPassword ? (
                    <>
                        {/* Back to Login */}
                        <button
                            className="flex items-center gap-1.5 text-[var(--theme-text-muted)] text-sm cursor-pointer bg-transparent border-none mb-5 transition-colors hover:text-[var(--theme-text)]"
                            onClick={handleBackToLogin}
                            type="button"
                        >
                            <ArrowLeft size={16} />
                            <span>Πίσω στη σύνδεση</span>
                        </button>

                        {resetSent ? (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <CheckCircle size={48} className="text-emerald-500" />
                                <p className="text-[var(--theme-text)] text-[0.9375rem] leading-relaxed">
                                    Σας στείλαμε email με οδηγίες επαναφοράς κωδικού στο <strong>{resetEmail}</strong>.
                                </p>
                                <button
                                    type="button"
                                    className="w-full py-3.5 px-6 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(0,0,0,0.3)]"
                                    onClick={handleBackToLogin}
                                >
                                    Επιστροφή στη σύνδεση
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="w-full flex flex-col gap-3" noValidate>
                                <p className="text-[0.9375rem] text-[var(--theme-text-muted)] mb-4">
                                    Εισάγετε το email σας για να λάβετε οδηγίες επαναφοράς κωδικού.
                                </p>
                                <AuthInput
                                    id="reset-email"
                                    type="email"
                                    placeholder="Email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value.slice(0, INPUT_LIMITS.email))}
                                    icon="mail"
                                    maxLength={INPUT_LIMITS.email}
                                    autoComplete="email"
                                    error={resetError}
                                />
                                <button
                                    type="submit"
                                    className="w-full py-3.5 px-6 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_28px_rgba(0,0,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={isResetting}
                                >
                                    {isResetting && <Loader2 size={20} className="animate-spin" />}
                                    {isResetting ? 'Αποστολή...' : 'Αποστολή συνδέσμου'}
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    <>
                        {/* Email Form */}
                        <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-3" noValidate>
                            <AuthInput
                                id="login-email"
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                icon="mail"
                                maxLength={INPUT_LIMITS.email}
                                autoComplete="email"
                                error={fieldErrors.email}
                                disabled={isLocked}
                            />
                            <AuthInput
                                id="login-password"
                                type="password"
                                placeholder="Κωδικός"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                icon="lock"
                                maxLength={INPUT_LIMITS.password}
                                autoComplete="current-password"
                                error={fieldErrors.password}
                                disabled={isLocked}
                                showPasswordToggle
                                showPassword={showPassword}
                                onTogglePassword={togglePassword}
                            />

                            <button
                                type="button"
                                className="text-[var(--theme-text-muted)] text-[0.8125rem] cursor-pointer transition-colors mt-1 inline-block bg-transparent border-none hover:text-[var(--theme-accent)]"
                                onClick={() => { setShowForgotPassword(true); setResetEmail(formData.email); clearErrors(); }}
                            >
                                Ξεχάσατε τον κωδικό;
                            </button>

                            <button
                                type="submit"
                                className="w-full py-3.5 px-6 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_28px_rgba(0,0,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={isEmailLoading || authLoading || isLocked}
                            >
                                {isEmailLoading && <Loader2 size={20} className="animate-spin" />}
                                {isEmailLoading ? 'Σύνδεση...' : 'Σύνδεση'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center w-full my-5 gap-3.5">
                            <div className="flex-1 h-px bg-[var(--theme-glass-border)]" />
                            <span className="text-[var(--theme-text-muted)] text-[0.8125rem] font-medium">ή</span>
                            <div className="flex-1 h-px bg-[var(--theme-glass-border)]" />
                        </div>

                        {/* Google Toggle */}
                        <GlassSurface width="100%" height={48} borderRadius={12} brightness={40} opacity={0.8} blur={8} backgroundOpacity={0.05} className="hover:scale-[1.02] transition-transform cursor-pointer">
                            <button
                                onClick={() => { setShowEmailForm(false); clearErrors(); }}
                                className="w-full flex items-center justify-center gap-2.5 bg-transparent border-none cursor-pointer text-[var(--theme-text)] text-sm font-semibold p-3.5 transition-colors hover:text-[var(--theme-text)]"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Συνέχεια με Google</span>
                            </button>
                        </GlassSurface>
                    </>
                )}

                {/* Footer */}
                <div className="mt-5 text-sm text-[var(--theme-text-muted)]">
                    Νέος χρήστης?
                    <Link href="/signup" className="text-[var(--theme-accent)] no-underline font-semibold ml-1 transition-colors hover:text-[var(--theme-accent-hover)]">
                        Εγγραφείτε
                    </Link>
                </div>

                {/* Chat Section */}
                <div className="mt-6 w-full">
                    <ChatButton onClick={() => console.log('Open chat')} />
                </div>
            </div>
        </AuthLayout>
    );
}
