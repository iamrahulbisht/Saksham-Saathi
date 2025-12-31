import prisma from '../config/database';
import { mlClient } from './ml.client';
import { Server, Socket } from 'socket.io';

interface CognitiveMetric {
    sessionId: string;
    studentId: string;
    taskType: string;
    metrics: {
        fixationTimeAvgMs?: number;
        consecutiveErrors?: number;
        responsePauseMs?: number;
        backspaceCount?: number;
        mouseHoverHesitationMs?: number;
    };
    timestamp: number;
}

export class CognitiveLoadService {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    public initializeEvents(socket: Socket) {
        socket.on('cognitive-load:metrics', async (data: CognitiveMetric) => {
            try {
                await this.processMetrics(socket, data);
            } catch (error) {
                console.error('Error processing cognitive metrics:', error);
            }
        });
    }

    private async processMetrics(socket: Socket, data: CognitiveMetric) {
         
        const prediction = await mlClient.predictCognitiveLoad({
            metrics: data.metrics,
            task_type: data.taskType
        });

         
        if (prediction.overload_detected || prediction.risk_score > 0.7) {
            console.log(`⚠️ Cognitive Overload Detected for Student ${data.studentId}`);

             
            const event = await prisma.cognitiveLoadEvent.create({
                data: {
                    studentId: data.studentId,
                    sessionId: data.sessionId,
                    taskType: data.taskType,
                    overloadDetected: true,
                    overloadSeverity: prediction.severity || 'moderate',
                    fixationTimeAvgMs: data.metrics.fixationTimeAvgMs,
                    consecutiveErrors: data.metrics.consecutiveErrors,
                    responsePauseMs: data.metrics.responsePauseMs,
                    backspaceCount: data.metrics.backspaceCount,
                    mouseHoverHesitationMs: data.metrics.mouseHoverHesitationMs,
                    interventionTriggered: prediction.intervention || 'break_suggested',
                }
            });

             
            socket.emit('alert:overload', {
                eventId: event.id,
                severity: prediction.severity,
                message: "Taking a short break might help!",
                intervention: prediction.intervention
            });

             
             
        }
    }
}
