import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validators';

const router = Router();

 
router.post('/register', validate(registerSchema), authController.register);

 
router.post('/login', validate(loginSchema), authController.login);

 
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

 
router.post('/logout', authMiddleware, authController.logout);

 
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
