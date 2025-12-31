import { Router } from 'express';
import * as assessmentController from '../controllers/assessment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireTeacher, requireRole } from '../middleware/rbac.middleware';

const router = Router();

 
router.use(authMiddleware);

 
router.post('/start', requireTeacher, assessmentController.startAssessment);

 
router.post('/:assessmentId/game/:gameNumber/submit', assessmentController.submitGame);

 
router.get('/:assessmentId', assessmentController.getAssessment);

 
router.get('/student/:studentId', assessmentController.getStudentAssessments);

 
router.post('/:assessmentId/complete', assessmentController.completeAssessment);

export default router;
