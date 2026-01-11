export interface User {
    id: string;
    email: string;
    fullName?: string; // Optional if not always present, or mapped from name
    name?: string;     // Schema has name
    role: 'TEACHER' | 'THERAPIST' | 'PARENT' | 'STUDENT';
}

export interface Student {
    id: string;
    name: string;
    grade: number;
}
