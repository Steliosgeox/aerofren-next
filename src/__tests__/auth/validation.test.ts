import { describe, it, expect } from 'vitest';
import {
    validateLogin,
    validateSignup,
    validateResetPassword,
    emailSchema,
    passwordSchema,
    strongPasswordSchema,
    displayNameSchema,
} from '@/lib/auth/validation';

describe('Email Validation', () => {
    it('accepts valid email addresses', () => {
        const validEmails = [
            'test@example.com',
            'user.name@domain.org',
            'user+tag@example.co.uk',
            'a@b.co',
        ];

        validEmails.forEach((email) => {
            const result = emailSchema.safeParse(email);
            expect(result.success).toBe(true);
        });
    });

    it('rejects invalid email addresses', () => {
        const invalidEmails = [
            '',
            'notanemail',
            '@nodomain.com',
            'no@domain',
            'spaces in@email.com',
            'missing@.com',
        ];

        invalidEmails.forEach((email) => {
            const result = emailSchema.safeParse(email);
            expect(result.success).toBe(false);
        });
    });

    it('normalizes email to lowercase and trims whitespace', () => {
        const result = emailSchema.safeParse('  TEST@EXAMPLE.COM  ');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('test@example.com');
        }
    });

    it('rejects emails longer than 254 characters', () => {
        const longEmail = 'a'.repeat(250) + '@b.com';
        const result = emailSchema.safeParse(longEmail);
        expect(result.success).toBe(false);
    });
});

describe('Password Validation', () => {
    it('accepts valid passwords', () => {
        const validPasswords = ['123456', 'password123', 'a'.repeat(128)];

        validPasswords.forEach((password) => {
            const result = passwordSchema.safeParse(password);
            expect(result.success).toBe(true);
        });
    });

    it('rejects passwords shorter than 6 characters', () => {
        const shortPasswords = ['', '12345', 'abc'];

        shortPasswords.forEach((password) => {
            const result = passwordSchema.safeParse(password);
            expect(result.success).toBe(false);
        });
    });

    it('rejects passwords longer than 128 characters', () => {
        const longPassword = 'a'.repeat(129);
        const result = passwordSchema.safeParse(longPassword);
        expect(result.success).toBe(false);
    });
});

describe('Strong Password Validation', () => {
    it('accepts passwords with letters and numbers', () => {
        const validPasswords = ['abcd1234', 'Password1', '1a2b3c4d'];

        validPasswords.forEach((password) => {
            const result = strongPasswordSchema.safeParse(password);
            expect(result.success).toBe(true);
        });
    });

    it('rejects passwords without letters', () => {
        const result = strongPasswordSchema.safeParse('123456');
        expect(result.success).toBe(false);
    });

    it('rejects passwords without numbers', () => {
        const result = strongPasswordSchema.safeParse('abcdef');
        expect(result.success).toBe(false);
    });
});

describe('Display Name Validation', () => {
    it('accepts valid names', () => {
        const validNames = ['John', 'Μαρία', 'John Doe', ''];

        validNames.forEach((name) => {
            const result = displayNameSchema.safeParse(name);
            expect(result.success).toBe(true);
        });
    });

    it('sanitizes XSS-prone characters', () => {
        const dangerousNames = [
            '<script>alert("xss")</script>',
            'John"><img src=x onerror=alert(1)>',
            "O'Brien",
            'Test & Co',
            'Name\\with\\backslashes',
        ];

        dangerousNames.forEach((name) => {
            const result = displayNameSchema.safeParse(name);
            expect(result.success).toBe(true);
            if (result.success && result.data) {
                // Should not contain dangerous characters
                expect(result.data).not.toMatch(/[<>'"&\\]/);
            }
        });
    });

    it('normalizes whitespace', () => {
        const result = displayNameSchema.safeParse('  John    Doe  ');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('John Doe');
        }
    });

    it('rejects names longer than 100 characters', () => {
        const longName = 'a'.repeat(101);
        const result = displayNameSchema.safeParse(longName);
        expect(result.success).toBe(false);
    });
});

describe('Login Validation', () => {
    it('validates correct login data', () => {
        const result = validateLogin({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('returns errors for missing email', () => {
        const result = validateLogin({
            email: '',
            password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.email).toBeDefined();
    });

    it('returns errors for missing password', () => {
        const result = validateLogin({
            email: 'test@example.com',
            password: '',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.password).toBeDefined();
    });

    it('returns errors for invalid email format', () => {
        const result = validateLogin({
            email: 'notanemail',
            password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.email).toBeDefined();
    });
});

describe('Signup Validation', () => {
    it('validates correct signup data', () => {
        const result = validateSignup({
            name: 'John Doe',
            email: 'test@example.com',
            password: 'password1',
            confirmPassword: 'password1',
        });

        expect(result.success).toBe(true);
        expect(result.data?.email).toBe('test@example.com');
    });

    it('allows empty name (optional)', () => {
        const result = validateSignup({
            email: 'test@example.com',
            password: 'password1',
            confirmPassword: 'password1',
        });

        expect(result.success).toBe(true);
    });

    it('returns error when passwords do not match', () => {
        const result = validateSignup({
            email: 'test@example.com',
            password: 'password1',
            confirmPassword: 'different',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.confirmPassword).toBeDefined();
    });

    it('returns error for weak password (no letters)', () => {
        const result = validateSignup({
            email: 'test@example.com',
            password: '123456',
            confirmPassword: '123456',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.password).toBeDefined();
    });

    it('returns error for weak password (no numbers)', () => {
        const result = validateSignup({
            email: 'test@example.com',
            password: 'abcdef',
            confirmPassword: 'abcdef',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.password).toBeDefined();
    });

    it('sanitizes name field to prevent XSS', () => {
        const result = validateSignup({
            name: '<script>alert("xss")</script>',
            email: 'test@example.com',
            password: 'password1',
            confirmPassword: 'password1',
        });

        expect(result.success).toBe(true);
        if (result.success && result.data?.name) {
            expect(result.data.name).not.toContain('<script>');
            expect(result.data.name).not.toContain('<');
            expect(result.data.name).not.toContain('>');
        }
    });
});

describe('Reset Password Validation', () => {
    it('validates correct email', () => {
        const result = validateResetPassword({
            email: 'test@example.com',
        });

        expect(result.success).toBe(true);
        expect(result.data?.email).toBe('test@example.com');
    });

    it('returns error for invalid email', () => {
        const result = validateResetPassword({
            email: 'notanemail',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.email).toBeDefined();
    });

    it('returns error for empty email', () => {
        const result = validateResetPassword({
            email: '',
        });

        expect(result.success).toBe(false);
        expect(result.errors?.email).toBeDefined();
    });
});
