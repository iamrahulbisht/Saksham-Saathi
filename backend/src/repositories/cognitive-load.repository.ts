import prisma from '../config/database';

export class CognitiveLoadRepository {
    async saveEvent(event: any) {
        return prisma.cognitiveLoadEvent.create({ data: event });
    }
}
