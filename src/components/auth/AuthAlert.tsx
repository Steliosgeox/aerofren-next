'use client';

import React from 'react';

type AuthAlertVariant = 'warning' | 'error';

interface AuthAlertProps {
  variant: AuthAlertVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function AuthAlert({ variant, children, icon, className = '' }: AuthAlertProps) {
  return (
    <div className={`auth-alert auth-alert--${variant} ${className}`.trim()} role="alert">
      {icon ? <span className="auth-alert__icon" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </div>
  );
}
