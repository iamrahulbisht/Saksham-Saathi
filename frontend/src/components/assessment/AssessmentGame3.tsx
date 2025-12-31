import React, { useRef, useState, useEffect } from 'react';

interface AssessmentGame3Props {
    duration: number;
    onSubmit: (data: {
        handwritingStrokes: any[];
        duration: number;
    }) => void;
    onCancel: () => void;
}

interface Point {
    x: number;
    y: number;
    time: number;
}

const AssessmentGame3: React.FC<AssessmentGame3Props> = ({ duration, onSubmit, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [strokes, setStrokes] = useState<Point[][]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [timeLeft, setTimeLeft] = useState(duration);

     
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();  
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const startDrawing = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.setPointerCapture(e.pointerId);
        setIsDrawing(true);

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            time: Date.now()
        };

        setCurrentStroke([point]);

         
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
        }
    };

    const draw = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            time: Date.now()
        };

        setCurrentStroke(prev => [...prev, point]);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
    };

    const stopDrawing = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) canvas.releasePointerCapture(e.pointerId);

        setIsDrawing(false);
        setStrokes(prev => [...prev, currentStroke]);
        setCurrentStroke([]);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setStrokes([]);
    };

    const handleSubmit = () => {
         
        const finalStrokes = isDrawing ? [...strokes, currentStroke] : strokes;
        onSubmit({
            handwritingStrokes: finalStrokes,
            duration: duration - timeLeft
        });
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="heading-2" style={{ margin: 0 }}>Game 3: Handwriting</h2>
                    <div>
                        <span style={{ marginRight: '1rem', fontWeight: 'bold', color: timeLeft < 10 ? 'var(--error)' : 'inherit' }}>
                            Time: {timeLeft}s
                        </span>
                        <button onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
                    </div>
                </div>

                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-body)', borderRadius: '12px' }}>
                    <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>Copy the following shape/text:</h3>

                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        fontFamily: 'cursive',
                        marginBottom: '2rem',
                        letterSpacing: '5px',
                        color: 'var(--text-primary)'
                    }}>
                        Hello World
                    </div>

                    <div style={{
                        position: 'relative',
                        display: 'inline-block',
                        border: '2px solid var(--text-primary)',
                        backgroundColor: 'white',
                        cursor: 'crosshair',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={300}
                            onPointerDown={startDrawing}
                            onPointerMove={draw}
                            onPointerUp={stopDrawing}
                            onPointerLeave={stopDrawing}
                            style={{ touchAction: 'none' }}
                        />
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            onClick={clearCanvas}
                            className="btn btn-secondary"
                        >
                            Clear
                        </button>

                        <button
                            onClick={() => handleSubmit()}
                            className="btn btn-primary"
                        >
                            Submit Drawing
                        </button>
                    </div>
                </div>
                <p className="text-muted text-small" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    Use your mouse or touch screen to draw inside the box.
                </p>
            </div>
        </div>
    );
};

export default AssessmentGame3;
