import { notifyTeacher, notifyUser } from '../config/socket';
import prisma from '../config/database';

export async function sendCognitiveOverloadAlert(data: {
    studentId: string;
    teacherId: string;
    severity: string;
    taskType: string;
}) {
    const student = await prisma.student.findUnique({
        where: { id: data.studentId }
    });

    if (!student) return;

    // Persist
    await prisma.notification.create({
        data: {
            recipientUserId: data.teacherId,
            notificationType: 'COGNITIVE_OVERLOAD',
            title: 'Cognitive Overload Alert',
            message: `${student.name} is experiencing ${data.severity} overload.`,
            relatedResourceId: data.studentId,
            priority: data.severity === 'severe' ? 'URGENT' : 'HIGH'
        }
    });

    // Emit
    notifyTeacher(data.teacherId, 'cognitive_overload_alert', {
        studentId: data.studentId,
        studentName: student.name,
        severity: data.severity,
        timestamp: new Date().toISOString()
    });
}
