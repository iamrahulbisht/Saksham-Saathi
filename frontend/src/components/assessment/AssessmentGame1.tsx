import React, { useState, useEffect, useRef } from 'react';

 
declare global {
    interface Window {
        webgazer: any;
        stream?: MediaStream;
    }
}

interface AssessmentGame1Props {
    passage: string;
    duration: number;
    onSubmit: (data: {
        eyeTrackingData: any,
        screenDimensions: { width: number, height: number },
        textBoundingBox: { top: number, left: number, width: number, height: number }
    }) => void;
    onCancel: () => void;
}

interface EyeTrackingPoint {
    x: number;
    y: number;
    timestamp: number;
}

const AssessmentGame1: React.FC<AssessmentGame1Props> = ({ passage, duration, onSubmit, onCancel }) => {
    const [status, setStatus] = useState<'initializing' | 'calibration' | 'reading' | 'processing' | 'error'>('initializing');
    const [calibrationPoints, setCalibrationPoints] = useState<Record<string, number>>({
        'pt1': 0, 'pt2': 0, 'pt3': 0, 'pt4': 0, 'pt5': 0
    });
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [gazeData, setGazeData] = useState<EyeTrackingPoint[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

     
    const textContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    const statusRef = useRef(status);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

     
    useEffect(() => {
        mountedRef.current = true;
        let initInProgress = false;

        const initWebGazer = async () => {
             
            if (initInProgress || !mountedRef.current) return;
            initInProgress = true;

            try {
                if (!window.webgazer) {
                    throw new Error("WebGazer library not loaded");
                }

                 
                if (window.webgazer.isReady && window.webgazer.isReady()) {
                    console.log("WebGazer already ready, resuming...");
                    window.webgazer.resume();
                    if (mountedRef.current) setStatus('calibration');
                    return;
                }

                console.log("Initializing WebGazer...");

                 
                try {
                    if (typeof window.webgazer.clearData === 'function') {
                        await window.webgazer.clearData();
                    }
                } catch (e) {
                    console.warn("Error clearing data:", e);
                }

                 
                const webgazerInstance = await window.webgazer.setRegression('ridge')
                    .setGazeListener((data: any, _clock: any) => {
                         
                        if (data && statusRef.current === 'reading' && mountedRef.current) {
                             
                            setGazeData(prev => [...prev, {
                                x: data.x,
                                y: data.y,
                                timestamp: Date.now()
                            }]);
                        }
                    })
                    .saveDataAcrossSessions(true)
                    .begin();

                if (!webgazerInstance) {
                     
                    console.log("WebGazer started (no instance returned)");
                }

                window.webgazer.showVideoPreview(true)
                    .showPredictionPoints(true)
                    .applyKalmanFilter(true);

                if (mountedRef.current) setStatus('calibration');
            } catch (err: any) {
                console.error("Failed to init webgazer:", err);
                if (mountedRef.current) {
                    setErrorMsg(err.message || "Failed to initialize eye tracker");
                    setStatus('error');
                     
                     
                }
            }
        };

         
        const checkScript = setInterval(() => {
            if (window.webgazer) {
                clearInterval(checkScript);
                 
                setTimeout(initWebGazer, 500);
            }
        }, 500);

         
        const timeout = setTimeout(() => {
            clearInterval(checkScript);
            if (!window.webgazer && mountedRef.current && status === 'initializing') {
                setErrorMsg("WebGazer script unavailable. Check internet connection.");
                setStatus('error');
            }
        }, 10000);

        return () => {
            mountedRef.current = false;
            initInProgress = false;
            clearInterval(checkScript);
            clearTimeout(timeout);

             
            if (window.webgazer) {
                try {
                     
                    if (typeof window.webgazer.end === 'function') {
                        window.webgazer.end();
                    }

                     
                    if (window.stream) {
                        window.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                    }
                } catch (e) {
                    console.warn("Safely handled WebGazer cleanup error:", e);
                }
            }

             
            const elementsToRemove = [
                'webgazerVideoContainer',
                'webgazerFaceOverlay',
                'webgazerFaceFeedbackBox',
                'webgazerGazeDot'
            ];
            elementsToRemove.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });
        };
    }, []);  

     
    useEffect(() => {
        if (status === 'reading' && timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                if (mountedRef.current) setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0 && status === 'reading') {
            handleSubmit();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [status, timeRemaining]);

    const handleCalibrationClick = (pointId: string) => {
        setCalibrationPoints(prev => {
            const newState = { ...prev, [pointId]: prev[pointId] + 1 };

             
            const allDone = Object.values(newState).every(count => count >= 5);
            if (allDone) {
                setTimeout(() => startReading(), 500);
            }
            return newState;
        });
    };

    const startReading = () => {
        if (window.webgazer) {
            try {
                window.webgazer.showVideoPreview(false).showPredictionPoints(false);
            } catch (e) {
                console.warn("Failed to hide video preview", e);
            }
        }
        setStatus('reading');
        setTimeRemaining(duration);
        setGazeData([]);
    };

    const handleSubmit = () => {
        setStatus('processing');
        if (window.webgazer) {
            try {
                window.webgazer.pause();
            } catch (e) {
                console.warn("Failed to pause webgazer", e);
            }
        }

        const rect = textContainerRef.current?.getBoundingClientRect();

        onSubmit({
            eyeTrackingData: {
                rawPoints: gazeData,
                startTime: Date.now() - (duration - timeRemaining) * 1000,
                endTime: Date.now(),
            },
            screenDimensions: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            textBoundingBox: {
                top: rect?.top || 0,
                left: rect?.left || 0,
                width: rect?.width || 0,
                height: rect?.height || 0
            }
        });
    };

    const skipCalibration = () => {
        startReading();
    };

    return (
        <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', minHeight: '600px' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h2 className="heading-2" style={{ margin: 0 }}>Game 1: Reading Task</h2>
                <button onClick={onCancel} className="btn btn-outline">Cancel</button>
            </div>

            {status === 'initializing' && (
                <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', borderRadius: '12px' }}>
                    <h3 className="heading-3">Initializing Eye Tracking...</h3>
                    <p className="text-muted">Please allow camera access when prompted.</p>
                    <div style={{ marginTop: '20px', width: '40px', height: '40px', border: '4px solid var(--border-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                </div>
            )}

            {status === 'error' && (
                <div className="badge badge-danger" style={{ display: 'block', padding: '2rem', textAlign: 'center' }}>
                    <h3 className="heading-3">Error</h3>
                    <p>{errorMsg}</p>
                    <button onClick={onCancel} className="btn btn-sm btn-outline" style={{ marginTop: '1rem', color: 'white', borderColor: 'white' }}>Back</button>
                </div>
            )}

            {status === 'calibration' && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1001 }}>
                        <button
                            onClick={skipCalibration}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Skip Calibration (Dev)
                        </button>
                    </div>

                    <h3 style={{ marginBottom: '10px' }}>Calibration</h3>
                    <p style={{ marginBottom: '5px' }}>Click each red point 5 times while looking at it.</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Ensure your face is centered in the camera feed.
                    </p>

                    { }
                    {[
                        { id: 'pt1', top: '10%', left: '10%' },
                        { id: 'pt2', top: '10%', left: '90%' },
                        { id: 'pt3', top: '50%', left: '50%' },
                        { id: 'pt4', top: '90%', left: '10%' },
                        { id: 'pt5', top: '90%', left: '90%' },
                    ].map(pt => (
                        <button
                            key={pt.id}
                            onClick={() => handleCalibrationClick(pt.id)}
                            disabled={calibrationPoints[pt.id] >= 5}
                            style={{
                                position: 'absolute',
                                top: pt.top,
                                left: pt.left,
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: calibrationPoints[pt.id] >= 5 ? '#4CAF50' : '#f44336',
                                border: '2px solid white',
                                cursor: 'pointer',
                                transform: 'translate(-50%, -50%)',
                                transition: 'background-color 0.2s',
                                zIndex: 1002
                            }}
                        >
                            {calibrationPoints[pt.id] < 5 && calibrationPoints[pt.id]}
                        </button>
                    ))}
                </div>
            )}

            {status === 'reading' && (
                <>
                    <div style={{
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#e3f2fd',
                        padding: '10px',
                        borderRadius: '5px'
                    }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            Time: {timeRemaining}s
                        </span>
                        <button
                            onClick={handleSubmit}
                            style={{
                                padding: '8px 20px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Done Reading
                        </button>
                    </div>

                    <div
                        ref={textContainerRef}
                        style={{
                            padding: '40px',
                            fontSize: '24px',
                            lineHeight: '2',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            minHeight: '400px',
                            backgroundColor: '#fff',
                            userSelect: 'none'
                        }}
                    >
                        {passage.split('\n').map((line, i) => (
                            <p key={i} style={{ marginBottom: '20px' }}>{line}</p>
                        ))}
                    </div>
                </>
            )}

            {status === 'processing' && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h3>Processing Reading Data...</h3>
                    <p>Analyzing eye movements with AI...</p>
                    <div style={{ marginTop: '20px', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AssessmentGame1;
