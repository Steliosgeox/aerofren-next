'use client';

import React from 'react';

interface AuthSocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AuthSocialButton({
  children,
  className = '',
  type = 'button',
  ...props
}: AuthSocialButtonProps) {
  return (
    <button
      type={type}
      className={`auth-social-btn w-full flex items-center justify-center gap-3 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-hover)] border-none rounded-xl py-3.5 px-6 cursor-pointer transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_28px_rgba(0,0,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
