import prisma from '../config/database';

export class AssessmentRepository {
    async create(data: any) {
        return prisma.assessment.create({ data });
    }

    async updateStatus(id: string, status: any) {
        // Logic
        return null;
    }
}
