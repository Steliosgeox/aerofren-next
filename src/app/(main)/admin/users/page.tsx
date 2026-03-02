import { AdminLayout } from '@/components/admin';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
    return (
        <AdminLayout title="Χρήστες">
            <div
                className="rounded-2xl p-16 text-center"
                style={{
                    background: 'var(--theme-glass-bg)',
                    border: '1px solid var(--theme-glass-border)',
                }}
            >
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--theme-text-muted)' }} />
                <p className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Σύντομα διαθέσιμο</p>
                <p className="text-sm mt-1" style={{ color: 'var(--theme-text-muted)' }}>
                    Η διαχείριση χρηστών θα είναι διαθέσιμη σε επόμενη έκδοση.
                </p>
            </div>
        </AdminLayout>
    );
}
