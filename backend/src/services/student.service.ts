import { StudentRepository } from '../repositories/student.repository';

const studentRepo = new StudentRepository();

export class StudentService {
    async createStudent(data: any) {
        // Map frontend/controller fields to Schema fields
        const { assigned_teacher_id, ...rest } = data;
        const studentData = {
            ...rest,
            teacherId: assigned_teacher_id // logic to map if controller passed it, or just use what controller passed if fixed
        };
        // Controller passes assigned_teacher_id in mapped object? No controller did: { ...req.body, assigned_teacher_id: teacherId }
        // So we need to map it here.

        return studentRepo.create(studentData);
    }

    async getStudentById(id: string) {
        return studentRepo.findById(id);
    }

    async getStudentsByTeacher(teacherId: string) {
        return studentRepo.findAll({ teacherId: teacherId });
    }
}
