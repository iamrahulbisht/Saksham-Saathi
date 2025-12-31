import React, { useState } from 'react';

interface AssessmentGame4Props {
    duration: number;
    onSubmit: (data: {
        responseData: any;
        duration: number;
    }) => void;
    onCancel: () => void;
}

const AssessmentGame4: React.FC<AssessmentGame4Props> = ({ duration: _duration, onSubmit, onCancel }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [startTime] = useState(Date.now());

     
     
    const questions = [
        {
            id: 1,
            prompt: "Which shape comes next?",
            pattern: "🟥 🟦 🟥 🟦 ...",
            options: ["🟥", "🟦", "🟩", "🟨"],
            correct: "🟥"
        },
        {
            id: 2,
            prompt: "Select the odd one out:",
            pattern: "▲ ▲ ▲ ▼",
            options: ["▲", "▼", "◆", "●"],
            correct: "▼"
        },
        {
            id: 3,
            prompt: "Complete the sequence:",
            pattern: "1, 2, 4, 8, ...",
            options: ["10", "12", "16", "20"],
            correct: "16"
        }
    ];

    const handleAnswer = (option: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion]: option }));

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
             
            const endTime = Date.now();
            const timeTaken = (endTime - startTime) / 1000;

             
            const responseData = questions.map((q, idx) => ({
                questionId: q.id,
                response: answers[idx] ? answers[idx] : option,  
                correct: q.correct,
                isCorrect: (answers[idx] ? answers[idx] : option) === q.correct
            }));

            onSubmit({
                responseData: {
                    type: 'pattern_recognition',
                    answers: responseData,
                    score: responseData.filter(r => r.isCorrect).length / questions.length
                },
                duration: timeTaken
            });
        }
    };

    const q = questions[currentQuestion];

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="card">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="heading-2" style={{ margin: 0 }}>Game 4: Pattern Recognition</h2>
                    <button onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
                </div>

                <div style={{ padding: '2rem', backgroundColor: 'var(--bg-body)', borderRadius: '12px', textAlign: 'center' }}>
                    <div className="text-muted" style={{ marginBottom: '0.5rem' }}>Question {currentQuestion + 1} of {questions.length}</div>
                    <h3 className="heading-3" style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>{q.prompt}</h3>

                    <div style={{
                        padding: '2.5rem',
                        fontSize: '3rem',
                        backgroundColor: 'white',
                        marginBottom: '2.5rem',
                        borderRadius: '8px',
                        letterSpacing: '10px',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {q.pattern}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {q.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(opt)}
                                className="btn btn-outline"
                                style={{
                                    padding: '1.5rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    height: 'auto',
                                    borderColor: 'var(--primary)',
                                    color: 'var(--primary)',
                                    backgroundColor: 'white'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-body)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentGame4;
