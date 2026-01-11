import { SyncRepository } from '../repositories/sync.repository';

const syncRepo = new SyncRepository();

export class SyncService {
    async processQueue() {
        // Process offline items
    }
}
