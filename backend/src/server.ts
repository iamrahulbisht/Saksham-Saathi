import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/environment';
import prisma from './config/database';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import assessmentRoutes from './routes/assessment.routes';
import { uploadRoutes } from './routes/upload.routes';
import attentionRoutes from './routes/attention.routes';
import path from 'path';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

 
const app = express();
const httpServer = createServer(app);

 
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

 
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

 
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/attention', attentionRoutes);
 
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

 
import { CognitiveLoadService } from './services/cognitive-load.service';

const cognitiveLoadService = new CognitiveLoadService(io);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

     
    cognitiveLoadService.initializeEvents(socket);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

 
app.use(notFoundHandler);
app.use(errorHandler);

 
const startServer = async () => {
    try {
         
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        httpServer.listen(env.PORT, () => {
            console.log(`🚀 Server running on http://localhost:${env.PORT}`);
            console.log(`📝 Environment: ${env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

 
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();

 
export { app, io };
