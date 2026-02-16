import { useState, useCallback } from 'react';

interface User {
    uid: string;
    displayName: string;
    photoURL: string | null;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>(() => {
        // Check localStorage for existing user
        const savedUser = localStorage.getItem('areaControlUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            return { user, token: 'demo-token', loading: false, error: null };
        }
        return { user: null, token: null, loading: false, error: null };
    });

    const login = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            // Simple username prompt
            const username = prompt('Enter your player name:') || 'Player';

            const user: User = {
                uid: `user-${Date.now()}`,
                displayName: username,
                photoURL: null,
            };

            // Save to localStorage
            localStorage.setItem('areaControlUser', JSON.stringify(user));

            setState({ user, token: 'demo-token', loading: false, error: null });
        } catch (err) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: (err as Error).message,
            }));
        }
    }, []);

    const logout = useCallback(async () => {
        localStorage.removeItem('areaControlUser');
        setState({ user: null, token: null, loading: false, error: null });
    }, []);

    return { ...state, login, logout };
}
