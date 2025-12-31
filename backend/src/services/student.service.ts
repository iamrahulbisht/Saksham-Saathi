import prisma from '../config/database';

interface CreateStudentInput {
    name: string;
    age: number;
    grade: number;
    parentEmails?: string[];
    languagePreference?: string;
}

interface StudentResponse {
    studentId: string;
    name: string;
    age: number;
    grade: number;
    screeningStatus: string;
    languagePreference: string;
    assignedTeacherId: string | null;
    assignedTherapistId: string | null;
    dyslexiaRisk: number | null;
    adhdRisk: number | null;
    asdRisk: number | null;
    createdAt: Date;
}

 
export const createStudent = async (
    teacherId: string,
    input: CreateStudentInput
): Promise<StudentResponse> => {
    const { name, age, grade, parentEmails, languagePreference } = input;

     
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { schoolId: true },
    });

     
    const student = await prisma.student.create({
        data: {
            name,
            age,
            grade,
            languagePreference: languagePreference || 'en',
            assignedTeacherId: teacherId,
            schoolId: teacher?.schoolId,
            screeningStatus: 'pending',
        },
    });

     
    if (parentEmails && parentEmails.length > 0) {
        for (const email of parentEmails) {
             
            const parent = await prisma.user.findUnique({
                where: { email },
            });

            if (parent && parent.role === 'parent') {
                await prisma.studentParent.create({
                    data: {
                        studentId: student.id,
                        parentId: parent.id,
                    },
                });
            }
        }
    }

    return formatStudentResponse(student);
};

 
export const getStudentById = async (studentId: string): Promise<StudentResponse | null> => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    });

    if (!student) return null;
    return formatStudentResponse(student);
};

 
export const getStudentsByTeacher = async (teacherId: string): Promise<StudentResponse[]> => {
    const students = await prisma.student.findMany({
        where: { assignedTeacherId: teacherId },
        orderBy: { createdAt: 'desc' },
    });

    return students.map(formatStudentResponse);
};

 
export const getStudentsByTherapist = async (therapistId: string): Promise<StudentResponse[]> => {
    const students = await prisma.student.findMany({
        where: { assignedTherapistId: therapistId },
        orderBy: { createdAt: 'desc' },
    });

    return students.map(formatStudentResponse);
};

 
export const getStudentsByParent = async (parentId: string): Promise<StudentResponse[]> => {
    const studentParents = await prisma.studentParent.findMany({
        where: { parentId },
        include: { student: true },
    });

    return studentParents.map((sp: { student: any }) => formatStudentResponse(sp.student));
};

 
export const hasAccessToStudent = async (
    userId: string,
    userRole: string,
    studentId: string
): Promise<boolean> => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { studentParents: true },
    });

    if (!student) return false;

    switch (userRole) {
        case 'admin':
            return true;
        case 'teacher':
            return student.assignedTeacherId === userId;
        case 'therapist':
            return student.assignedTherapistId === userId;
        case 'parent':
            return student.studentParents.some((sp: { parentId: string }) => sp.parentId === userId);
        default:
            return false;
    }
};

 
export const assignTherapist = async (
    studentId: string,
    therapistId: string
): Promise<StudentResponse> => {
    const student = await prisma.student.update({
        where: { id: studentId },
        data: { assignedTherapistId: therapistId },
    });

    return formatStudentResponse(student);
};

 
const formatStudentResponse = (student: any): StudentResponse => ({
    studentId: student.id,
    name: student.name,
    age: student.age,
    grade: student.grade,
    screeningStatus: student.screeningStatus,
    languagePreference: student.languagePreference,
    assignedTeacherId: student.assignedTeacherId,
    assignedTherapistId: student.assignedTherapistId,
    dyslexiaRisk: student.dyslexiaRisk ? Number(student.dyslexiaRisk) : null,
    adhdRisk: student.adhdRisk ? Number(student.adhdRisk) : null,
    asdRisk: student.asdRisk ? Number(student.asdRisk) : null,
    createdAt: student.createdAt,
});
