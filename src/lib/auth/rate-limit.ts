/**
 * Client-side Rate Limiting
 * Prevents rapid form submissions and brute force attempts
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
    lockoutMs: number;
}

interface RateLimitState {
    attempts: number;
    firstAttemptTime: number;
    lockedUntil: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxAttempts: 5,      // Max attempts before lockout
    windowMs: 60000,     // 1 minute window
    lockoutMs: 300000,   // 5 minute lockout
};

/**
 * Hook for rate limiting form submissions
 */
export function useRateLimit(config: Partial<RateLimitConfig> = {}) {
    const { maxAttempts, windowMs, lockoutMs } = { ...DEFAULT_CONFIG, ...config };

    const [isLocked, setIsLocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const stateRef = useRef<RateLimitState>({
        attempts: 0,
        firstAttemptTime: 0,
        lockedUntil: 0,
    });

    // Check and update lock status
    const checkLock = useCallback(() => {
        const now = Date.now();
        const state = stateRef.current;

        // Check if currently locked
        if (state.lockedUntil > now) {
            setIsLocked(true);
            setRemainingTime(Math.ceil((state.lockedUntil - now) / 1000));
            return true;
        }

        // Reset if window has passed
        if (state.firstAttemptTime && now - state.firstAttemptTime > windowMs) {
            stateRef.current = {
                attempts: 0,
                firstAttemptTime: 0,
                lockedUntil: 0,
            };
        }

        setIsLocked(false);
        setRemainingTime(0);
        return false;
    }, [windowMs]);

    // Record an attempt
    const recordAttempt = useCallback(() => {
        const now = Date.now();
        const state = stateRef.current;

        // If locked, don't record
        if (state.lockedUntil > now) {
            return false;
        }

        // Reset window if expired
        if (state.firstAttemptTime && now - state.firstAttemptTime > windowMs) {
            stateRef.current = {
                attempts: 1,
                firstAttemptTime: now,
                lockedUntil: 0,
            };
            return true;
        }

        // First attempt in window
        if (!state.firstAttemptTime) {
            stateRef.current = {
                attempts: 1,
                firstAttemptTime: now,
                lockedUntil: 0,
            };
            return true;
        }

        // Increment attempts
        state.attempts++;

        // Check if should lock
        if (state.attempts >= maxAttempts) {
            state.lockedUntil = now + lockoutMs;
            setIsLocked(true);
            setRemainingTime(Math.ceil(lockoutMs / 1000));
            return false;
        }

        return true;
    }, [maxAttempts, windowMs, lockoutMs]);

    // Reset on successful auth
    const reset = useCallback(() => {
        stateRef.current = {
            attempts: 0,
            firstAttemptTime: 0,
            lockedUntil: 0,
        };
        setIsLocked(false);
        setRemainingTime(0);
    }, []);

    // Update remaining time periodically when locked
    useEffect(() => {
        if (!isLocked) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const state = stateRef.current;

            if (state.lockedUntil <= now) {
                setIsLocked(false);
                setRemainingTime(0);
                clearInterval(interval);
            } else {
                setRemainingTime(Math.ceil((state.lockedUntil - now) / 1000));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isLocked]);

    // Check lock on mount
    useEffect(() => {
        checkLock();
    }, [checkLock]);

    return {
        isLocked,
        remainingTime,
        recordAttempt,
        reset,
        checkLock,
        attemptsRemaining: maxAttempts - stateRef.current.attempts,
    };
}

/**
 * Format remaining lockout time for display
 */
export function formatLockoutTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} δευτερόλεπτα`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} λεπτά`;
}
