import prisma from '../config/database';

export class SyncRepository {
    async addToQueue(item: any) {
        // prisma.syncQueue.create...
    }
}
