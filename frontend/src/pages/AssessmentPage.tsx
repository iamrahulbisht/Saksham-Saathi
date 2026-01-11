import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AssessmentGame1 from '../components/assessment/AssessmentGame1';
import { db } from '../services/indexedDB';
// import AssessmentGame2 from '../components/assessment/AssessmentGame2'; (Future)

export default function AssessmentPage() {
    const { studentId } = useParams();
    const [currentGame, setCurrentGame] = useState(1);

    async function handleGame1Complete(data: any) {

        // Save to IndexedDB (Offline Support)
        try {
            if (!studentId) {
                console.error("No student ID found");
                return;
            }

            await db.assessments.add({
                // Schema expects 'uuid' as PK defined in indexedDB.ts
                uuid: crypto.randomUUID(),
                studentId: studentId,
                data: data,
                synced: false,
                completedAt: new Date().toISOString()
            } as any); // Type assertion if Interface hasn't been updated yet
            console.log("Game 1 data saved to local DB");
        } catch (e) {
            console.error("Failed to save assessment data", e);
        }

        // Move to Game 2
        setCurrentGame(2);
    }

    return (
        <div>
            {currentGame === 1 && <AssessmentGame1 onComplete={handleGame1Complete} />}
            {/* {currentGame === 2 && <AssessmentGame2 onComplete={handleGame2Complete} />} */}
            {currentGame === 2 && (
                <div className="p-10 text-center">
                    <h2 className="text-2xl">Game 2 (Speech) Placeholder</h2>
                    <p>Ready to implement Step 10...</p>
                </div>
            )}
        </div>
    );
}
