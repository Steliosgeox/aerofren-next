/**
 * AEROFREN Auth Context
 * Provides Firebase Authentication state across the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';

// Admin email whitelist - add authorized admin emails here
const ADMIN_EMAILS = [
    'info@aerofren.gr',
    'admin@aerofren.gr',
    'gamerspcexperts@gmail.com',
    // Add more admin emails as needed
];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Check if user is admin
    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

    // Only run on client
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Dynamic import to avoid SSR issues
        const initAuth = async () => {
            try {
                const { getFirebaseAuth, onAuthStateChanged } = await import('@/lib/firebase');
                const auth = getFirebaseAuth();
                const unsubscribe = onAuthStateChanged(auth,
                    (firebaseUser) => {
                        setUser(firebaseUser);
                        setLoading(false);
                    },
                    (error) => {
                        // Handle auth state change errors (e.g., configuration-not-found)
                        console.warn('Firebase Auth listener error:', error.message);
                        setUser(null);
                        setLoading(false);
                    }
                );
                return unsubscribe;
            } catch (error) {
                console.warn('Auth init error (non-fatal):', error);
                setUser(null);
                setLoading(false);
                return () => { };
            }
        };

        let unsubscribe: (() => void) | undefined;
        initAuth().then((unsub) => {
            unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [mounted]);

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/lib/firebase');
            await firebaseSignInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const { signOut: firebaseSignOut } = await import('@/lib/firebase');
            await firebaseSignOut();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading: !mounted || loading,
        isAdmin,
        signInWithGoogle,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Default values for when AuthProvider is not available (SSR)
const defaultAuthContext: AuthContextType = {
    user: null,
    loading: true,
    isAdmin: false,
    signInWithGoogle: async () => { },
    signOut: async () => { },
};

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    // Return default context during SSR when AuthProvider is not mounted
    if (context === undefined) {
        return defaultAuthContext;
    }
    return context;
}

export default AuthContext;
