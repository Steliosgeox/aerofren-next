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
import { getFirestore, Firestore, collection, addDoc, query, orderBy, getDocs, Timestamp, DocumentData, doc, updateDoc, setDoc, increment } from 'firebase/firestore';

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

        const docRef = await addDoc(collection(firestore, CHATS_COLLECTION), message);

        // Update chat session aggregates for admin performance (best-effort)
        try {
            await setDoc(
                doc(firestore, 'chatSessions', sessionId),
                {
                    sessionId,
                    lastMessageAt: now,
                    messageCount: increment(1),
                    ...(user?.uid ? { userId: user.uid } : {}),
                    ...(user?.email ? { userEmail: user.email } : {}),
                    ...(user?.displayName ? { userName: user.displayName } : {}),
                },
                { merge: true }
            );
        } catch (sessionError) {
            console.warn('Failed to update chat session aggregate:', sessionError);
        }

        return docRef.id;
    } catch (error) {
        console.error('Error saving chat message:', error);
        return null;
    }
}

// =====================================
// CONTACT FORM
// =====================================

const CONTACTS_COLLECTION = 'contactSubmissions';

export interface ContactSubmission {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject?: string;
    message: string;
    submittedAt: Timestamp;
    ipAddress?: string;
    status: 'new' | 'read' | 'replied' | 'archived';
}

/**
 * Save a contact form submission to Firestore
 */
export async function saveContactSubmission(
    data: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'> & { ipAddress?: string }
): Promise<string | null> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.warn('Firebase not configured - cannot save contact submission');
            return null;
        }

        const submission: Omit<ContactSubmission, 'id'> = {
            name: data.name,
            email: data.email,
            message: data.message,
            submittedAt: Timestamp.now(),
            status: 'new',
        };

        // Only add optional fields if they exist
        if (data.phone) submission.phone = data.phone;
        if (data.company) submission.company = data.company;
        if (data.subject) submission.subject = data.subject;
        if (data.ipAddress) submission.ipAddress = data.ipAddress;

        const docRef = await addDoc(collection(firestore, CONTACTS_COLLECTION), submission);
        return docRef.id;
    } catch (error) {
        console.error('Error saving contact submission:', error);
        return null;
    }
}

/**
 * Get all contact submissions (for admin use)
 */
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return [];
        }

        const q = query(
            collection(firestore, CONTACTS_COLLECTION),
            orderBy('submittedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const submissions: ContactSubmission[] = [];

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data() as DocumentData;
            submissions.push({
                id: docSnapshot.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                subject: data.subject,
                message: data.message,
                submittedAt: data.submittedAt,
                ipAddress: data.ipAddress,
                status: data.status || 'new',
            });
        });

        return submissions;
    } catch (error) {
        console.error('Error fetching contact submissions:', error);
        return [];
    }
}

/**
 * Update contact submission status
 */
export async function updateContactStatus(
    submissionId: string,
    status: ContactSubmission['status']
): Promise<boolean> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return false;
        }

        await updateDoc(doc(firestore, CONTACTS_COLLECTION, submissionId), { status });
        return true;
    } catch (error) {
        console.error('Error updating contact status:', error);
        return false;
    }
}
