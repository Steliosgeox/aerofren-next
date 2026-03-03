/**
 * Shared formatting utilities
 */

/**
 * Format a timestamp for display in Greek locale (dd/mm, hh:mm)
 */
export function formatTime(ts: string | Date | null | undefined): string {
    const d = typeof ts === 'string' ? new Date(ts) : ts instanceof Date ? ts : new Date();
    return d.toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
