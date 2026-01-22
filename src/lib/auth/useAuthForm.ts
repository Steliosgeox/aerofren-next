'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    validateLogin,
    validateSignup,
    getAuthErrorMessage,
    isRateLimitError,
    useRateLimit,
    formatLockoutTime,
    type LoginFormData,
    type SignupFormData,
} from '@/lib/auth';

/**
 * Input field constraints
 */
export const INPUT_LIMITS = {
    name: 100,
    email: 254,
    password: 128,
} as const;

/**
 * Auth form field types
 */
export interface AuthFormFields {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * useAuthForm Hook
 * 
 * Shared authentication form logic for Login and Signup components.
 * Handles form state, validation, rate limiting, and auth operations.
 */
export function useAuthForm(mode: 'login' | 'signup') {
    const router = useRouter();
    const {
        user,
        loading: authLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail
    } = useAuth();

    // Form state
    const [formData, setFormData] = useState<AuthFormFields>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Loading states
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);

    // Rate limiting
    const { isLocked, remainingTime, recordAttempt, reset: resetRateLimit } = useRateLimit({
        maxAttempts: 5,
        windowMs: 60000,
        lockoutMs: 300000,
    });

    /**
     * Update a form field with limit enforcement
     */
    const updateField = useCallback((
        field: keyof AuthFormFields,
        value: string
    ) => {
        const limit = field === 'name' ? INPUT_LIMITS.name :
            field === 'email' ? INPUT_LIMITS.email :
                INPUT_LIMITS.password;

        setFormData(prev => ({ ...prev, [field]: value.slice(0, limit) }));

        // Clear field error when user types
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [fieldErrors]);

    /**
     * Handle Google authentication
     */
    const handleGoogleAuth = useCallback(async () => {
        if (isLocked) {
            setError(`Πολλές προσπάθειες. Δοκιμάστε σε ${formatLockoutTime(remainingTime)}.`);
            return;
        }

        try {
            setError('');
            setIsGoogleLoading(true);
            await signInWithGoogle();
            resetRateLimit();
        } catch (err) {
            recordAttempt();
            setError(getAuthErrorMessage(err));
        } finally {
            setIsGoogleLoading(false);
        }
    }, [isLocked, remainingTime, signInWithGoogle, resetRateLimit, recordAttempt]);

    /**
     * Handle email login
     */
    const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLocked) {
            setError(`Πολλές προσπάθειες. Δοκιμάστε σε ${formatLockoutTime(remainingTime)}.`);
            return;
        }

        // Validate
        const validation = validateLogin({
            email: formData.email,
            password: formData.password
        });

        if (!validation.success) {
            setFieldErrors(validation.errors || {});
            setError(Object.values(validation.errors || {})[0] || 'Ελέγξτε τα στοιχεία σας.');
            return;
        }

        // Check rate limit
        if (!recordAttempt()) {
            setError(`Πολλές προσπάθειες. Δοκιμάστε σε ${formatLockoutTime(remainingTime)}.`);
            return;
        }

        try {
            setError('');
            setFieldErrors({});
            setIsEmailLoading(true);
            await signInWithEmail(validation.data!.email, validation.data!.password);
            resetRateLimit();
        } catch (err) {
            if (isRateLimitError(err)) {
                setError('Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά αργότερα.');
            } else {
                setError(getAuthErrorMessage(err));
            }
        } finally {
            setIsEmailLoading(false);
        }
    }, [isLocked, remainingTime, formData, recordAttempt, signInWithEmail, resetRateLimit]);

    /**
     * Handle email signup
     */
    const handleEmailSignup = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLocked) {
            setError(`Πολλές προσπάθειες. Δοκιμάστε σε ${formatLockoutTime(remainingTime)}.`);
            return;
        }

        // Validate with Zod (includes XSS sanitization for name)
        const validation = validateSignup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        });

        if (!validation.success) {
            setFieldErrors(validation.errors || {});
            setError(Object.values(validation.errors || {})[0] || 'Ελέγξτε τα στοιχεία σας.');
            return;
        }

        // Check rate limit
        if (!recordAttempt()) {
            setError(`Πολλές προσπάθειες. Δοκιμάστε σε ${formatLockoutTime(remainingTime)}.`);
            return;
        }

        try {
            setError('');
            setFieldErrors({});
            setIsEmailLoading(true);
            await signUpWithEmail(
                validation.data!.email,
                validation.data!.password,
                validation.data!.name || undefined
            );
            resetRateLimit();
        } catch (err) {
            if (isRateLimitError(err)) {
                setError('Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά αργότερα.');
            } else {
                setError(getAuthErrorMessage(err));
            }
        } finally {
            setIsEmailLoading(false);
        }
    }, [isLocked, remainingTime, formData, recordAttempt, signUpWithEmail, resetRateLimit]);

    /**
     * Clear all errors
     */
    const clearErrors = useCallback(() => {
        setError('');
        setFieldErrors({});
    }, []);

    /**
     * Toggle password visibility
     */
    const togglePassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    /**
     * Toggle confirm password visibility
     */
    const toggleConfirmPassword = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    return {
        // State
        formData,
        error,
        fieldErrors,
        showPassword,
        showConfirmPassword,
        isLocked,
        remainingTime,
        authLoading,
        user,

        // Loading states
        isGoogleLoading,
        isEmailLoading,
        isLoading: isGoogleLoading || isEmailLoading || authLoading,

        // Actions
        updateField,
        handleGoogleAuth,
        handleEmailSubmit: mode === 'login' ? handleEmailLogin : handleEmailSignup,
        clearErrors,
        togglePassword,
        toggleConfirmPassword,

        // Utilities
        formatLockoutTime: () => formatLockoutTime(remainingTime),
    };
}

export default useAuthForm;
