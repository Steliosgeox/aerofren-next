/**
 * Admin email whitelist — single source of truth
 *
 * Used by:
 * - AuthContext.tsx (client-side admin check)
 * - firebase-admin.ts (server-side admin check fallback)
 *
 * NOTE: Firestore security rules (firestore.rules) maintain their own copy
 * and must be updated separately when this list changes.
 */
const ADMIN_EMAILS: readonly string[] = [
    "info@aerofren.gr",
    "admin@aerofren.gr",
    "gamerspcexperts@gmail.com",
] as const;

/**
 * Check if an email address belongs to an admin user.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
    return email ? ADMIN_EMAILS.includes(email) : false;
}
