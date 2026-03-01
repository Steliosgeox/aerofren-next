'use client';

import React from 'react';

interface AuthPrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingContent?: React.ReactNode;
}

export function AuthPrimaryButton({
  isLoading = false,
  loadingContent,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`auth-primary-btn w-full py-3.5 px-6 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] border-none rounded-xl text-base font-semibold text-white cursor-pointer transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_28px_rgba(0,0,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (loadingContent ?? children) : children}
    </button>
  );
}
