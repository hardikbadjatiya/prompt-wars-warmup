/**
 * Type definitions for authenticated requests
 * This extends the Express Request interface globally
 */

declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                displayName?: string;
            };
        }
    }
}

export { };

