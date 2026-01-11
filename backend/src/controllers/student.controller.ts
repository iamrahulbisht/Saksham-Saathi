import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';

const studentService = new StudentService();

export async function createStudent(req: Request, res: Response) {
    try {
        const teacherId = req.user!.userId; // From auth middleware
        const studentData = { ...req.body, assigned_teacher_id: teacherId };
        const student = await studentService.createStudent(studentData);
        res.json({ studentId: student.id, screeningStatus: (student as any).screeningStatus });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getStudent(req: Request, res: Response) {
    try {
        const student = await studentService.getStudentById(req.params.id);
        if (!student) return res.status(404).json({ error: "Student not found" });
        res.json(student);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getMyStudents(req: Request, res: Response) {
    try {
        const teacherId = req.user!.userId;
        const students = await studentService.getStudentsByTeacher(teacherId);
        res.json(students);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
