// Auth utilities barrel export
export { useAuthForm, INPUT_LIMITS, type AuthFormFields } from './useAuthForm';
export { useRateLimit, formatLockoutTime } from './rate-limit';
export {
    validateLogin,
    validateSignup,
    validateResetPassword,
    type LoginFormData,
    type SignupFormData,
    type ResetPasswordFormData,
} from './validation';
export {
    getAuthErrorMessage,
    isRateLimitError,
    isNetworkError,
    isCredentialError,
    isFirebaseError,
} from './errors';
