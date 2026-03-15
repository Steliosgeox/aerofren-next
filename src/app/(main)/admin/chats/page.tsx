'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminPageGuard } from '@/components/admin';
import { ChatwootWorkspace } from '@/components/admin/chats/chatwoot';

function AdminChatsWorkspacePage() {
    return (
        <AdminPageGuard>
            <ChatwootWorkspace />
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
