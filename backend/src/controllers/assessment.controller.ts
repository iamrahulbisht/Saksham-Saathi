import { Request, Response } from 'express';
import * as assessmentService from '../services/assessment.service';

 
export async function startAssessment(req: Request, res: Response): Promise<void> {
    try {
        const { studentId, language } = req.body;

        if (!studentId) {
            res.status(400).json({
                success: false,
                message: 'Student ID is required',
            });
            return;
        }

        const result = await assessmentService.startAssessment(studentId, language || 'en');

        res.status(201).json({
            success: true,
            message: 'Assessment started successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Start assessment error:', error);
        res.status(error.message === 'Student not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to start assessment',
        });
    }
}

 
export async function submitGame(req: Request, res: Response): Promise<void> {
    try {
        const { assessmentId, gameNumber } = req.params;
        const gameData = req.body;

        if (!assessmentId || !gameNumber) {
            res.status(400).json({
                success: false,
                message: 'Assessment ID and game number are required',
            });
            return;
        }

        const result = await assessmentService.submitGameData(
            assessmentId,
            parseInt(gameNumber, 10),
            gameData
        );

        res.status(200).json({
            success: true,
            message: 'Game data submitted successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Submit game error:', error);

        const statusCode =
            error.message === 'Assessment not found' ? 404 :
                error.message === 'Invalid game number' ? 400 :
                    error.message === 'Assessment is not in progress' ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to submit game data',
        });
    }
}

 
export async function getAssessment(req: Request, res: Response): Promise<void> {
    try {
        const { assessmentId } = req.params;

        if (!assessmentId) {
            res.status(400).json({
                success: false,
                message: 'Assessment ID is required',
            });
            return;
        }

        const assessment = await assessmentService.getAssessmentById(assessmentId);

        res.status(200).json({
            success: true,
            data: assessment,
        });
    } catch (error: any) {
        console.error('Get assessment error:', error);
        res.status(error.message === 'Assessment not found' ? 404 : 500).json({
            success: false,
            message: error.message || 'Failed to get assessment',
        });
    }
}

 
export async function getStudentAssessments(req: Request, res: Response): Promise<void> {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            res.status(400).json({
                success: false,
                message: 'Student ID is required',
            });
            return;
        }

        const assessments = await assessmentService.getStudentAssessments(studentId);

        res.status(200).json({
            success: true,
            data: assessments,
        });
    } catch (error: any) {
        console.error('Get student assessments error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get assessments',
        });
    }
}

 
export async function completeAssessment(req: Request, res: Response): Promise<void> {
    try {
        const { assessmentId } = req.params;

        if (!assessmentId) {
            res.status(400).json({
                success: false,
                message: 'Assessment ID is required',
            });
            return;
        }

        const result = await assessmentService.completeAssessment(assessmentId);

        res.status(200).json({
            success: true,
            message: 'Assessment completed successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Complete assessment error:', error);

        const statusCode =
            error.message === 'Assessment not found' ? 404 :
                error.message === 'Not all games are completed' ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to complete assessment',
        });
    }
}
