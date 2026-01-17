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
    User
} from 'firebase/auth';
import { getFirestore, Firestore, collection, addDoc, query, where, orderBy, getDocs, Timestamp, DocumentData } from 'firebase/firestore';

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

export { onAuthStateChanged };
export type { User };

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
    user?: User | null
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
        return docRef.id;
    } catch (error) {
        console.error('Error saving chat message:', error);
        return null;
    }
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
        const firestore = getFirestoreDb();

        // If Firebase is not configured, return empty array
        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.warn('Firebase not configured - returning empty history');
            return [];
        }

        const q = query(
            collection(firestore, CHATS_COLLECTION),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const messages: ChatMessage[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            messages.push({
                id: doc.id,
                sessionId: data.sessionId,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp,
                expiresAt: data.expiresAt,
            });
        });

        return messages;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
}

// Chat session info for admin
export interface ChatSessionInfo {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    messageCount: number;
    lastMessage: Date;
}

/**
 * Get all chat sessions (for admin use)
 */
export async function getAllChatSessions(): Promise<ChatSessionInfo[]> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return [];
        }

        const q = query(
            collection(firestore, CHATS_COLLECTION),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const sessionsMap = new Map<string, ChatSessionInfo>();

        querySnapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            const sessionId = data.sessionId;
            const timestamp = data.timestamp?.toDate() || new Date();

            if (sessionsMap.has(sessionId)) {
                const existing = sessionsMap.get(sessionId)!;
                existing.messageCount++;
                if (timestamp > existing.lastMessage) {
                    existing.lastMessage = timestamp;
                }
                // Update user info if available and not already set
                if (!existing.userId && data.userId) {
                    existing.userId = data.userId;
                    existing.userEmail = data.userEmail;
                    existing.userName = data.userName;
                }
            } else {
                sessionsMap.set(sessionId, {
                    sessionId,
                    userId: data.userId,
                    userEmail: data.userEmail,
                    userName: data.userName,
                    messageCount: 1,
                    lastMessage: timestamp,
                });
            }
        });

        return Array.from(sessionsMap.values()).sort(
            (a, b) => b.lastMessage.getTime() - a.lastMessage.getTime()
        );
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return [];
    }
}
