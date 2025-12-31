import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import AssessmentGame1 from '../components/assessment/AssessmentGame1';
import AssessmentGame2 from '../components/assessment/AssessmentGame2';
import AssessmentGame3 from '../components/assessment/AssessmentGame3';
import AssessmentGame4 from '../components/assessment/AssessmentGame4';
import AssessmentGame5 from '../components/assessment/AssessmentGame5';
import RealTimeMonitor from '../components/cognitive-load/RealTimeMonitor';
import OverloadAlert from '../components/cognitive-load/OverloadAlert';

interface GameInfo {
    gameNumber: number;
    gameType: string;
    title: string;
    instructions: string;
    duration: number;
    content?: any;
}

interface AssessmentData {
    assessmentId: string;
    studentId: string;
    language: string;
    status: string;
    currentGame: number;
    totalGames: number;
    game: GameInfo;
}


 
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: '' };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error: error.message || error.toString() };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Uncaught error in component:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
                    <h3>Something went wrong.</h3>
                    <p>{this.state.error}</p>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>Reload Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

const AssessmentPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assessment, setAssessment] = useState<AssessmentData | null>(null);
    const [currentGame, setCurrentGame] = useState<GameInfo | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

     
    useEffect(() => {
        if (studentId) {
            startAssessment();
        }
    }, [studentId]);

    const startAssessment = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await assessmentAPI.startAssessment({
                studentId: studentId!,
                language: 'en'
            });

            const data = response.data.data;

            if (data.status === 'completed') {
                setAssessment(data);
                setCompleted(true);
                 
                navigate(`/assessment/${data.assessmentId}/results`);
                return;
            }

            setAssessment(data);
            setCurrentGame(data.game);
        } catch (err: any) {
            console.error("Start Assessment Error:", err);
            setError(err.response?.data?.message || 'Failed to start assessment or unauthorized.');
        } finally {
            setLoading(false);
        }
    };

    const handleGameSubmit = async (gameData: any) => {
        if (!assessment || !currentGame) return;

        try {
            setSubmitting(true);
            setError('');

            const response = await assessmentAPI.submitGame(
                assessment.assessmentId,
                currentGame.gameNumber,
                gameData
            );

            const result = response.data.data;

            if (result.isLastGame) {
                 
                await assessmentAPI.completeAssessment(assessment.assessmentId);
                setCompleted(true);
            } else if (result.nextGame) {
                 
                setCurrentGame(result.nextGame);
            }
        } catch (err: any) {
            console.error("Submit Game Error:", err);
            setError(err.response?.data?.message || 'Failed to submit game data');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Loading Assessment...</h2>
                <p>Preparing the assessment for the student. Please wait.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Error</h2>
                <p>{error}</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (completed) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ color: 'green' }}>✅ Assessment Complete!</h2>
                <p style={{ fontSize: '18px', margin: '20px 0' }}>
                    All games have been completed successfully. The screening results will be processed.
                </p>
                <p style={{ color: '#666' }}>
                    Assessment ID: {assessment?.assessmentId}
                </p>
                <button
                    onClick={() => navigate(`/assessment/${assessment?.assessmentId}/results`)}
                    style={{
                        padding: '12px 25px',
                        marginTop: '20px',
                        fontSize: '16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!assessment || !currentGame) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>No assessment data available.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            { }
            <div className="card flex-between" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
                <div>
                    <strong className="text-muted">Assessment Progress</strong>
                </div>
                <div className="badge badge-neutral">
                    Game {currentGame.gameNumber} of {assessment.totalGames}
                </div>
            </div>

            { }
            <div style={{
                height: '8px',
                backgroundColor: 'var(--bg-body)',
                borderRadius: '4px',
                marginBottom: '2rem',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${(currentGame.gameNumber / assessment.totalGames) * 100}%`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                }} />
            </div>

            {submitting && (
                <div className="badge badge-warning" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem', padding: '1rem' }}>
                    Submitting game data...
                </div>
            )}

            { }
            {studentId && assessment && !completed && (
                <RealTimeMonitor
                    studentId={studentId}
                    sessionId={assessment.assessmentId}
                    taskType={currentGame?.gameType || 'assessment'}
                    isActive={!loading && !submitting}
                />
            )}

            { }
            <OverloadAlert />

            { }
            <ErrorBoundary>
                { }
                {currentGame.gameNumber === 1 && (
                    <AssessmentGame1
                        passage={currentGame.content?.passage || 'No passage available'}
                        duration={currentGame.duration}
                        onSubmit={handleGameSubmit}
                        onCancel={handleCancel}
                    />
                )}

                {currentGame.gameNumber === 2 && (
                    <AssessmentGame2
                        sentences={['The quick brown fox jumps over the lazy dog.', 'Reading is fun and helps us learn new things.']}
                        duration={currentGame.duration}
                        onSubmit={handleGameSubmit}
                        onCancel={handleCancel}
                    />
                )}

                {currentGame.gameNumber === 3 && (
                    <AssessmentGame3
                        duration={currentGame.duration}
                        onSubmit={handleGameSubmit}
                        onCancel={handleCancel}
                    />
                )}

                {currentGame.gameNumber === 4 && (
                    <AssessmentGame4
                        duration={currentGame.duration}
                        onSubmit={handleGameSubmit}
                        onCancel={handleCancel}
                    />
                )}

                {currentGame.gameNumber === 5 && (
                    <AssessmentGame5
                        duration={currentGame.duration}
                        onSubmit={handleGameSubmit}
                        onCancel={handleCancel}
                    />
                )}
            </ErrorBoundary>
        </div>
    );
};

export default AssessmentPage;
