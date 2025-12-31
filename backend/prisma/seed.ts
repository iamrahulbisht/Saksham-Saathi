import prisma from '../src/config/database';
import bcrypt from 'bcrypt';

async function seed() {
    console.log('🌱 Starting database seed...');

     
    const school = await prisma.school.upsert({
        where: { schoolCode: 'TEST-001' },
        update: {},
        create: {
            schoolName: 'Test Government School',
            schoolCode: 'TEST-001',
            district: 'Test District',
            state: 'Delhi',
            pincode: '110001',
            internetAvailability: 'stable',
            totalStudents: 100,
            totalTeachers: 10,
        },
    });
    console.log('✅ Created test school:', school.schoolCode);

     
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mindmap.ai' },
        update: {},
        create: {
            email: 'admin@mindmap.ai',
            passwordHash: adminPassword,
            fullName: 'System Admin',
            role: 'admin',
            schoolId: school.id,
            languagePreference: 'en',
        },
    });
    console.log('✅ Created admin user:', admin.email);

     
    const teacherPassword = await bcrypt.hash('Teacher@123', 12);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@test.com' },
        update: {},
        create: {
            email: 'teacher@test.com',
            passwordHash: teacherPassword,
            fullName: 'Priya Sharma',
            role: 'teacher',
            phone: '+919876543210',
            schoolId: school.id,
            languagePreference: 'hi',
        },
    });
    console.log('✅ Created test teacher:', teacher.email);

     
    const therapistPassword = await bcrypt.hash('Therapist@123', 12);
    const therapist = await prisma.user.upsert({
        where: { email: 'therapist@test.com' },
        update: {},
        create: {
            email: 'therapist@test.com',
            passwordHash: therapistPassword,
            fullName: 'Dr. Rahul Verma',
            role: 'therapist',
            schoolId: school.id,
            languagePreference: 'en',
        },
    });
    console.log('✅ Created test therapist:', therapist.email);

     
    const parentPassword = await bcrypt.hash('Parent@123', 12);
    const parent = await prisma.user.upsert({
        where: { email: 'parent@test.com' },
        update: {},
        create: {
            email: 'parent@test.com',
            passwordHash: parentPassword,
            fullName: 'Amit Kumar',
            role: 'parent',
            phone: '+919876543211',
            languagePreference: 'hi',
        },
    });
    console.log('✅ Created test parent:', parent.email);

    console.log('\n🎉 Database seed completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin:     admin@mindmap.ai / Admin@123');
    console.log('Teacher:   teacher@test.com / Teacher@123');
    console.log('Therapist: therapist@test.com / Therapist@123');
    console.log('Parent:    parent@test.com / Parent@123');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
