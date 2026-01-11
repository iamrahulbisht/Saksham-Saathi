import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import TeacherHome from './pages/TeacherHome';
import TherapistHome from './pages/TherapistHome';
import ParentHome from './pages/ParentHome';
import AssessmentPage from './pages/AssessmentPage';
import ReportsPage from './pages/ReportsPage';
import StudentHome from './pages/StudentHome';
import StudentDetails from './pages/StudentDetails';

function PrivateRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return (
        <Layout>
            {children}
        </Layout>
    );
}

// Wrapper for public routes that shouldn't be accessible if logged in (like login/register) - Optional
// For simplicity, we just keep them public.

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <OfflineProvider>
                    <div className="min-h-screen bg-gray-50 text-gray-900">
                        <OfflineIndicator />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            {/* Role Based Routes */}
                            <Route path="/teacher-dashboard" element={
                                <PrivateRoute allowedRoles={['TEACHER']}>
                                    <TeacherHome />
                                </PrivateRoute>
                            } />

                            <Route path="/therapist-dashboard" element={
                                <PrivateRoute allowedRoles={['THERAPIST']}>
                                    <TherapistHome />
                                </PrivateRoute>
                            } />

                            <Route path="/parent-dashboard" element={
                                <PrivateRoute allowedRoles={['PARENT']}>
                                    <ParentHome />
                                </PrivateRoute>
                            } />

                            <Route path="/student-dashboard" element={<StudentHome />} />
                            <Route path="/reports" element={
                                <PrivateRoute allowedRoles={['TEACHER', 'THERAPIST']}>
                                    <ReportsPage />
                                </PrivateRoute>
                            } />

                            {/* Shared/Nested Routes - Assessments */}
                            {/* Typically Teachers or Therapists start assessments */}
                            <Route path="/students/:studentId/assessment/:assessmentId" element={
                                <PrivateRoute allowedRoles={['TEACHER', 'THERAPIST']}>
                                    <AssessmentPage />
                                </PrivateRoute>
                            } />

                            <Route path="/students/:studentId" element={
                                <PrivateRoute allowedRoles={['TEACHER', 'THERAPIST']}>
                                    <StudentDetails />
                                </PrivateRoute>
                            } />

                            {/* Default Redirect */}
                            {/* Ideally redirect based on role, but for now redirect to login */}
                            <Route path="/" element={<Navigate to="/login" />} />
                            <Route path="*" element={<Navigate to="/login" />} />
                        </Routes>
                    </div>
                </OfflineProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
