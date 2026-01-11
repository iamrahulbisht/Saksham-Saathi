import { Request, Response } from 'express';

export async function syncData(req: Request, res: Response) {
    res.json({ message: "Sync successful" });
}
