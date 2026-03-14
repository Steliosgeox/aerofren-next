'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAccessDenied } from './AdminAccessDenied';

interface AdminPageGuardProps {
    children: React.ReactNode;
}

export function AdminPageGuard({ children }: AdminPageGuardProps) {
    const { user, loading: authLoading, isAdmin } = useAuth();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        return <AdminAccessDenied />;
    }

    return <>{children}</>;
}
