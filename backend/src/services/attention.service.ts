import prisma from '../config/database';
import { mlClient } from './ml.client';

export class AttentionService {
    async predictAndStore(studentId: string) {
         
        const recentLoadEvents = await prisma.cognitiveLoadEvent.findMany({
            where: {
                studentId,
                detectedAt: {
                    gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { detectedAt: 'desc' }
        });

         
        const assessments = await prisma.assessment.findMany({
            where: { studentId, status: 'completed' },
            orderBy: { completedAt: 'desc' },
            take: 5
        });

         
        const prediction = await mlClient.predictAttention({
            student_id: studentId,
            recent_load_events: recentLoadEvents,
            assessment_scores: assessments
        });

         
        const savedPrediction = await prisma.lstmPrediction.create({
            data: {
                studentId,
                predictionHorizonHours: 48,
                predictions: prediction.predictions,
                modelVersion: 'lstm-v1-simulated'
            }
        });

         
         
        const todayStr = new Date().toISOString().split('T')[0];

         
        const hourlyScores: Record<string, number> = {};
        prediction.predictions.forEach((p: any) => {
             
            const date = new Date();
            date.setHours(date.getHours() + p.hour_offset);
            const hour = date.getHours();
            if (hour >= 8 && hour <= 18) {
                hourlyScores[hour.toString()] = Math.round(p.focus_score);
            }
        });

         
         
         
         
         

        return savedPrediction;
    }

    async getLatestPrediction(studentId: string) {
        return prisma.lstmPrediction.findFirst({
            where: { studentId },
            orderBy: { generatedAt: 'desc' }
        });
    }
}

export const attentionService = new AttentionService();
