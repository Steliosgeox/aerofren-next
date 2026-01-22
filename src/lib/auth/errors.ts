/**
 * Auth Error Handling
 * Type-safe Firebase error handling with Greek translations
 */

// Firebase Auth error codes
export type FirebaseAuthErrorCode =
    | 'auth/invalid-credential'
    | 'auth/invalid-email'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/email-already-in-use'
    | 'auth/weak-password'
    | 'auth/operation-not-allowed'
    | 'auth/too-many-requests'
    | 'auth/network-request-failed'
    | 'auth/popup-closed-by-user'
    | 'auth/popup-blocked'
    | 'auth/cancelled-popup-request'
    | 'auth/requires-recent-login'
    | 'auth/credential-already-in-use'
    | 'auth/account-exists-with-different-credential';

// Firebase error shape
interface FirebaseError {
    code: string;
    message: string;
}

// Type guard for Firebase errors
export function isFirebaseError(error: unknown): error is FirebaseError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as FirebaseError).code === 'string'
    );
}

// Error message translations (Greek)
const errorMessages: Record<string, string> = {
    // Sign in errors
    'auth/invalid-credential': 'Λάθος email ή κωδικός.',
    'auth/invalid-email': 'Μη έγκυρη διεύθυνση email.',
    'auth/user-disabled': 'Ο λογαριασμός έχει απενεργοποιηθεί.',
    'auth/user-not-found': 'Δεν υπάρχει λογαριασμός με αυτό το email.',
    'auth/wrong-password': 'Λάθος κωδικός πρόσβασης.',

    // Sign up errors
    'auth/email-already-in-use': 'Το email χρησιμοποιείται ήδη.',
    'auth/weak-password': 'Ο κωδικός είναι πολύ αδύναμος.',
    'auth/operation-not-allowed': 'Αυτή η μέθοδος σύνδεσης δεν είναι ενεργοποιημένη.',

    // Rate limiting
    'auth/too-many-requests': 'Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά αργότερα.',

    // Network errors
    'auth/network-request-failed': 'Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας.',

    // Popup errors
    'auth/popup-closed-by-user': 'Το παράθυρο σύνδεσης έκλεισε.',
    'auth/popup-blocked': 'Το παράθυρο σύνδεσης μπλοκαρίστηκε. Ενεργοποιήστε τα popups.',
    'auth/cancelled-popup-request': 'Η σύνδεση ακυρώθηκε.',

    // Session errors
    'auth/requires-recent-login': 'Χρειάζεται νέα σύνδεση για αυτή την ενέργεια.',

    // Account errors
    'auth/credential-already-in-use': 'Αυτά τα διαπιστευτήρια χρησιμοποιούνται ήδη.',
    'auth/account-exists-with-different-credential':
        'Υπάρχει ήδη λογαριασμός με αυτό το email με διαφορετική μέθοδο σύνδεσης.',
};

// Default error message
const DEFAULT_ERROR = 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.';

/**
 * Get user-friendly error message from Firebase error
 */
export function getAuthErrorMessage(error: unknown): string {
    if (isFirebaseError(error)) {
        return errorMessages[error.code] || DEFAULT_ERROR;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return errorMessages['auth/network-request-failed'];
    }

    return DEFAULT_ERROR;
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
    return isFirebaseError(error) && error.code === 'auth/too-many-requests';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (isFirebaseError(error) && error.code === 'auth/network-request-failed') {
        return true;
    }
    return error instanceof TypeError && error.message.includes('fetch');
}

/**
 * Check if user should retry with different credentials
 */
export function isCredentialError(error: unknown): boolean {
    if (!isFirebaseError(error)) return false;
    return [
        'auth/invalid-credential',
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/invalid-email',
    ].includes(error.code);
}
