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
        // In development mode, allow unauthenticated requests
        if (process.env.NODE_ENV === 'development') {
            (req as any).uid = 'dev-user';
            next();
            return;
        }
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        (req as any).uid = decoded.uid;
        next();
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
