import prisma from '../config/database';

export class InterventionRepository {
    async findAllActive() {
        return prisma.intervention.findMany({ where: { isActive: true } });
    }
}
