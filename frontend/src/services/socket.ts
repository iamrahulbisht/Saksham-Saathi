import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(token: string) {
    if (socket) socket.disconnect();

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: { token },
        autoConnect: true
    });

    socket.on('connect', () => console.log("WS Connected"));
    return socket;
}

export const getSocket = () => socket;
