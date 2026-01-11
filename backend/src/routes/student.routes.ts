import { Router } from 'express';
import { getStudent, createStudent, getMyStudents } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createStudent);
router.get('/my-students', authenticate, getMyStudents);
router.get('/:id', authenticate, getStudent);

export default router;
