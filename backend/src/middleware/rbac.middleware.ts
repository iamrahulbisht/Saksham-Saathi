import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

 
export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role;

        if (!userRole) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
            });
            return;
        }

        next();
    };
};

 
export const requireTeacher = requireRole('teacher', 'admin');
export const requireTherapist = requireRole('therapist', 'admin');
export const requireParent = requireRole('parent', 'admin');
export const requireAdmin = requireRole('admin');
export const requireTeacherOrTherapist = requireRole('teacher', 'therapist', 'admin');
