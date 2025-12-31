import { Router } from 'express';
import * as studentController from '../controllers/student.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireTeacher } from '../middleware/rbac.middleware';
import { createStudentSchema, assignTherapistSchema } from '../utils/student.validators';

const router = Router();

 
router.use(authMiddleware);

 
router.post(
    '/',
    requireTeacher,
    validate(createStudentSchema),
    studentController.createStudent
);

 
router.get('/my-students', studentController.getMyStudents);

 
router.get('/:studentId', studentController.getStudent);

 
router.put(
    '/:studentId/assign-therapist',
    requireTeacher,
    validate(assignTherapistSchema),
    studentController.assignTherapist
);

export default router;
