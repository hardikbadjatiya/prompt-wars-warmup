import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        // Check for redirect result first
        getRedirectResult(auth)
            .then(async (result) => {
                if (result?.user) {
                    const token = await result.user.getIdToken();
                    setState({ user: result.user, token, loading: false, error: null });
                }
            })
            .catch((err) => {
                console.error('Redirect error:', err);
                setState(prev => ({ ...prev, loading: false, error: err.message }));
            });

        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                setState({ user, token, loading: false, error: null });
            } else {
                setState({ user: null, token: null, loading: false, error: null });
            }
        });
        return unsub;
    }, []);

    const login = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));
            // Use redirect instead of popup - works without authorized domain
            await signInWithRedirect(auth, googleProvider);
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: (err as Error).message,
            }));
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
        } catch (err) {
            setState(prev => ({ ...prev, error: (err as Error).message }));
        }
    }, []);

    return { ...state, login, logout };
}
