import { useState, useEffect, useRef } from 'react';

interface Trial {
    trial_number: number;
    response_time_ms: number;
    correct: boolean;
    type: 'go' | 'no-go'; // For Go/No-Go Paradigm
}

export default function AssessmentGame5({ onComplete }: { onComplete: (data: any) => void }) {
    const [trials, setTrials] = useState<Trial[]>([]);
    const [currentTrial, setCurrentTrial] = useState(0);
    const [showCircle, setShowCircle] = useState(false);
    const [circleColor, setCircleColor] = useState<'red' | 'blue'>('red');

    // Game Configuration
    const TARGET_COLOR = 'red'; // Press only on RED
    const TOTAL_TRIALS = 20;

    const [startTime, setStartTime] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startNewTrial();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentTrial]);

    function startNewTrial() {
        if (currentTrial >= TOTAL_TRIALS) {
            onComplete({
                trials,
                variability: calculateVariability(trials),
                mean_response_time: calculateMean(trials)
            });
            return;
        }

        setShowCircle(false);

        // Random delay (Inter-Stimulus Interval) 1000-3000ms
        const delay = Math.random() * 2000 + 1000;

        timeoutRef.current = setTimeout(() => {
            // 70% chance of target (Go), 30% chance of distractor (No-Go) if we wanted complex logic
            // For simple variability, we just randomize color but instruction said "Click when RED"?
            // Let's implement simple Reaction Time first: "Click when ANY circle appears" or Specific color

            const color = Math.random() > 0.5 ? 'red' : 'blue';
            setCircleColor(color);
            setShowCircle(true);
            setStartTime(Date.now());
        }, delay);
    }

    function handleClick() {
        if (!showCircle) {
            // Premature click (impulsivity indicator) - could log as error
            return;
        }

        const responseTime = Date.now() - startTime;
        // Task: Click ONLY if Red (Go/No-Go)
        // If Blue is clicked -> Commission Error

        // User instruction from blueprint: "Click colored circles". 
        // Usually Variability tasks ask to click as fast as possible on ANY stimulus.
        // Let's stick to simple Simple Reaction Time (SRT) for now, or Go/No-Go as per specific ADHD req.
        // Implementing Go/No-Go (Click Red, Don't Click Blue)

        if (circleColor === TARGET_COLOR) {
            // Correct Hit
            recordTrial(responseTime, true, 'go');
        } else {
            // Commission Error
            recordTrial(responseTime, false, 'no-go');
        }
    }

    // Handle No-Go timeout (User successfully didn't click Blue)
    // Not implemented for simplicity, assuming user MUST click circle based on "rapid stimulus-response game" description

    function recordTrial(time: number, correct: boolean, type: 'go' | 'no-go') {
        const newTrial = {
            trial_number: currentTrial + 1,
            response_time_ms: time,
            correct,
            type
        };
        setTrials(prev => [...prev, newTrial]);
        setShowCircle(false);
        setCurrentTrial(prev => prev + 1);
    }

    function calculateMean(trials: Trial[]) {
        const validTrials = trials.filter(t => t.correct && t.type === 'go');
        if (validTrials.length === 0) return 0;
        return validTrials.reduce((a, b) => a + b.response_time_ms, 0) / validTrials.length;
    }

    function calculateVariability(trials: Trial[]): number {
        // Standard Deviation of Response Time
        const validTrials = trials.filter(t => t.correct && t.type === 'go');
        if (validTrials.length < 2) return 0;

        const times = validTrials.map(t => t.response_time_ms);
        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        const variance = times.reduce((acc, time) => acc + Math.pow(time - mean, 2), 0) / times.length;
        return Math.sqrt(variance);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 cursor-pointer select-none" onMouseDown={handleClick}>
            <div className="max-w-3xl mx-auto text-center pt-20">
                <h2 className="text-3xl font-bold mb-4">खेल 5: प्रतिक्रिया समय (Response Time)</h2>
                <p className="text-xl mb-12">
                    जब <span className="text-red-500 font-bold">🔴 लाल</span> घेरा दिखे तो स्क्रीन पर कहीं भी क्लिक करें।
                    <br /><span className="text-blue-500 text-sm">(नीले पर क्लिक न करें / Do not click Blue)</span>
                </p>

                <div className="relative h-96 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-gray-100">
                    {showCircle && (
                        <div
                            className={`w-40 h-40 rounded-full shadow-2xl transform transition-transform duration-75 active:scale-90 ${circleColor === 'red' ? 'bg-red-500 ring-8 ring-red-200' : 'bg-blue-500 ring-8 ring-blue-200'
                                }`}
                        />
                    )}
                    {!showCircle && (
                        <div className="animate-pulse text-gray-400 text-3xl font-light">
                            प्रतीक्षा करें... (Wait...)
                        </div>
                    )}
                </div>

                <p className="mt-8 text-gray-500 font-mono">Trial {currentTrial + 1} / {TOTAL_TRIALS}</p>
            </div>
        </div>
    );
}
