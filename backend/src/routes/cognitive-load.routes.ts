import { Router } from 'express';
import { logEvent } from '../controllers/cognitive-load.controller';

const router = Router();

router.post('/event', logEvent);

export default router;
