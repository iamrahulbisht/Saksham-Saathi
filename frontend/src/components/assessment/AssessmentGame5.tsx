import React, { useState, useEffect, useRef } from 'react';

interface AssessmentGame5Props {
    duration: number;
    onSubmit: (data: {
        responseData: any;
        duration: number;
    }) => void;
    onCancel: () => void;
}

type GameState = 'waiting_to_start' | 'waiting_for_stimulus' | 'stimulus_shown' | 'clicked_too_early' | 'finished';

const AssessmentGame5: React.FC<AssessmentGame5Props> = ({ duration: _ignored, onSubmit, onCancel }) => {
    const [gameState, setGameState] = useState<GameState>('waiting_to_start');
    const [message, setMessage] = useState('Click "Start" to begin.');
    const [bgColor, setBgColor] = useState('#fff');
    const [trials, setTrials] = useState<number[]>([]);
    const [currentTrialCount, setCurrentTrialCount] = useState(0);
    const maxTrials = 5;

    const stimulusTimeRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startTrial = () => {
        if (currentTrialCount >= maxTrials) {
            finishGame();
            return;
        }

        setGameState('waiting_for_stimulus');
        setMessage('Wait for GREEN color...');
        setBgColor('#f44336');  

         
        const delay = Math.floor(Math.random() * 3000) + 2000;

        timeoutRef.current = setTimeout(() => {
            showStimulus();
        }, delay);
    };

    const showStimulus = () => {
        setGameState('stimulus_shown');
        setMessage('CLICK NOW!');
        setBgColor('#4CAF50');  
        stimulusTimeRef.current = Date.now();
    };

    const handleClick = () => {
        if (gameState === 'waiting_to_start') {
            startTrial();
        } else if (gameState === 'waiting_for_stimulus') {
             
            setGameState('clicked_too_early');
            setMessage('Too early! Wait for green.');
            setBgColor('#fff3e0');  
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
             
            setTimeout(startTrial, 1500);
        } else if (gameState === 'stimulus_shown') {
             
            const reactionTime = Date.now() - stimulusTimeRef.current;
            setTrials(prev => [...prev, reactionTime]);
            setCurrentTrialCount(prev => prev + 1);

            setGameState('waiting_to_start');  
            setMessage(`Reaction: ${reactionTime}ms. Click to continue.`);
            setBgColor('#fff');

             
            if (currentTrialCount + 1 < maxTrials) {
                setTimeout(startTrial, 1000);
            } else {
                setTimeout(finishGame, 1000);
            }
        }
    };

    const finishGame = () => {
        setGameState('finished');
         
         
        const avg = trials.reduce((a, b) => a + b, 0) / trials.length;

        onSubmit({
            responseData: {
                type: 'response_time',
                trials: trials,
                averageMs: avg
            },
            duration: 0
        });
    };

     
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="container" style={{ maxWidth: '800px', userSelect: 'none' }}>
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="heading-2" style={{ margin: 0 }}>Game 5: Quick Response</h2>
                    <button onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
                </div>

                <div
                    onMouseDown={handleClick}
                    style={{
                        height: '400px',
                        backgroundColor: bgColor,
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s',
                        boxShadow: 'var(--shadow-md)',
                        color: bgColor === '#4CAF50' ? 'white' : 'var(--text-primary)',
                        position: 'relative'
                    }}
                >
                    <h1 className="heading-1" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                        {gameState === 'stimulus_shown' ? 'CLICK!' : message}
                    </h1>

                    {gameState === 'waiting_to_start' && currentTrialCount === 0 && (
                        <div className="text-muted" style={{ fontSize: '1.5rem', opacity: 0.7 }}>(Click anywhere to start)</div>
                    )}

                    <div style={{ position: 'absolute', bottom: '2rem', fontSize: '1.25rem', fontWeight: 600 }}>
                        Trials: {currentTrialCount} / {maxTrials}
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', minHeight: '30px' }}>
                    {trials.length > 0 && (
                        <span className="badge badge-neutral">Last: {trials[trials.length - 1]}ms</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentGame5;
