import React, { useState, useRef } from 'react';
import { uploadAPI } from '../../services/api';

interface AssessmentGame2Props {
    sentences: string[];
    duration: number;
    onSubmit: (data: {
        speechAudioUrl: string;
        duration: number;
    }) => void;
    onCancel: () => void;
}

const AssessmentGame2: React.FC<AssessmentGame2Props> = ({ sentences, duration, onSubmit, onCancel }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(duration);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));

                 
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            setError('');

             
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error("Error accessing microphone:", err);
            setError('Could not access microphone. Please allow permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleSubmit = async () => {
        if (!audioBlob) return;

        try {
            setUploading(true);
            setError('');

             
            const uploadResponse = await uploadAPI.uploadAudio(audioBlob);
            const serverAudioUrl = uploadResponse.data.data.url;

             
            onSubmit({
                speechAudioUrl: serverAudioUrl,
                duration: duration - timeLeft
            });

        } catch (err: any) {
            console.error("Upload failed:", err);
            setError('Failed to upload recording. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRetake = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setTimeLeft(duration);
        setError('');
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="heading-2" style={{ margin: 0 }}>Game 2: Speech Fluency</h2>
                    <button onClick={onCancel} className="btn btn-outline">Cancel</button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Read the following sentences aloud:</h3>

                    <div style={{
                        fontSize: '1.25rem',
                        lineHeight: '1.6',
                        padding: '1.5rem',
                        backgroundColor: 'var(--bg-body)',
                        borderLeft: '4px solid var(--primary)',
                        marginBottom: '2rem',
                        borderRadius: '0 8px 8px 0'
                    }}>
                        {sentences.map((sentence, idx) => (
                            <p key={idx} style={{ marginBottom: '1rem' }}>{sentence}</p>
                        ))}
                        {sentences.length === 0 && <p>The quick brown fox jumps over the lazy dog.</p>}
                    </div>

                    {error && (
                        <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1.5rem', padding: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                        {!audioBlob && !recording && (
                            <button
                                onClick={startRecording}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--error)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(220, 53, 69, 0.4)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>REC</span>
                            </button>
                        )}

                        {recording && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'var(--error)',
                                    marginBottom: '1rem',
                                    animation: 'pulse 1s infinite'
                                }}>
                                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                                </div>
                                <button
                                    onClick={stopRecording}
                                    className="btn btn-secondary"
                                    style={{ borderRadius: '30px', padding: '0.75rem 2rem' }}
                                >
                                    Stop Recording
                                </button>
                            </div>
                        )}

                        {audioBlob && (
                            <div style={{ width: '100%', textAlign: 'center' }}>
                                <audio controls src={audioUrl!} style={{ width: '100%', maxWidth: '400px', marginBottom: '1.5rem' }} />

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    <button
                                        onClick={handleRetake}
                                        disabled={uploading}
                                        className="btn btn-outline"
                                    >
                                        Retake
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={uploading}
                                        className="btn btn-success"
                                        style={{ opacity: uploading ? 0.7 : 1 }}
                                    >
                                        {uploading ? 'Uploading & Analyzing...' : 'Submit Recording'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AssessmentGame2;
