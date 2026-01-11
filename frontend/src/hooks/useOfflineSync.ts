import { useEffect } from 'react';
import { syncAllData } from '../services/syncManager';

export function useOfflineSync() {
    useEffect(() => {
        const handleOnline = () => {
            console.log('Online detected, syncing...');
            syncAllData();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    return {};
}
