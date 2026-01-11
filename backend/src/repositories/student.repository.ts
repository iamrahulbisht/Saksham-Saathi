import prisma from '../config/database';

export class StudentRepository {
    async create(data: any) {
        return prisma.student.create({ data });
    }

    async findAll(filter: any) {
        return prisma.student.findMany({ where: filter });
    }

    async findById(id: string) {
        return prisma.student.findUnique({ where: { id } });
    }
}
