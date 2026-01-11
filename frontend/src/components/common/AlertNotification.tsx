import { useRealTimeAlerts } from '../../hooks/useRealTimeAlerts';

export default function AlertNotification() {
    const { alerts, dismiss } = useRealTimeAlerts();

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className="bg-white border-l-4 border-red-500 shadow-lg rounded-r-lg p-4 flex justify-between items-start animate-fade-in-down"
                >
                    <div>
                        <h4 className="font-bold text-red-600 flex items-center gap-2">
                            ⚠️ {alert.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                    </div>

                    <button
                        onClick={() => dismiss(alert.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
