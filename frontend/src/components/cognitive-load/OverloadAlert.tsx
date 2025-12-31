import React, { useEffect, useState } from 'react';
import { socketService } from '../../services/socket';

interface OverloadAlertProps {
    onIntervention?: (type: string) => void;
}

const OverloadAlert: React.FC<OverloadAlertProps> = ({ onIntervention }) => {
    const [alert, setAlert] = useState<{ message: string; severity: string; intervention: string } | null>(null);

    useEffect(() => {
        const handleAlert = (data: any) => {
            console.log("Received Overload Alert:", data);
            setAlert({
                message: data.message || "Take a deep breath!",
                severity: data.severity || 'moderate',
                intervention: data.intervention
            });

             
            setTimeout(() => setAlert(null), 10000);

            if (onIntervention && data.intervention) {
                onIntervention(data.intervention);
            }
        };

        socketService.on('alert:overload', handleAlert);

        return () => {
            socketService.off('alert:overload');
        };
    }, [onIntervention]);

    if (!alert) return null;



    const getTextColor = (severity: string) => {
        switch (severity) {
            case 'severe': return '#c62828';
            case 'moderate': return '#ef6c00';
            default: return '#1565c0';
        }
    };

    return (
        <div className="card" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            borderLeft: `5px solid ${getTextColor(alert.severity)}`,
            backgroundColor: 'white',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px',
            padding: '1.25rem'
        }}>
            <span style={{ fontSize: '2rem' }}>
                {alert.severity === 'severe' ? '🛑' : '⏸️'}
            </span>
            <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: getTextColor(alert.severity) }}>
                    {alert.severity === 'severe' ? 'Overload Detected' : 'Suggestion'}
                </strong>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{alert.message}</p>
            </div>
            <button
                onClick={() => setAlert(null)}
                style={{
                    marginLeft: 'auto',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default OverloadAlert;
