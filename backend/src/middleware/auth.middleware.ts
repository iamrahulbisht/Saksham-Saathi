import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth.service';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: { userId: string; role: string };
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token) as { userId: string; role: string };
        req.user = decoded; // Attach user to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

export const authenticate = authMiddleware;
export function authorize(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access forbidden' });
        }
        next();
    };
}
