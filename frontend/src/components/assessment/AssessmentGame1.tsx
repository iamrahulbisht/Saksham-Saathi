import { useEffect, useState, useRef } from 'react';

declare global {
    interface Window {
        webgazer: any;
    }
}

interface GazeData {
    x: number;
    y: number;
    timestamp: number;
    word_index: number | null;
}

export default function AssessmentGame1({ onComplete }: { onComplete: (data: GazeData[]) => void }) {
    // Start directly in reading mode as requested, skipping calibration UI
    const [stage, setStage] = useState<'calibration' | 'reading' | 'complete'>('reading');
    const [gazeData, setGazeData] = useState<GazeData[]>([]);

    const readingTextRef = useRef<HTMLDivElement>(null);
    const readingText = "बच्चे स्कूल में खेलते हैं। वे पढ़ाई करते हैं। शिक्षक उन्हें पढ़ाते हैं।";

    useEffect(() => {
        // Force hide video elements whenever stage changes or component mounts
        const hideVideo = () => {
            const videoElement = document.getElementById('webgazerVideoFeed');
            const faceOverlay = document.getElementById('webgazerFaceOverlay');
            const faceFeedbackBox = document.getElementById('webgazerFaceFeedbackBox');

            if (videoElement) {
                videoElement.style.display = 'none';
                videoElement.style.visibility = 'hidden';
                videoElement.style.opacity = '0';
            }
            if (faceOverlay) {
                faceOverlay.style.display = 'none';
                faceOverlay.style.visibility = 'hidden';
            }
            if (faceFeedbackBox) {
                faceFeedbackBox.style.display = 'none';
                faceFeedbackBox.style.visibility = 'hidden';
            }
        };

        // Run immediately and on interval to catch strictly late-injected elements
        hideVideo();
        const interval = setInterval(hideVideo, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const wg = (window as any).webgazer;
        if (!wg) {
            console.error("WebGazer not loaded");
            return;
        }

        try {
            wg.clearGazeListener();
            wg.setGazeListener((data: any, timestamp: number) => {
                if (data && stage === 'reading') {
                    const wordIndex = getWordAtGaze(data.x, data.y);
                    setGazeData(prev => [...prev, {
                        x: data.x,
                        y: data.y,
                        timestamp,
                        word_index: wordIndex
                    }]);
                }
            }).begin();

            // Explicitly disable video preview in WebGazer
            wg.showVideoPreview(false).showPredictionPoints(true);

        } catch (e) {
            console.error("Failed to init webgazer", e);
        }

        return () => {
            if (wg) {
                try {
                    wg.end();
                } catch (e) { console.log("WebGazer cleanup error", e); }
            }
        };
    }, [stage]);

    function getWordAtGaze(x: number, y: number): number | null {
        if (!readingTextRef.current) return null;
        const rect = readingTextRef.current.getBoundingClientRect();
        const words = readingText.split(' ');
        const wordWidth = rect.width / words.length;
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;

        if (relativeY < 0 || relativeY > rect.height) return null;

        const wordIndex = Math.floor(relativeX / wordWidth);
        return wordIndex >= 0 && wordIndex < words.length ? wordIndex : null;
    }

    function handleReadingComplete() {
        setStage('complete');
        onComplete(gazeData);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center">

            {/* Top Bar */}
            <div className="w-full max-w-7xl mx-auto pt-8 px-8 flex justify-between items-center">
                <div className="flex items-center gap-4 bg-white/50 backdrop-blur px-4 py-2 rounded-full shadow-sm">
                    <span className="px-4 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-500">
                        1. Calibration (Skipped)
                    </span>
                    <div className="w-8 h-1 bg-gray-300 rounded"></div>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${stage === 'reading' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
                        2. Reading
                    </span>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-gray-500 hover:text-indigo-600 font-medium px-4 py-2 hover:bg-white/50 rounded-lg transition"
                >
                    Restart Session
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-8 transition-all duration-300">

                {stage === 'reading' && (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-gray-100">
                        <div className="p-16">
                            <div className="flex justify-between items-start mb-10 border-b pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Reading Assessment</h2>
                                    <p className="text-gray-500 mt-1">Read the following text aloud clearly.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400">Gaze Points</div>
                                    <div className="text-2xl font-mono font-bold text-indigo-600">{gazeData.length}</div>
                                </div>
                            </div>

                            <div
                                ref={readingTextRef}
                                className="text-5xl leading-[2.2] text-gray-900 font-serif tracking-wide text-center py-10"
                                style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
                            >
                                {readingText}
                            </div>

                            <div className="mt-16 flex justify-center">
                                <button
                                    onClick={handleReadingComplete}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-lg"
                                >
                                    <span>I've Finished Reading</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {stage === 'complete' && (
                    <div className="max-w-xl mx-auto mt-20 text-center bg-white p-12 rounded-[2rem] shadow-2xl border border-gray-100">
                        <div className="bg-green-100 w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-8 rotate-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Assessment Complete!</h2>
                        <p className="text-gray-500 mb-10 text-lg">Great job. We have successfully captured <span className="font-bold text-indigo-600">{gazeData.length}</span> gaze data points for analysis.</p>
                        <button
                            className="bg-gray-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition w-full shadow-lg"
                            onClick={() => window.history.back()}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
