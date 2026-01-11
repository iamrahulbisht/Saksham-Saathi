import { useContext } from 'react';
import { OfflineContext } from '../../contexts/OfflineContext';

export function OfflineIndicator() {
    const context = useContext(OfflineContext);

    if (!context) return null;

    const { isOnline, unsyncedCount } = context;

    if (isOnline && unsyncedCount === 0) return null;

    return (
        <div className={`fixed bottom-4 right-4 p-3 rounded ${isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
            {!isOnline ? '📴 You are offline' : `⚠️ ${unsyncedCount} modifications pending sync`}
        </div>
    );
}
