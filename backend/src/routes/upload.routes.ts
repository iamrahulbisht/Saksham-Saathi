import express from 'express';
import { upload } from '../middleware/upload.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

 
router.post('/audio', authMiddleware, upload.single('audio'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

         
         
         
        const fileUrl = `/uploads/audio/${req.file.filename}`;

        res.status(201).json({
            status: 'success',
            data: {
                url: fileUrl,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'File upload failed'
        });
    }
});

export const uploadRoutes = router;
