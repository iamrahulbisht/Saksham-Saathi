import { useState } from 'react';

interface Question {
    id: number;
    pattern: string[];
    options: string[];
    correct: number;
}

const questions: Question[] = [
    { id: 1, pattern: ['🔴', '🟢', '🔴', '🟢', '?'], options: ['🔴', '🟢', '🔵'], correct: 0 },
    { id: 2, pattern: ['⭐', '⭐⭐', '⭐⭐⭐', '?'], options: ['⭐', '⭐⭐⭐⭐', '⭐⭐'], correct: 1 },
    { id: 3, pattern: ['⬛', '⬜', '⬛', '?'], options: ['⬜', '⬛', '🟥'], correct: 0 },
    { id: 4, pattern: ['⬆️', '➡️', '⬇️', '?'], options: ['⬅️', '⬆️', '↗️'], correct: 0 },
    // ... more questions ...
];

export default function AssessmentGame4({ onComplete }: { onComplete: (data: any) => void }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [responses, setResponses] = useState<any[]>([]);
    const [startTime, setStartTime] = useState(Date.now());

    function handleAnswer(optionIndex: number) {
        const responseTime = Date.now() - startTime;
        const isCorrect = questions[currentQ].correct === optionIndex;

        const newResponse = {
            question_id: questions[currentQ].id,
            response: optionIndex,
            correct: isCorrect,
            response_time_ms: responseTime
        };

        setResponses(prev => [...prev, newResponse]);

        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
            setStartTime(Date.now());
        } else {
            // Game Complete - Send all data
            onComplete({
                responses: [...responses, newResponse], // Include the last one
                total_questions: questions.length
            });
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
            <div className="max-w-3xl w-full bg-white p-10 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-2 text-center text-purple-700">खेल 4: पैटर्न पहचान</h2>
                <h3 className="text-xl mb-8 text-center text-gray-500">अगला क्या आता है? (What comes next?)</h3>

                <div className="bg-gray-50 p-8 rounded-lg border-2 border-gray-200 mb-8 text-center">
                    <div className="flex items-center justify-center gap-6 text-7xl">
                        {questions[currentQ].pattern.map((item, i) => (
                            <span key={i} className={item === '?' ? 'animate-bounce' : ''}>{item}</span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {questions[currentQ].options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            className="text-6xl p-8 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition transform hover:scale-105"
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="mt-8 text-center text-gray-400">
                    Question {currentQ + 1} of {questions.length}
                </div>
            </div>
        </div>
    );
}
