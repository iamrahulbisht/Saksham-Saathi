import { Request, Response } from 'express';
import prisma from '../config/database';

// --- Teacher Dashboard ---
export async function getTeacherDashboard(req: Request, res: Response) {
    try {
        const teacherId = req.user!.userId;

        // Fetch students assigned to teacher
        const students = await prisma.student.findMany({
            where: { teacherId: teacherId }, // Corrected from assigned_teacher_id
            include: {
                assessments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Calculate stats in memory for prototype simplicity or do complex queries
        const studentStats = students.map(s => {
            const risk = (s.screeningRisks as any) || {};
            const lastAssessment = s.assessments[0];
            return {
                ...s,
                student_id: s.id,
                screening_status: lastAssessment?.status === 'COMPLETED' ? 'completed' : 'pending',
                dyslexia_risk: risk.dyslexia === 'High' ? 100 : (risk.dyslexia === 'Moderate' ? 50 : 0), // Mapping enum to score if needed
                adhd_risk: risk.adhd === 'High' ? 100 : 0,
                // If storing raw scores in Json, utilize them:
                // Assuming screeningRisks is { "dyslexia": 85, "adhd": 40 }
            };
        });

        const active_interventions = await prisma.intervention.count({
            where: {
                student: { teacherId: teacherId },
                isActive: true // Corrected from is_active
            }
        });

        let overload_alerts: any[] = [];
        try {
            overload_alerts = await prisma.cognitiveLoadEvent.findMany({
                where: {
                    student: { teacherId: teacherId },
                    overloadDetected: true,
                    timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                },
                include: { student: { select: { name: true } } },
                take: 5,
                orderBy: { timestamp: 'desc' }
            });
        } catch (e) {
            console.warn("Cognitive Load Event table issue:", e);
        }

        res.json({
            total_students: students.length,
            screenings_completed: studentStats.filter(s => s.screening_status === 'completed').length,
            // Assuming simplified count based on presence of risk data
            high_risk_count: studentStats.filter(s => (s.dyslexia_risk > 70 || s.adhd_risk > 70)).length,
            active_interventions,
            students: studentStats,
            overload_alerts
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// --- Therapist Dashboard ---
export async function getTherapistDashboard(req: Request, res: Response) {
    try {
        const therapistId = req.user!.userId;

        const assigned_students = await prisma.student.findMany({
            where: { therapistId: therapistId }, // Corrected
            include: {
                assessments: {
                    where: { status: 'COMPLETED' },
                    orderBy: { updatedAt: 'desc' }, // Corrected completed_at
                    take: 1
                },
                interventions: { where: { isActive: true } }
            }
        });

        // Helper to check reviews
        // This logic depends on business rules. 
        // Example: Completed assessment but no interventions?
        const pending_reviews = assigned_students.filter(s =>
            s.assessments.length > 0 && s.interventions.length === 0
        ).length;

        res.json({
            assigned_students_count: assigned_students.length,
            pending_reviews,
            active_cases: assigned_students.filter(s => s.interventions.length > 0).length,
            recent_data: assigned_students
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// --- Parent Dashboard ---
export async function getParentDashboard(req: Request, res: Response) {
    try {
        const parentId = req.user!.userId;

        const childrenLinks = await prisma.studentParent.findMany({ // Corrected table name casing
            where: { parentId: parentId }, // Corrected column casing
            include: {
                student: {
                    include: {
                        interventions: { where: { isActive: true } }
                    }
                }
            }
        });

        const children = childrenLinks.map(link => link.student);

        const unread_reports = await prisma.parentReport.count({ // Corrected table name
            where: { parentId: parentId, parentAcknowledged: false } // Corrected column
        });

        res.json({
            children,
            unread_reports
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
