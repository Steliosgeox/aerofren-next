/**
 * Auth Validation Schemas
 * Zod schemas for bulletproof input validation
 */

import { z } from 'zod';

// Email validation - stricter than basic regex
export const emailSchema = z
    .string()
    .min(1, 'Το email είναι υποχρεωτικό')
    .transform((email) => email.toLowerCase().trim())
    .pipe(
        z.string()
            .max(254, 'Το email είναι πολύ μεγάλο')
            .email('Μη έγκυρη διεύθυνση email')
    );

// Password validation
export const passwordSchema = z
    .string()
    .min(6, 'Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες')
    .max(128, 'Ο κωδικός είναι πολύ μεγάλος');

// Strong password validation (for signup)
export const strongPasswordSchema = z
    .string()
    .min(6, 'Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες')
    .max(128, 'Ο κωδικός είναι πολύ μεγάλος')
    .refine(
        (password) => /[a-zA-Z]/.test(password),
        'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα γράμμα'
    )
    .refine(
        (password) => /[0-9]/.test(password),
        'Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν αριθμό'
    );

// Display name validation - sanitized
export const displayNameSchema = z
    .string()
    .max(100, 'Το όνομα είναι πολύ μεγάλο')
    .transform((name) => {
        // Remove dangerous characters, keep only safe ones
        return name
            .trim()
            .replace(/[<>'"&\\]/g, '') // Remove XSS-prone chars
            .replace(/\s+/g, ' '); // Normalize whitespace
    })
    .optional();

// Login form schema
export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

// Signup form schema
export const signupSchema = z
    .object({
        name: displayNameSchema,
        email: emailSchema,
        password: strongPasswordSchema,
        confirmPassword: z.string().min(1, 'Επιβεβαιώστε τον κωδικό'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Οι κωδικοί δεν ταιριάζουν',
        path: ['confirmPassword'],
    });

// Password reset schema
export const resetPasswordSchema = z.object({
    email: emailSchema,
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Validation result type
export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
}

// Helper to extract errors from Zod result (compatible with v4)
function extractErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    const issues = error.issues || [];
    issues.forEach((issue) => {
        if (issue.path && issue.path[0]) {
            errors[issue.path[0] as string] = issue.message;
        }
    });
    return errors;
}

// Validate and return friendly errors
export function validateLogin(data: unknown): ValidationResult<LoginFormData> {
    const result = loginSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: extractErrors(result.error) };
}

export function validateSignup(data: unknown): ValidationResult<SignupFormData> {
    const result = signupSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: extractErrors(result.error) };
}

export function validateResetPassword(data: unknown): ValidationResult<ResetPasswordFormData> {
    const result = resetPasswordSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: extractErrors(result.error) };
}
