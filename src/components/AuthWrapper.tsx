'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface AuthWrapperProps {
    children: ReactNode;
}

/**
 * AuthWrapper - Simple client wrapper for AuthProvider
 * AuthProvider handles its own mounting state internally
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
    // Always render AuthProvider - it handles mounting internally
    return <AuthProvider>{children}</AuthProvider>;
}
