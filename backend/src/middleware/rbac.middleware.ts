import { Request, Response, NextFunction } from 'express';

export function roleCheck(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Logic to check req.user.role
        next();
    };
}
