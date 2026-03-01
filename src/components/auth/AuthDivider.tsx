'use client';

import React from 'react';

interface AuthDividerProps {
  text?: string;
  className?: string;
}

export function AuthDivider({ text = 'ή', className = '' }: AuthDividerProps) {
  return (
    <div className={`auth-divider flex items-center w-full my-5 gap-3.5 ${className}`.trim()}>
      <div className="flex-1 h-px bg-[var(--theme-glass-border)]" />
      <span className="text-[var(--theme-text-muted)] text-[0.8125rem] font-medium">{text}</span>
      <div className="flex-1 h-px bg-[var(--theme-glass-border)]" />
    </div>
  );
}
