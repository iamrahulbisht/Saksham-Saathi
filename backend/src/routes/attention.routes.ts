import { Router } from 'express';
import { getPrediction } from '../controllers/attention.controller';

const router = Router();

router.get('/prediction', getPrediction);

export default router;
