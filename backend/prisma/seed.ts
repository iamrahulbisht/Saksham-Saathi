import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create a test school
    const school = await prisma.school.upsert({
        where: { code: 'DL-123-GOV' },
        update: {},
        create: {
            name: 'Government Primary School Delhi',
            code: 'DL-123-GOV',
            district: 'Central Delhi',
            state: 'Delhi',
        }
    });

    // 2. Create test users
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@school.edu' },
        update: {},
        create: {
            email: 'teacher@school.edu',
            password: teacherPassword,
            role: 'TEACHER',
            schoolId: school.id,
            fullName: 'Priya Sharma',
        }
    });

    const therapistPassword = await bcrypt.hash('therapist123', 10);
    const therapist = await prisma.user.upsert({
        where: { email: 'therapist@clinic.com' },
        update: {},
        create: {
            email: 'therapist@clinic.com',
            password: therapistPassword,
            role: 'THERAPIST',
            fullName: 'Dr. Rahul Verma',
        }
    });

    // 3. Create test student
    // For students, standard upsert is harder without a unique ID we know beforehand.
    // We'll check if exists first or use findFirst.
    const existingStudent = await prisma.student.findFirst({
        where: { name: 'Aditya Kumar', teacherId: teacher.id }
    });

    if (!existingStudent) {
        await prisma.student.create({
            data: {
                name: 'Aditya Kumar',
                age: 8,
                grade: '3',
                teacherId: teacher.id,
                therapistId: therapist.id,
                screeningRisks: { dyslexia: "High", adhd: "Pending" }
            }
        });
    }

    console.log('Seed data created successfully!');
    console.log('Teacher Login: teacher@school.edu / teacher123');
    console.log('Therapist Login: therapist@clinic.com / therapist123');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
