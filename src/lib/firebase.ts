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
import { getFirestore, Firestore, collection, addDoc, query, where, orderBy, getDocs, Timestamp, DocumentData, doc, updateDoc, setDoc, getCountFromServer } from 'firebase/firestore';

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

// =====================================
// ESCALATION SYSTEM
// =====================================

const ESCALATED_COLLECTION = 'escalatedChats';

// Escalated chat interface
export interface EscalatedChat {
    id?: string;
    sessionId: string;
    userId: string;
    userEmail: string;
    userName: string;
    escalatedAt: Timestamp;
    status: 'pending' | 'in_progress' | 'resolved';
    resolvedAt?: Timestamp;
    resolvedBy?: string;
}

/**
 * Escalate a chat session to human support
 * Creates a record in the escalatedChats collection
 */
export async function escalateChat(sessionId: string, user: User): Promise<boolean> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.warn('Firebase not configured - cannot escalate chat');
            return false;
        }

        // Create escalation record
        const escalation: Omit<EscalatedChat, 'id'> = {
            sessionId,
            userId: user.uid,
            userEmail: user.email || 'Unknown',
            userName: user.displayName || 'Unknown User',
            escalatedAt: Timestamp.now(),
            status: 'pending',
        };

        await setDoc(doc(firestore, ESCALATED_COLLECTION, sessionId), escalation);

        // Also mark the chat session's messages as escalated
        // This updates the most recent message to flag the session
        const messagesQuery = query(
            collection(firestore, CHATS_COLLECTION),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(messagesQuery);
        if (!snapshot.empty) {
            const latestDoc = snapshot.docs[0];
            await updateDoc(doc(firestore, CHATS_COLLECTION, latestDoc.id), {
                isEscalated: true,
                escalatedAt: Timestamp.now(),
            });
        }

        return true;
    } catch (error) {
        console.error('Error escalating chat:', error);
        return false;
    }
}

/**
 * Get all escalated chats for admin
 */
export async function getEscalatedChats(): Promise<EscalatedChat[]> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return [];
        }

        const q = query(
            collection(firestore, ESCALATED_COLLECTION),
            orderBy('escalatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const escalations: EscalatedChat[] = [];

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data() as DocumentData;
            escalations.push({
                id: docSnapshot.id,
                sessionId: data.sessionId,
                userId: data.userId,
                userEmail: data.userEmail,
                userName: data.userName,
                escalatedAt: data.escalatedAt,
                status: data.status,
                resolvedAt: data.resolvedAt,
                resolvedBy: data.resolvedBy,
            });
        });

        return escalations;
    } catch (error) {
        console.error('Error fetching escalated chats:', error);
        return [];
    }
}

/**
 * Mark an escalated chat as resolved
 */
export async function resolveEscalatedChat(sessionId: string, adminEmail: string): Promise<boolean> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return false;
        }

        await updateDoc(doc(firestore, ESCALATED_COLLECTION, sessionId), {
            status: 'resolved',
            resolvedAt: Timestamp.now(),
            resolvedBy: adminEmail,
        });

        return true;
    } catch (error) {
        console.error('Error resolving escalated chat:', error);
        return false;
    }
}

/**
 * Update escalated chat status
 */
export async function updateEscalationStatus(
    sessionId: string,
    status: 'pending' | 'in_progress' | 'resolved'
): Promise<boolean> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return false;
        }

        await updateDoc(doc(firestore, ESCALATED_COLLECTION, sessionId), { status });
        return true;
    } catch (error) {
        console.error('Error updating escalation status:', error);
        return false;
    }
}

// =====================================
// ADMIN STATS
// =====================================

export interface AdminStats {
    totalChats: number;
    escalatedChats: number;
    pendingEscalations: number;
    uniqueUsers: number;
    todayChats: number;
}

/**
 * Get admin dashboard statistics from Firebase
 */
export async function getAdminStats(): Promise<AdminStats> {
    try {
        const firestore = getFirestoreDb();

        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            return {
                totalChats: 0,
                escalatedChats: 0,
                pendingEscalations: 0,
                uniqueUsers: 0,
                todayChats: 0,
            };
        }

        // Get all chat messages
        const chatsQuery = query(collection(firestore, CHATS_COLLECTION));
        const chatSnapshot = await getDocs(chatsQuery);

        // Get all escalations
        const escalationsQuery = query(collection(firestore, ESCALATED_COLLECTION));
        const escalationSnapshot = await getDocs(escalationsQuery);

        // Calculate stats
        const sessionIds = new Set<string>();
        const userIds = new Set<string>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let todayChats = 0;

        chatSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            sessionIds.add(data.sessionId);
            if (data.userId) {
                userIds.add(data.userId);
            }
            // Count today's messages
            const msgDate = data.timestamp?.toDate();
            if (msgDate && msgDate >= today) {
                todayChats++;
            }
        });

        // Count pending escalations
        let pendingEscalations = 0;
        escalationSnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (data.status === 'pending') {
                pendingEscalations++;
            }
        });

        return {
            totalChats: sessionIds.size,
            escalatedChats: escalationSnapshot.size,
            pendingEscalations,
            uniqueUsers: userIds.size,
            todayChats,
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
            totalChats: 0,
            escalatedChats: 0,
            pendingEscalations: 0,
            uniqueUsers: 0,
            todayChats: 0,
        };
    }
}

// Extended ChatSessionInfo with escalation status
export interface ChatSessionInfoExtended extends ChatSessionInfo {
    isEscalated?: boolean;
    escalationStatus?: 'pending' | 'in_progress' | 'resolved';
}

/**
 * Get all chat sessions with escalation status (for admin use)
 */
export async function getAllChatSessionsWithEscalation(): Promise<ChatSessionInfoExtended[]> {
    try {
        const [sessions, escalations] = await Promise.all([
            getAllChatSessions(),
            getEscalatedChats(),
        ]);

        const escalationMap = new Map<string, EscalatedChat>();
        escalations.forEach((e) => escalationMap.set(e.sessionId, e));

        return sessions.map((session) => {
            const escalation = escalationMap.get(session.sessionId);
            return {
                ...session,
                isEscalated: !!escalation,
                escalationStatus: escalation?.status,
            };
        });
    } catch (error) {
        console.error('Error fetching sessions with escalation:', error);
        return [];
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
