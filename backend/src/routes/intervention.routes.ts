import { Router } from 'express';
import { getInterventions } from '../controllers/intervention.controller';

const router = Router();

router.get('/', getInterventions);

export default router;
