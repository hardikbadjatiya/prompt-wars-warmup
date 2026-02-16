import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS env var or default credentials)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || undefined,
    });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        // In development mode, allow unauthenticated requests with demo user
        if (process.env.NODE_ENV === 'development') {
            (req as any).user = { uid: 'dev-user', email: 'dev@example.com' };
            next();
            return;
        }
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Allow demo token for testing
    if (token === 'demo-token') {
        (req as any).user = { uid: 'demo-user', email: 'demo@example.com' };
        next();
        return;
    }

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        (req as any).user = {
            uid: decoded.uid,
            email: decoded.email,
            displayName: decoded.name,
        };
        next();
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
