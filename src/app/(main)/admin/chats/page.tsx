'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminPageGuard } from '@/components/admin';
import { AdminTeamsWorkspace } from '@/components/admin/chats';

function AdminChatsWorkspacePage() {
    return (
        <AdminPageGuard>
            <AdminTeamsWorkspace />
        </AdminPageGuard>
    );
}

export default function AdminChatsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-solid)]">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--theme-accent)]" />
                </div>
            }
        >
            <AdminChatsWorkspacePage />
        </Suspense>
    );
}
