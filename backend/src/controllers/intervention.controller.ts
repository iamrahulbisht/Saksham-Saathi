import { Request, Response } from 'express';
import prisma from '../config/database';

// --- Therapist Actions ---

export async function createTherapistNote(req: Request, res: Response) {
    try {
        const therapistId = req.user!.userId;
        const { studentId, clinicalObservations, recommendedInterventions, severity } = req.body;

        const note = await prisma.therapistNote.create({
            data: {
                therapistId,
                studentId,
                clinicalObservations,
                recommendedInterventions, // JSON
                severity
            }
        });

        // Auto-create notification for the teacher
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (student?.teacherId) {
            await prisma.notification.create({
                data: {
                    recipientUserId: student.teacherId,
                    notificationType: 'NEW_INTERVENTION',
                    title: 'New Clinical Note',
                    message: `Therapist added a note for ${student.name}`,
                    priority: 'HIGH'
                }
            });
        }

        res.status(201).json(note);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// --- Teacher Actions ---

export async function logIntervention(req: Request, res: Response) {
    try {
        const teacherId = req.user!.userId;
        const { studentId, therapistNoteId, interventionImplemented, effectivenessRating } = req.body;

        const log = await prisma.teacherLog.create({
            data: {
                teacherId,
                studentId,
                therapistNoteId,
                interventionImplemented,
                effectivenessRating
            }
        });

        res.status(201).json(log);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// --- Parent Actions ---

export async function getParentReports(req: Request, res: Response) {
    try {
        const parentId = req.user!.userId;
        const reports = await prisma.parentReport.findMany({
            where: { parentId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function acknowledgeReport(req: Request, res: Response) {
    try {
        const { reportId } = req.params;
        const parentId = req.user!.userId;

        const report = await prisma.parentReport.update({
            where: { id: reportId },
            data: { parentAcknowledged: true }
        });

        res.json(report);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
