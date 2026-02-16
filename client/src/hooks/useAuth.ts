import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
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
            await signInWithPopup(auth, googleProvider);
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
