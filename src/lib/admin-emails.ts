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
    "aerofren@gmail.com",
    "admin@aerofren.gr",
    "gamerspcexperts@gmail.com",
] as const;

/**
 * Check if an email address belongs to an admin user.
 * Case-insensitive: Google OAuth may return email in any casing
 * (e.g. GamersPCExperts@gmail.com vs gamerspcexperts@gmail.com).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}
