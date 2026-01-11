import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncAllData } from '../services/syncManager';
import { getUnsyncedItems } from '../services/indexedDB';

interface OfflineContextType {
    isOnline: boolean;
    isSyncing: boolean;
    unsyncedCount: number;
    triggerSync: () => Promise<void>;
}

export const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    useEffect(() => {
        const checkConnection = async () => {
            if (!navigator.onLine) {
                setIsOnline(false);
                return;
            }
            try {
                // Ping backend to confirm connectivity
                const apiUrl = import.meta.env.VITE_API_URL || '';
                const healthUrl = `${apiUrl.replace('/api/v1', '')}/health`;
                const res = await fetch(healthUrl);
                if (res.ok) {
                    setIsOnline(true);
                    syncAllData().then(updateUnsyncedCount);
                } else {
                    setIsOnline(false);
                }
            } catch (e) {
                setIsOnline(false);
            }
        };

        window.addEventListener('online', checkConnection);
        window.addEventListener('offline', () => setIsOnline(false));

        checkConnection();
        const interval = setInterval(() => {
            checkConnection();
            updateUnsyncedCount();
        }, 5000); // Check every 5s

        return () => {
            window.removeEventListener('online', checkConnection);
            window.removeEventListener('offline', () => setIsOnline(false));
            clearInterval(interval);
        };
    }, []);

    async function updateUnsyncedCount() {
        try {
            const items = await getUnsyncedItems();
            setUnsyncedCount(items.length);
        } catch (e) {
            console.error("Failed to count unsynced items", e);
        }
    }

    async function triggerSync() {
        if (!isOnline || isSyncing) return;

        setIsSyncing(true);
        try {
            await syncAllData();
            await updateUnsyncedCount();
        } finally {
            setIsSyncing(false);
        }
    }

    return (
        <OfflineContext.Provider value={{ isOnline, isSyncing, unsyncedCount, triggerSync }}>
            {children}
        </OfflineContext.Provider>
    );
}

export function useOffline() {
    const context = useContext(OfflineContext);
    if (!context) throw new Error('useOffline must be used within OfflineProvider');
    return context;
}
