import React, { useEffect, useRef } from 'react';
import { socketService } from '../../services/socket';

interface RealTimeMonitorProps {
    studentId: string;
    sessionId?: string;
    taskType?: string;
    isActive: boolean;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
    studentId,
    sessionId = 'session-1',
    taskType = 'general',
    isActive
}) => {
    const lastInteractionTime = useRef<number>(Date.now());
    const mousePositions = useRef<{ x: number, y: number, time: number }[]>([]);

    useEffect(() => {
        if (!isActive) return;

         
        socketService.connect();

         
        let checkInterval: any;

         
        const handleInteraction = (e: MouseEvent | KeyboardEvent) => {
            lastInteractionTime.current = Date.now();

            if (e instanceof MouseEvent) {
                mousePositions.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
                if (mousePositions.current.length > 20) mousePositions.current.shift();
            }
        };

        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('click', handleInteraction);

         
        checkInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastInteraction = now - lastInteractionTime.current;

             
             
             

            checkOverload(timeSinceLastInteraction);
        }, 3000);  

        const checkOverload = (pauseMs: number) => {
             
             
             

            const metrics = {
                responsePauseMs: pauseMs,
                mouseHoverHesitationMs: 0,  
                consecutiveErrors: 0,  
                fixationTimeAvgMs: 0  
            };

            console.log("Emitting Cognitive Load Metrics:", metrics);  

            socketService.emit('cognitive-load:metrics', {
                studentId,
                sessionId,
                taskType,
                metrics,
                timestamp: Date.now()
            });
        };

        return () => {
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            clearInterval(checkInterval);
             
        };
    }, [isActive, studentId, sessionId, taskType]);

    return null;  
};

export default RealTimeMonitor;
