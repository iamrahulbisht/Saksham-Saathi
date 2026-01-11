import { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';

export default function AssessmentGame3({ onComplete }: { onComplete: (data: any) => void }) {
    const [currentLetter, setCurrentLetter] = useState(0);
    const [allStrokes, setAllStrokes] = useState<any[]>([]);
    const canvasRef = useRef<any>(null);

    // Mixed script testing (English + Hindi)
    const lettersToWrite = ['b', 'd', 'p', 'क', 'ख'];
    const currentTask = lettersToWrite[currentLetter];

    function handleSaveCurrentTask() {
        if (canvasRef.current) {
            // Get proprietary save data from react-canvas-draw
            const saveData = canvasRef.current.getSaveData();
            const parsedData = JSON.parse(saveData);

            // Get base64 image of current drawing
            // Note: getDataURL returns the whole canvas
            const imageDataUrl = canvasRef.current.getDataURL('image/png', false, 0xffffff);

            return {
                letter: currentTask,
                strokes: parsedData.lines, // Array of strokes with points
                image: imageDataUrl
            };
        }
        return null;
    }

    function handleNext() {
        const taskData = handleSaveCurrentTask();
        if (taskData) {
            const updatedStrokes = [...allStrokes, taskData];
            setAllStrokes(updatedStrokes);

            if (currentLetter < lettersToWrite.length - 1) {
                setCurrentLetter(prev => prev + 1);
                canvasRef.current?.clear();
            } else {
                // All letters completed
                onComplete({
                    tasks: updatedStrokes, // List containing strokes + image for each letter
                    letters_attempted: lettersToWrite
                });
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <div className="max-w-3xl w-full">
                <h2 className="text-3xl font-bold mb-4 text-center">खेल 3: लिखावट परीक्षण (Handwriting Test)</h2>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
                    <p className="text-xl mb-2 text-gray-600">इस अक्षर की नकल करें (Copy this letter):</p>
                    <div className="text-8xl font-bold text-blue-600 my-4 border-2 border-dashed border-blue-200 inline-block p-4 rounded-lg bg-blue-50 w-32 h-32 flex items-center justify-center mx-auto">
                        {currentTask}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-lg mb-4 flex justify-center border-4 border-gray-200">
                    <CanvasDraw
                        ref={canvasRef}
                        brushColor="#000000"
                        brushRadius={3}
                        lazyRadius={2} // Slight smoothing
                        canvasWidth={500}
                        canvasHeight={300}
                        className="cursor-crosshair"
                        hideGrid={false}
                        gridColor="#e5e7eb"
                    />
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => canvasRef.current?.clear()}
                        className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                    >
                        <span>🗑️</span> मिटाएं (Clear)
                    </button>

                    <button
                        onClick={handleNext}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md flex items-center gap-2"
                    >
                        {currentLetter < lettersToWrite.length - 1 ? 'अगला (Next) ➡️' : 'पूर्ण (Complete) ✅'}
                    </button>
                </div>

                <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentLetter) / lettersToWrite.length) * 100}%` }}
                    ></div>
                    <p className="text-right text-sm text-gray-600 mt-1">
                        Task {currentLetter + 1} of {lettersToWrite.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
