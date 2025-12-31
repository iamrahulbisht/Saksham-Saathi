import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

interface MlPrediction {
    predictionType: string;
    dyslexiaRisk: number;
    confidence: number;
    details: {
        risk_score: number;
        risk_level: string;
        flagged_areas: string[];
    };
    createdAt: string;
}

interface AssessmentData {
    id: string;
    status: string;
    student: {
        name: string;
        age: number;
        grade: number;
    };
    predictions: MlPrediction[];
    games: any[];
}

const AssessmentResults: React.FC = () => {
    const { assessmentId } = useParams<{ assessmentId: string }>();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<AssessmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (assessmentId) {
            fetchResults();
        }
    }, [assessmentId]);

    const fetchResults = async () => {
        try {
            const response = await assessmentAPI.getAssessment(assessmentId!);
            setAssessment(response.data.data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load results.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading results...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!assessment) return null;

     
    const screening = assessment.predictions.find(p => p.predictionType === 'screening_overall');

    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high': return '#dc3545';  
            case 'moderate': return '#ffc107';  
            case 'low': return '#28a745';  
            default: return '#6c757d';  
        }
    };

    const riskLevel = screening?.details.risk_level || 'Unknown';
    const riskScore = screening ? Math.round(screening.details.risk_score * 100) : 0;
    const color = getRiskColor(riskLevel);

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h1 className="heading-1" style={{ margin: 0 }}>Screening Report</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="card">
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                    <h2 className="heading-2" style={{ margin: 0 }}>{assessment.student.name}</h2>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                        Grade {assessment.student.grade} | Age {assessment.student.age}
                    </p>
                </div>

                {!screening ? (
                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', borderRadius: '8px' }}>
                        <h3 className="heading-3">Analysis Pending or Failed</h3>
                        <p className="text-muted">No screening prediction found for this assessment.</p>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-body)', borderRadius: '12px' }}>
                                <h3 className="heading-3" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Dyslexia Risk</h3>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: color, lineHeight: 1 }}>
                                    {riskLevel.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '1.5rem', color: color, marginTop: '0.5rem', fontWeight: 600 }}>
                                    {riskScore}%
                                </div>
                            </div>

                            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-body)', borderRadius: '12px' }}>
                                <h3 className="heading-3" style={{ marginBottom: '1rem' }}>Key Observations</h3>
                                {screening.details.flagged_areas && screening.details.flagged_areas.length > 0 ? (
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                        {screening.details.flagged_areas.map((area, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>
                                                {area}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted" style={{ color: 'var(--success)' }}>No significant issues flagged.</p>
                                )}
                            </div>
                        </div>

                        <div className="badge badge-neutral" style={{ display: 'block', padding: '1.5rem', borderLeft: '5px solid var(--primary)', borderRadius: '8px', textAlign: 'left' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.1rem' }}>AI Confidence: {Math.round(screening.confidence * 100)}%</h4>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                This screening is based on preliminary analysis of eye tracking, speech patterns, and cognitive response times.
                                High risk scores indicate a strong recommendation for professional evaluation.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentResults;
