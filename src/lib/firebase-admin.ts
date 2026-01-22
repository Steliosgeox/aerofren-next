/**
 * Firebase Admin SDK for Server-Side Operations
 *
 * Used for:
 * - Verifying ID tokens in API routes
 * - Admin operations (custom claims, user management)
 * - Server-side Firestore access with admin privileges
 *
 * IMPORTANT: Requires FIREBASE_SERVICE_ACCOUNT environment variable
 * containing the service account JSON (base64 encoded) or the JSON directly.
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Singleton instance
let adminApp: App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses service account from environment variable
 */
function getAdminApp(): App | null {
    if (adminApp) {
        return adminApp;
    }

    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return adminApp;
    }

    // Get service account from environment
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountEnv) {
        console.warn(
            'FIREBASE_SERVICE_ACCOUNT not configured. Server-side auth will be unavailable.'
        );
        return null;
    }

    try {
        // Try parsing as JSON directly, or decode from base64
        let serviceAccount: object;
        try {
            serviceAccount = JSON.parse(serviceAccountEnv);
        } catch {
            // Try base64 decode
            const decoded = Buffer.from(serviceAccountEnv, 'base64').toString('utf-8');
            serviceAccount = JSON.parse(decoded);
        }

        adminApp = initializeApp({
            credential: cert(serviceAccount as Parameters<typeof cert>[0]),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });

        return adminApp;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        return null;
    }
}

/**
 * Verify a Firebase ID token and return the decoded claims
 *
 * @param idToken - The ID token from client (from Authorization: Bearer <token>)
 * @returns Decoded token with user info, or null if invalid
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken | null> {
    const app = getAdminApp();
    if (!app) {
        return null;
    }

    try {
        const auth = getAuth(app);
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7);
}

/**
 * Check if a user has admin privileges
 * Uses custom claims (admin: true) or falls back to email whitelist
 */
export async function isUserAdmin(decodedToken: DecodedIdToken): Promise<boolean> {
    // First check custom claims
    if (decodedToken.admin === true) {
        return true;
    }

    // Fallback to email whitelist for backwards compatibility
    // This should be migrated to custom claims
    const ADMIN_EMAILS = [
        'info@aerofren.gr',
        'admin@aerofren.gr',
        'gamerspcexperts@gmail.com',
    ];

    return decodedToken.email ? ADMIN_EMAILS.includes(decodedToken.email) : false;
}

/**
 * Set admin custom claim for a user
 * Call this from a secure admin endpoint or Cloud Function
 */
export async function setAdminClaim(uid: string, isAdmin: boolean): Promise<boolean> {
    const app = getAdminApp();
    if (!app) {
        return false;
    }

    try {
        const auth = getAuth(app);
        await auth.setCustomUserClaims(uid, { admin: isAdmin });
        return true;
    } catch (error) {
        console.error('Failed to set admin claim:', error);
        return false;
    }
}

/**
 * Get Firestore instance with admin privileges
 */
export function getAdminFirestore() {
    const app = getAdminApp();
    if (!app) {
        return null;
    }
    return getFirestore(app);
}

// Export types
export type { DecodedIdToken };
