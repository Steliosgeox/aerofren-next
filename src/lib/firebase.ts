/**
 * Firebase Configuration for AEROFREN
 * Handles Firebase Auth + Firestore for chat message persistence
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, Firestore, collection, Timestamp, doc, increment, writeBatch } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
    // Validate config before initialization
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.warn('Firebase is not configured. Auth features will be disabled.');
    }
    if (!app && getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else if (!app) {
        app = getApps()[0];
    }
    return app;
}

// Auth exports
export function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
    try {
        const auth = getFirebaseAuth();
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
}

export async function signOut(): Promise<void> {
    try {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
): Promise<User | null> {
    try {
        const auth = getFirebaseAuth();
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name if provided
        if (displayName && result.user) {
            await updateProfile(result.user, { displayName });
        }

        return result.user;
    } catch (error) {
        console.error('Email sign-up error:', error);
        throw error;
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<User | null> {
    try {
        const auth = getFirebaseAuth();
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Email sign-in error:', error);
        throw error;
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        const auth = getFirebaseAuth();
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

export { onAuthStateChanged };
export type { User };
export type ChatUser = {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
};

// Firestore exports
export function getFirestoreDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}

// Chat message interface
export interface ChatMessage {
    id?: string;
    sessionId: string;
    userId?: string; // Firebase Auth user ID (null for anonymous users)
    userEmail?: string; // User email for admin display
    userName?: string; // User display name
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
    expiresAt: Timestamp; // For 3-month retention policy
}

// Collection name
const CHATS_COLLECTION = 'chatMessages';

/**
 * Save a chat message to Firestore
 */
export async function saveChatMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    user?: ChatUser | null
): Promise<string | null> {
    try {
        const firestore = getFirestoreDb();

        // If Firebase is not configured, skip saving
        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.warn('Firebase not configured - skipping message save');
            return null;
        }

        const now = Timestamp.now();
        // Set expiration to 3 months from now
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        // Build message object - only include defined fields
        // Firestore doesn't accept undefined values
        const message: Record<string, unknown> = {
            sessionId,
            role,
            content,
            timestamp: now,
            expiresAt: Timestamp.fromDate(threeMonthsFromNow),
        };

        // Only add user fields if they exist
        if (user?.uid) message.userId = user.uid;
        if (user?.email) message.userEmail = user.email;
        if (user?.displayName) message.userName = user.displayName;

        // Batch write: message + session aggregate in one network round-trip (atomic)
        const batch = writeBatch(firestore);

        const msgRef = doc(collection(firestore, CHATS_COLLECTION));
        batch.set(msgRef, message);

        const sessionRef = doc(firestore, 'chatSessions', sessionId);
        batch.set(sessionRef, {
            sessionId,
            lastMessageAt: now,
            messageCount: increment(1),
            ...(user?.uid ? { userId: user.uid } : {}),
            ...(user?.email ? { userEmail: user.email } : {}),
            ...(user?.displayName ? { userName: user.displayName } : {}),
        }, { merge: true });

        await batch.commit();

        return msgRef.id;
    } catch (error) {
        console.error('Error saving chat message:', error);
        return null;
    }
}

