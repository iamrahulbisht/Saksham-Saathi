import { useState, useRef } from 'react';

export default function AssessmentGame2({ onComplete }: { onComplete: (data: any) => void }) {
    const [stage, setStage] = useState<'instructions' | 'recording' | 'complete'>('instructions');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Text content in Hindi (script-aware context)
    const sentences = [
        "मैं स्कूल जाता हूँ।",
        "मुझे किताबें पढ़ना पसंद है।",
        "हम खेलते हैं।"
    ];

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                setStage('complete');
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setStage('recording');

            // Auto-stop after 30 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    stopRecording();
                }
            }, 30000);
        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('कृपया माइक्रोफ़ोन की अनुमति दें (Please allow microphone access)');
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }

    function handleComplete() {
        if (audioBlob) {
            // Convert Blob to Base64 for API upload
            // Note: Large files ideally should use FormData / multipart upload, 
            // but base64 is acceptable for short 30s clips (< 1MB) in this prototype
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64Audio = reader.result as string;
                onComplete({
                    audio_base64: base64Audio,
                    duration_seconds: 30, // Or calculate actual duration
                    sentences: sentences
                });
            };
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center pt-10">
            {stage === 'instructions' && (
                <div className="max-w-3xl w-full text-center px-4">
                    <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-600 mb-6">
                        Step 2: Voice Analysis
                    </span>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 border border-white/50">
                        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Read Aloud</h2>
                        <p className="text-lg text-gray-600 mb-10">Please read the following Hindi sentences clearly into the microphone.</p>

                        <div className="bg-indigo-50 p-8 rounded-2xl mb-10 text-left border border-indigo-100">
                            {sentences.map((sentence, i) => (
                                <div key={i} className="flex items-start gap-4 mb-4 last:mb-0">
                                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-1">{i + 1}</span>
                                    <p className="text-2xl text-gray-800 font-medium leading-relaxed">{sentence}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={startRecording}
                            className="bg-red-500 text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center mx-auto gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Start Recording
                        </button>
                    </div>
                </div>
            )}

            {stage === 'recording' && (
                <div className="max-w-3xl w-full text-center px-4">
                    <h2 className="text-3xl font-bold mb-8 text-red-500 animate-pulse flex items-center justify-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        Recording in Progress...
                    </h2>

                    <div className="bg-white rounded-3xl shadow-2xl p-16 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-100">
                            <div className="h-full bg-red-500 animate-[width_30s_linear_forwards] w-full" style={{ width: '0%', animationName: 'growWidth', animationDuration: '30s' }}></div>
                        </div>

                        <div className="relative flex justify-center items-center h-48 mb-8">
                            <div className="absolute w-40 h-40 bg-red-100 rounded-full animate-ping opacity-50"></div>
                            <div className="relative w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-2xl text-gray-700 font-medium">Listening...</p>
                        <p className="text-gray-400 mt-2">Speak the sentences clearly</p>
                    </div>

                    <button
                        onClick={stopRecording}
                        className="bg-gray-900 text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center mx-auto gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        Stop Recording
                    </button>

                    <style>{`
                        @keyframes growWidth {
                            from { width: 0%; }
                            to { width: 100%; }
                        }
                    `}</style>
                </div>
            )}

            {stage === 'complete' && (
                <div className="max-w-2xl w-full text-center px-4">
                    <div className="bg-white p-12 rounded-[2rem] shadow-2xl">
                        <div className="bg-green-100 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Assessment Complete!</h2>

                        <div className="bg-gray-50 p-6 rounded-xl mb-8">
                            <p className="text-gray-600 mb-3 text-sm font-semibold uppercase tracking-wider">Review your Recording</p>
                            {audioBlob && (
                                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-12" />
                            )}
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>Save & Continue</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
