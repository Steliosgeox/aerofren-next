'use client';

import React from 'react';
import { Eye, EyeOff, Mail, Lock, User, type LucideIcon } from 'lucide-react';

/**
 * AuthInput Component
 * 
 * Shared input component for authentication forms with:
 * - Icon rendering (Mail, Lock, User, Eye/EyeOff)
 * - Error state styling
 * - Password visibility toggle
 * - Input constraints enforcement
 */

export interface AuthInputProps {
    id: string;
    type: 'text' | 'email' | 'password';
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: 'mail' | 'lock' | 'user';
    maxLength: number;
    autoComplete?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    ariaDescribedBy?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
    mail: Mail,
    lock: Lock,
    user: User,
};

export function AuthInput({
    id,
    type,
    placeholder,
    value,
    onChange,
    icon,
    maxLength,
    autoComplete,
    error,
    disabled = false,
    required = false,
    showPasswordToggle = false,
    showPassword = false,
    onTogglePassword,
    ariaDescribedBy,
}: AuthInputProps) {
    const IconComponent = ICON_MAP[icon];
    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    return (
        <div className="auth-input-wrapper">
            <label htmlFor={id} className="sr-only">{placeholder}</label>
            <IconComponent size={18} className="auth-input-icon" aria-hidden="true" />
            <input
                id={id}
                type={inputType}
                className={`auth-input ${error ? 'auth-input--error' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                maxLength={maxLength}
                required={required}
                aria-invalid={!!error}
                aria-describedby={ariaDescribedBy}
                disabled={disabled}
                style={showPasswordToggle ? { paddingRight: '44px' } : undefined}
            />
            {showPasswordToggle && onTogglePassword && (
                <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={onTogglePassword}
                    aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                    disabled={disabled}
                >
                    {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                    ) : (
                        <Eye size={18} aria-hidden="true" />
                    )}
                </button>
            )}

            <style jsx>{`
                .auth-input-wrapper {
                    position: relative;
                    width: 100%;
                }

                .auth-input-wrapper :global(.auth-input-icon) {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
                    pointer-events: none;
                }

                .auth-input {
                    width: 100%;
                    padding: 14px 14px 14px 44px;
                    background: color-mix(in srgb, var(--theme-glass-bg) 85%, transparent);
                    border: 1px solid var(--theme-glass-border);
                    border-radius: 12px;
                    font-size: 0.9375rem;
                    color: var(--theme-text, #ffffff);
                    outline: none;
                    transition: all 0.2s;
                }

                .auth-input::placeholder {
                    color: color-mix(in srgb, var(--theme-text-muted) 85%, transparent);
                }

                .auth-input:focus {
                    border-color: color-mix(in srgb, var(--theme-accent) 55%, transparent);
                    background: color-mix(in srgb, var(--theme-glass-bg) 90%, transparent);
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent) 20%, transparent);
                }

                .auth-input--error {
                    border-color: rgba(239, 68, 68, 0.5);
                }

                .auth-input--error:focus {
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
                }

                .auth-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .auth-password-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-password-toggle:hover {
                    color: var(--theme-text, rgba(255, 255, 255, 0.8));
                }

                .auth-password-toggle:disabled {
                    cursor: not-allowed;
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `}</style>
        </div>
    );
}

export default AuthInput;
