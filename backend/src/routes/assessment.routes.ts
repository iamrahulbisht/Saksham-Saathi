import { Router } from 'express';
import * as assessmentController from '../controllers/assessment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();


// Assuming submitGame is protected
router.post('/start', authMiddleware, assessmentController.startAssessment);
router.post('/:assessment_id/game/1/submit', authMiddleware, assessmentController.submitGame);
router.post('/:assessment_id/game/2/submit', authMiddleware, assessmentController.submitGame2);
router.post('/:assessment_id/game/3/submit', authMiddleware, assessmentController.submitGame3);
router.post('/:assessment_id/game/4/submit', authMiddleware, assessmentController.submitGame4);
router.post('/:assessment_id/game/5/submit', authMiddleware, assessmentController.submitGame5);
router.post('/:assessmentId/complete', authMiddleware, assessmentController.completeAssessment);

export default router;
