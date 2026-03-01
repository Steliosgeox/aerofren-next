/**
 * AEROFREN Auth Context
 * Provides Firebase Authentication state across the application
 */

'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useSyncExternalStore,
    ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { isAdminEmail } from '@/lib/admin-emails';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

interface AuthState {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_AUTH_STATE: AuthState = {
    user: null,
    loading: true,
};

const subscribeNoop = () => () => { };
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const mounted = useSyncExternalStore(
        subscribeNoop,
        getMountedSnapshot,
        getServerSnapshot,
    );
    const [authState, setAuthState] = useState<AuthState>(INITIAL_AUTH_STATE);
    const { user, loading } = authState;

    // Check if user is admin (uses shared utility)
    const isAdmin = isAdminEmail(user?.email);

    useEffect(() => {
        if (!mounted) return;

        // Dynamic import to avoid SSR issues
        const initAuth = async () => {
            try {
                const { getFirebaseAuth, onAuthStateChanged } = await import('@/lib/firebase');
                const auth = getFirebaseAuth();
                const unsubscribe = onAuthStateChanged(
                    auth,
                    (firebaseUser) => {
                        setAuthState({
                            user: firebaseUser,
                            loading: false,
                        });
                    },
                    (error) => {
                        // Handle auth state change errors (e.g., configuration-not-found)
                        console.warn('Firebase Auth listener error:', error.message);
                        setAuthState({
                            user: null,
                            loading: false,
                        });
                    }
                );
                return unsubscribe;
            } catch (error) {
                console.warn('Auth init error (non-fatal):', error);
                setAuthState({
                    user: null,
                    loading: false,
                });
                return () => { };
            }
        };

        let unsubscribe: (() => void) | undefined;
        let cancelled = false;
        initAuth().then((unsub) => {
            if (cancelled) {
                // Component unmounted before async init resolved — clean up immediately
                unsub();
                return;
            }
            unsubscribe = unsub;
        });

        return () => {
            cancelled = true;
            if (unsubscribe) unsubscribe();
        };
    }, [mounted]);

    const signInWithGoogle = async () => {
        try {
            setAuthState((previous) => ({ ...previous, loading: true }));
            const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/lib/firebase');
            await firebaseSignInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            setAuthState((previous) => ({ ...previous, loading: false }));
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setAuthState((previous) => ({ ...previous, loading: true }));
            const { signInWithEmail: firebaseSignInWithEmail } = await import('@/lib/firebase');
            await firebaseSignInWithEmail(email, password);
        } catch (error) {
            console.error('Email sign in error:', error);
            throw error;
        } finally {
            setAuthState((previous) => ({ ...previous, loading: false }));
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
        try {
            setAuthState((previous) => ({ ...previous, loading: true }));
            const { signUpWithEmail: firebaseSignUpWithEmail } = await import('@/lib/firebase');
            await firebaseSignUpWithEmail(email, password, displayName);
        } catch (error) {
            console.error('Email sign up error:', error);
            throw error;
        } finally {
            setAuthState((previous) => ({ ...previous, loading: false }));
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { resetPassword: firebaseResetPassword } = await import('@/lib/firebase');
            await firebaseResetPassword(email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            setAuthState((previous) => ({ ...previous, loading: true }));
            const { signOut: firebaseSignOut } = await import('@/lib/firebase');
            await firebaseSignOut();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        } finally {
            setAuthState((previous) => ({ ...previous, loading: false }));
        }
    };

    const value: AuthContextType = {
        user,
        loading: !mounted || loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
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
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    resetPassword: async () => { },
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
