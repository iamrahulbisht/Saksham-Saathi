import { Request, Response } from 'express';
import prisma from '../config/database';

// Game 1: Eye Tracking
export async function startAssessment(req: Request, res: Response) {
    try {
        const { studentId, language } = req.body;
        // Logic to create assessment record
        const assessment = await prisma.assessment.create({
            data: {
                studentId,
                status: 'IN_PROGRESS',
                currentGame: 1,
                language: language || 'en'
            }
        });

        res.json({
            assessmentId: assessment.id,
            gameInstructions: {
                game1: "Follow the dot on the screen.",
                // ... placeholders
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function submitGame(req: Request, res: Response) {
    try {
        const { assessment_id, game_number } = req.params;
        const { eye_tracking_data } = req.body;

        await prisma.assessmentGame.create({
            data: {
                assessmentId: assessment_id,
                gameNumber: parseInt(game_number),
                eyeTrackingData: eye_tracking_data,
            }
        });

        res.json({
            game_number: parseInt(game_number),
            status: 'completed',
            next_game: 2
        });
    } catch (error) {
        console.error("Submit Game Error", error);
        res.status(500).json({ error: "Failed to submit game data" });
    }
}

// Game 2: Speech
export async function submitGame2(req: Request, res: Response) {
    try {
        const { assessment_id } = req.params;
        const { audio_base64, duration_seconds, sentences } = req.body;

        // Dynamic import to avoid top-level issues if service implies other deps, or just standard import
        // Note: In production use top-level import. ensuring s3.service exists.
        const { uploadAudioToS3 } = require('../services/s3.service');

        const studentId = req.user?.userId || 'anonymous';
        let audioUrl = '';

        try {
            audioUrl = await uploadAudioToS3(audio_base64, studentId, 2);
        } catch (e) {
            console.error("S3 Upload Error", e);
        }

        await prisma.assessmentGame.create({
            data: {
                assessmentId: assessment_id,
                gameNumber: 2,
                speechAudioUrl: audioUrl,
                // Storing scores in JSONB if schema supports it, strictly following schema would be better but this is prototype
                // Assuming schema has map-able fields or ignored by Prisma if strict
                // scores: { sentences, duration_seconds } 
            }
        });

        res.json({ game_number: 2, status: 'completed', next_game: 3 });
    } catch (error) {
        console.error("Submit Game 2 Error", error);
        res.status(500).json({ error: "Failed to submit speech data" });
    }
}

// Game 3: Handwriting
export async function submitGame3(req: Request, res: Response) {
    try {
        const { assessment_id } = req.params;
        const { tasks } = req.body;
        const { uploadImageToS3 } = require('../services/s3.service');

        const processedTasks = [];
        const userId = req.user?.userId || 'anonymous';

        for (const task of tasks) {
            const key = `assessments/${userId}/${assessment_id}/game3_${task.letter}.png`;
            const imageUrl = await uploadImageToS3(task.image, key);
            processedTasks.push({
                letter: task.letter,
                strokes: task.strokes,
                imageUrl: imageUrl
            });
        }

        await prisma.assessmentGame.create({
            data: {
                assessmentId: assessment_id,
                gameNumber: 3,
                handwritingStrokes: processedTasks,
                handwritingImageUrl: processedTasks[0]?.imageUrl || ''
            }
        });

        res.json({ game_number: 3, status: 'completed', next_game: 4 });
    } catch (error) {
        console.error("Submit Game 3 Error", error);
        res.status(500).json({ error: "Failed to submit handwriting data" });
    }
}

// Game 4: Pattern Recognition
export async function submitGame4(req: Request, res: Response) {
    try {
        const { responses } = req.body;
        await prisma.assessmentGame.create({
            data: {
                assessmentId: req.params.assessment_id,
                gameNumber: 4,
                // responseData: responses 
            }
        });

        res.json({ game_number: 4, status: 'completed', next_game: 5 });
    } catch (error) {
        console.error("Submit Game 4 Error", error);
        res.status(500).json({ error: "Failed to submit pattern game" });
    }
}

// Game 5: Response Time
export async function submitGame5(req: Request, res: Response) {
    try {
        const { trials, variability, mean_response_time } = req.body;

        await prisma.assessmentGame.create({
            data: {
                assessmentId: req.params.assessment_id,
                gameNumber: 5,
                // responseData: { trials, variability, mean_response_time }
            }
        });

        // Mark Assessment as COMPLETED
        await prisma.assessment.update({
            where: { id: req.params.assessment_id },
            data: { status: 'COMPLETED' }
        });

        res.json({
            game_number: 5,
            status: 'completed',
            all_games_complete: true,
            message: "Assessment finished. Generating report..."
        });
    } catch (error) {
        console.error("Submit Game 5 Error", error);
        res.status(500).json({ error: "Failed to submit response game" });
    }
}

export async function completeAssessment(req: Request, res: Response) {
    try {
        const { assessmentId } = req.params;
        const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });

        if (!assessment) return res.status(404).json({ error: "Assessment not found" });

        // Trigger ML Prediction
        const { MLIntegrationService } = require('../services/ml-integration.service');
        const mlService = new MLIntegrationService();

        // Fetch all game data to pass to ML... in real app query DB
        const prediction = await mlService.predictScreening({
            student_id: assessment.studentId,
            assessment_data: {}
        });

        // Update assessment with results
        // await prisma.assessment.update(...)

        res.json(prediction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
