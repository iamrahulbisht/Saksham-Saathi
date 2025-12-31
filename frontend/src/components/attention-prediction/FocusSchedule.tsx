import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Prediction {
    hour_offset: number;
    timestamp: string;
    focus_score: number;
    is_peak: boolean;
}

interface FocusScheduleProps {
    studentId: string;
}

const FocusSchedule: React.FC<FocusScheduleProps> = ({ studentId }) => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSchedule = async () => {
        setLoading(true);
        setError('');
        try {
             
            const response = await api.get(`/attention/schedule/${studentId}`);

            if (response.data.data && response.data.data.predictions) {
                setPredictions(response.data.data.predictions);
            } else {
                 
                console.log("No schedule found, generating new prediction...");
                const predictResponse = await api.post(`/attention/predict/${studentId}`);
                if (predictResponse.data.data && predictResponse.data.data.predictions) {
                    setPredictions(predictResponse.data.data.predictions);
                }
            }
        } catch (err: any) {
            console.error("Failed to fetch focus schedule:", err);
            setError("Could not load attention forecast.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            fetchSchedule();
        }
    }, [studentId]);

    if (loading) return <div>Loading Focus Forecast...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (predictions.length === 0) return null;

     
    return (
        <div className="card" style={{ marginTop: '20px' }}>
            <h3 className="heading-3">🧠 48-Hour Focus Forecast</h3>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '4px', overflowX: 'auto', paddingBottom: '10px' }}>
                {predictions.map((p, i) => {
                    const date = new Date(p.timestamp);
                    const hour = date.getHours();
                    const isDay = hour >= 6 && hour <= 18;

                    return (
                        <div key={i} style={{
                            flex: '0 0 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            opacity: isDay ? 1 : 0.5
                        }}>
                            <div
                                title={`${date.toLocaleString()} - Focus: ${Math.round(p.focus_score)}%`}
                                style={{
                                    width: '100%',
                                    height: `${p.focus_score}px`,
                                    backgroundColor: p.is_peak ? 'var(--secondary)' : (p.focus_score > 50 ? 'var(--primary)' : 'var(--accent)'),
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease'
                                }}
                            />
                            <span className="text-muted" style={{ fontSize: '10px', marginTop: '4px' }}>
                                {hour % 6 === 0 ? hour : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '14px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ backgroundColor: 'var(--secondary)', color: 'white' }}>Peak Focus (Math/Logic)</span>
                <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Normal Focus</span>
                <span className="badge" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>Low Focus (Creative/Rest)</span>
            </div>
        </div>
    );
};

export default FocusSchedule;
