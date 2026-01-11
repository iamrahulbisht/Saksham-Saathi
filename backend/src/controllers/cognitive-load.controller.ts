import { Request, Response } from 'express';
import { MLIntegrationService } from '../services/ml-integration.service';

const mlService = new MLIntegrationService();

export async function logEvent(req: Request, res: Response) {
    try {
        const result = await mlService.detectCognitiveLoad(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
