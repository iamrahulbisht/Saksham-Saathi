import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as studentService from '../services/student.service';

 
export const createStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const teacherId = req.user?.userId;
        const { name, age, grade, parentEmails, languagePreference } = req.body;

        if (!teacherId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const student = await studentService.createStudent(teacherId, {
            name,
            age,
            grade,
            parentEmails,
            languagePreference,
        });

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: { student },
        });
    } catch (error) {
        next(error);
    }
};

 
export const getStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { studentId } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

         
        const hasAccess = await studentService.hasAccessToStudent(userId, userRole, studentId);
        if (!hasAccess) {
            res.status(403).json({ success: false, message: 'Access denied to this student' });
            return;
        }

        const student = await studentService.getStudentById(studentId);
        if (!student) {
            res.status(404).json({ success: false, message: 'Student not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: { student },
        });
    } catch (error) {
        next(error);
    }
};

 
export const getMyStudents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        let students: { studentId: string; name: string; age: number; grade: number; screeningStatus: string; languagePreference: string; assignedTeacherId: string | null; assignedTherapistId: string | null; dyslexiaRisk: number | null; adhdRisk: number | null; asdRisk: number | null; createdAt: Date }[] = [];

        switch (userRole) {
            case 'teacher':
                students = await studentService.getStudentsByTeacher(userId);
                break;
            case 'therapist':
                students = await studentService.getStudentsByTherapist(userId);
                break;
            case 'parent':
                students = await studentService.getStudentsByParent(userId);
                break;
            case 'admin':
                 
                students = [];
                break;
            default:
                res.status(403).json({ success: false, message: 'Role not authorized to view students' });
                return;
        }

        res.status(200).json({
            success: true,
            data: { students, count: students.length },
        });
    } catch (error) {
        next(error);
    }
};

 
export const assignTherapist = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { studentId } = req.params;
        const { therapistId } = req.body;
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

         
        if (userRole !== 'admin') {
            const hasAccess = await studentService.hasAccessToStudent(userId, userRole, studentId);
            if (!hasAccess) {
                res.status(403).json({ success: false, message: 'Access denied' });
                return;
            }
        }

        const student = await studentService.assignTherapist(studentId, therapistId);

        res.status(200).json({
            success: true,
            message: 'Therapist assigned successfully',
            data: { student },
        });
    } catch (error) {
        next(error);
    }
};
