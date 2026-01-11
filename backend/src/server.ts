import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './config/socket';
import authRoutes from './routes/auth.routes';
import assessmentRoutes from './routes/assessment.routes';
import dashboardRoutes from './routes/dashboard.routes';

import studentRoutes from './routes/student.routes';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/students', studentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    httpServer.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
    });
}

export default app;
