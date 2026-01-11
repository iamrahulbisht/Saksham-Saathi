import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
    getTeacherDashboard,
    getTherapistDashboard,
    getParentDashboard
} from '../controllers/dashboard.controller';

const router = Router();

router.get('/teacher', authenticate, authorize(['TEACHER']), getTeacherDashboard);
router.get('/therapist', authenticate, authorize(['THERAPIST']), getTherapistDashboard);
router.get('/parent', authenticate, authorize(['PARENT']), getParentDashboard);

export default router;
