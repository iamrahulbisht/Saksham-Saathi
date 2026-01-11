import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

export function useRealTimeAlerts() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !user) return;

        const handleOverload = (data: any) => {
            const newAlert = {
                id: crypto.randomUUID(),
                type: 'overload',
                title: 'Alert',
                message: `${data.studentName} needs help!`,
                timestamp: new Date()
            };
            setAlerts(prev => [newAlert, ...prev]);

            // Browser Notification
            if (Notification.permission === 'granted') {
                new Notification("Cognitive Alert", { body: newAlert.message });
            }
        };

        socket.on('cognitive_overload_alert', handleOverload);
        return () => { socket.off('cognitive_overload_alert', handleOverload); };
    }, [user]);

    return { alerts, dismiss: (id: string) => setAlerts(p => p.filter(a => a.id !== id)) };
}
