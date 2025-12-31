import express, { Request, Response } from 'express';
import { attentionService } from '../services/attention.service';

const router = express.Router();

router.post('/predict/:studentId', async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const result = await attentionService.predictAndStore(studentId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("Attention prediction error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/schedule/:studentId', async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const result = await attentionService.getLatestPrediction(studentId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error("Get schedule error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
