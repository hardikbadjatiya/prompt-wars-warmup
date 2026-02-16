import React from 'react';

interface LoginScreenProps {
    onLogin: () => void;
    loading: boolean;
    error: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loading, error }) => {
    return (
        <div className="login-screen" role="main" aria-label="Login Screen">
            {/* Animated background grid */}
            <div className="login-bg-grid" aria-hidden="true">
                {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="grid-cell" style={{ animationDelay: `${Math.random() * 3}s` }} />
                ))}
            </div>

            <div className="login-card" role="dialog" aria-labelledby="login-title">
                {/* Glow ring */}
                <div className="login-glow" aria-hidden="true" />

                {/* Logo */}
                <div className="login-logo" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="36" stroke="url(#grad)" strokeWidth="3" opacity="0.6" />
                        <circle cx="40" cy="40" r="24" stroke="url(#grad)" strokeWidth="2" opacity="0.4" />
                        <circle cx="40" cy="40" r="12" fill="url(#grad)" opacity="0.8" />
                        <path d="M40 4 L44 20 L40 16 L36 20 Z" fill="#00F5FF" opacity="0.8" />
                        <path d="M76 40 L60 44 L64 40 L60 36 Z" fill="#FF00E5" opacity="0.8" />
                        <path d="M40 76 L36 60 L40 64 L44 60 Z" fill="#39FF14" opacity="0.8" />
                        <path d="M4 40 L20 36 L16 40 L20 44 Z" fill="#00F5FF" opacity="0.8" />
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="80" y2="80">
                                <stop offset="0%" stopColor="#00F5FF" />
                                <stop offset="50%" stopColor="#FF00E5" />
                                <stop offset="100%" stopColor="#39FF14" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h1 id="login-title" className="login-title">
                    <span className="title-area">AREA</span>
                    <span className="title-control">CONTROL</span>
                    <span className="title-loop">LOOP</span>
                </h1>

                <p className="login-subtitle">
                    Reimagined Childhood Territory Game — 2026 Edition
                </p>

                <p className="login-desc">
                    Walk. Capture. Dominate. AI-powered territory control in the real world.
                </p>

                <button
                    id="google-login-btn"
                    className="login-btn"
                    onClick={onLogin}
                    disabled={loading}
                    aria-label="Sign in with Google"
                    aria-busy={loading}
                >
                    {loading ? (
                        <span className="login-spinner" aria-hidden="true" />
                    ) : (
                        <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    <span>{loading ? 'Signing in…' : 'Sign in with Google'}</span>
                </button>

                {error && (
                    <p className="login-error" role="alert" aria-live="assertive">
                        {error}
                    </p>
                )}

                <p className="login-footer">
                    Powered by Google Maps • Gemini AI • Firebase
                </p>
            </div>
        </div>
    );
};
