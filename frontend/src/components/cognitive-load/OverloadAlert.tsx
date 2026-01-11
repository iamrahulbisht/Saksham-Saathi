
interface OverloadAlertProps {
    severity: 'mild' | 'moderate' | 'severe';
    onTakeBreak: () => void;
    onContinue: () => void;
}

export default function OverloadAlert({ severity, onTakeBreak, onContinue }: OverloadAlertProps) {
    const messages = {
        mild: "You seem a bit tired. (आप थोड़ा थके लग रहे हैं)",
        moderate: "Let's take a 2-minute break! (चलिए 2 मिनट का ब्रेक लें!)",
        severe: "A break is necessary. (ब्रेक लेना ज़रूरी है)"
    };

    const isSevere = severity === 'severe';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-yellow-400 animate-bounce-in">
                <div className="text-6xl mb-6 animate-pulse">🧠</div>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">{messages[severity]}</h2>

                {isSevere ? (
                    <div>
                        <p className="text-lg mb-8 text-red-600 font-medium">आपका दिमाग बहुत थक गया है। कृपया 5 मिनट आराम करें।</p>
                        <button
                            onClick={onTakeBreak}
                            className="bg-green-600 text-white px-8 py-4 rounded-xl text-xl hover:bg-green-700 w-full shadow-lg transition transform hover:scale-105"
                        >
                            ✓ ब्रेक लें (Take Break)
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg mb-8 text-gray-600">क्या आप अभी ब्रेक लेना चाहेंगे?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={onTakeBreak}
                                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-bold shadow transition"
                            >
                                हाँ (Yes)
                            </button>
                            <button
                                onClick={onContinue}
                                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
                            >
                                जारी रखें (Continue)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
