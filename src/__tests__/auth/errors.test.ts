import { describe, it, expect } from 'vitest';
import {
    isFirebaseError,
    getAuthErrorMessage,
    isRateLimitError,
    isNetworkError,
    isCredentialError,
} from '@/lib/auth/errors';

describe('isFirebaseError', () => {
    it('returns true for Firebase error objects', () => {
        const firebaseError = { code: 'auth/invalid-email', message: 'Invalid email' };
        expect(isFirebaseError(firebaseError)).toBe(true);
    });

    it('returns false for non-Firebase errors', () => {
        expect(isFirebaseError(new Error('Generic error'))).toBe(false);
        expect(isFirebaseError(null)).toBe(false);
        expect(isFirebaseError(undefined)).toBe(false);
        expect(isFirebaseError('string error')).toBe(false);
        expect(isFirebaseError({ message: 'no code' })).toBe(false);
    });
});

describe('getAuthErrorMessage', () => {
    it('returns Greek message for known Firebase errors', () => {
        const testCases = [
            { code: 'auth/invalid-credential', expected: 'Λάθος email ή κωδικός.' },
            { code: 'auth/invalid-email', expected: 'Μη έγκυρη διεύθυνση email.' },
            { code: 'auth/user-not-found', expected: 'Δεν υπάρχει λογαριασμός με αυτό το email.' },
            { code: 'auth/email-already-in-use', expected: 'Το email χρησιμοποιείται ήδη.' },
            { code: 'auth/too-many-requests', expected: 'Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά αργότερα.' },
            { code: 'auth/network-request-failed', expected: 'Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας.' },
        ];

        testCases.forEach(({ code, expected }) => {
            const error = { code, message: 'test' };
            expect(getAuthErrorMessage(error)).toBe(expected);
        });
    });

    it('returns default message for unknown errors', () => {
        const unknownError = { code: 'auth/unknown-error', message: 'test' };
        expect(getAuthErrorMessage(unknownError)).toBe('Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.');
    });

    it('returns default message for non-Firebase errors', () => {
        expect(getAuthErrorMessage(new Error('Generic'))).toBe('Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.');
        expect(getAuthErrorMessage(null)).toBe('Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.');
    });

    it('handles network TypeError errors', () => {
        const fetchError = new TypeError('Failed to fetch');
        expect(getAuthErrorMessage(fetchError)).toBe('Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας.');
    });
});

describe('isRateLimitError', () => {
    it('returns true for rate limit errors', () => {
        const error = { code: 'auth/too-many-requests', message: 'test' };
        expect(isRateLimitError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
        const error = { code: 'auth/invalid-email', message: 'test' };
        expect(isRateLimitError(error)).toBe(false);
        expect(isRateLimitError(new Error('test'))).toBe(false);
    });
});

describe('isNetworkError', () => {
    it('returns true for Firebase network errors', () => {
        const error = { code: 'auth/network-request-failed', message: 'test' };
        expect(isNetworkError(error)).toBe(true);
    });

    it('returns true for fetch TypeError', () => {
        const fetchError = new TypeError('Failed to fetch');
        expect(isNetworkError(fetchError)).toBe(true);
    });

    it('returns false for other errors', () => {
        const error = { code: 'auth/invalid-email', message: 'test' };
        expect(isNetworkError(error)).toBe(false);
    });
});

describe('isCredentialError', () => {
    it('returns true for credential-related errors', () => {
        const credentialErrors = [
            'auth/invalid-credential',
            'auth/wrong-password',
            'auth/user-not-found',
            'auth/invalid-email',
        ];

        credentialErrors.forEach((code) => {
            const error = { code, message: 'test' };
            expect(isCredentialError(error)).toBe(true);
        });
    });

    it('returns false for non-credential errors', () => {
        const error = { code: 'auth/too-many-requests', message: 'test' };
        expect(isCredentialError(error)).toBe(false);
    });
});
