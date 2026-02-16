/**
 * Type definitions for authenticated requests
 */

import { Request } from 'express';

/**
 * Extended Request interface with authenticated user data
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        displayName?: string;
    };
}
