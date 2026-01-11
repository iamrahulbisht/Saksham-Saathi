import api from './api';
import { getUnsyncedItems, markAsSynced } from './indexedDB';

let isSyncing = false;

export async function syncAllData() {
    if (isSyncing || !navigator.onLine) return;
    isSyncing = true;

    try {
        const items = await getUnsyncedItems();
        if (items.length === 0) return;

        console.log(`Syncing ${items.length} items...`);

        for (const item of items) {
            try {
                // Replay request
                await api.request({
                    url: item.payload.url,
                    method: item.payload.method,
                    data: item.payload.data,
                    // Ensure we don't trigger offline interceptor loop
                    headers: { 'X-Sync-Request': 'true' }
                });

                if (item.id) {
                    await markAsSynced(item.id);
                }
            } catch (e) {
                console.error("Sync failed for item", item.id, e);
                // Increment retry or keep in queue
            }
        }
    } finally {
        isSyncing = false;
    }
}

// Listeners
if (typeof window !== 'undefined') {
    window.addEventListener('online', syncAllData);
    setInterval(syncAllData, 60000); // Poll every minute
}
