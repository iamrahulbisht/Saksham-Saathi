import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export function initializeSocket(httpServer: HTTPServer) {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
            credentials: true
        }
    });

    // Auth Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            socket.data.userId = decoded.userId;
            socket.data.role = decoded.role;
            next();
        } catch (e) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const { userId, role } = socket.data;
        console.log(`Socket connected: ${userId} (${role})`);

        // Join Rooms
        socket.join(`user:${userId}`);
        socket.join(`role:${role}`);
        if (role === 'TEACHER') socket.join('teachers');

        socket.on('disconnect', () => console.log(`Socket disconnected: ${userId}`));
    });

    return io;
}

export function notifyTeacher(teacherId: string, event: string, data: any) {
    if (io) io.to(`user:${teacherId}`).emit(event, data);
}

export function notifyUser(userId: string, event: string, data: any) {
    if (io) io.to(`user:${userId}`).emit(event, data);
}
