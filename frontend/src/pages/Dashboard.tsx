import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../services/api';
import CreateStudentForm from '../components/CreateStudentForm';
import FocusSchedule from '../components/attention-prediction/FocusSchedule';

interface Student {
    studentId: string;
    name: string;
    age: number;
    grade: number;
    screeningStatus: string;
    languagePreference: string;
    dyslexiaRisk: number | null;
    adhdRisk: number | null;
    asdRisk: number | null;
}

const Dashboard: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);


    useEffect(() => {
        if (user && ['teacher', 'therapist', 'parent'].includes(user.role)) {
            fetchStudents();
        }
    }, [user]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const response = await studentAPI.getMyStudents();
            setStudents(response.data.data.students);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleStudentCreated = () => {
        setShowCreateForm(false);
        fetchStudents();
    };

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return null;
    }


    const renderDashboardContent = () => {
        switch (user.role) {
            case 'teacher':
                return (
                    <div className="animate-fade-in">
                        <h2 className="heading-2">Teacher Dashboard</h2>
                        <p className="text-muted" style={{ marginBottom: '20px' }}>Welcome back, {user.fullName}!</p>

                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="heading-3" style={{ margin: 0 }}>My Students <span className="text-muted text-small">({students.length})</span></h3>
                                <button
                                    onClick={() => setShowCreateForm(!showCreateForm)}
                                    className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'}`}
                                >
                                    {showCreateForm ? 'Cancel' : '+ Add Student'}
                                </button>
                            </div>

                            {showCreateForm && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <CreateStudentForm
                                        onSuccess={handleStudentCreated}
                                        onCancel={() => setShowCreateForm(false)}
                                    />
                                </div>
                            )}

                            {loadingStudents ? (
                                <div className="flex-center" style={{ padding: '2rem' }}>Loading students...</div>
                            ) : students.length === 0 ? (
                                <p className="text-muted" style={{ padding: '1rem', textAlign: 'center' }}>No students yet. Click "Add Student" to create your first student.</p>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Age</th>
                                                <th>Grade</th>
                                                <th>Status</th>
                                                <th>Risks</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student) => (
                                                <tr key={student.studentId} style={{ backgroundColor: selectedStudentId === student.studentId ? 'var(--bg-body)' : 'transparent' }}>
                                                    <td><strong>{student.name}</strong></td>
                                                    <td>{student.age}</td>
                                                    <td>{student.grade}</td>
                                                    <td>
                                                        <span className={`badge ${student.screeningStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                            {student.screeningStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {student.dyslexiaRisk !== null || student.adhdRisk !== null || student.asdRisk !== null ? (
                                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                                {student.dyslexiaRisk !== null && <span className="badge badge-danger">D:{student.dyslexiaRisk}%</span>}
                                                                {student.adhdRisk !== null && <span className="badge badge-warning">A:{student.adhdRisk}%</span>}
                                                                {student.asdRisk !== null && <span className="badge badge-neutral">ASD:{student.asdRisk}%</span>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted text-small">Not assessed</span>
                                                        )}
                                                    </td>
                                                    <td style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => navigate(`/assessment/${student.studentId}`)}
                                                            className={`btn ${student.screeningStatus === 'completed' ? 'btn-outline' : 'btn-secondary'}`}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                        >
                                                            {student.screeningStatus === 'completed' ? 'View Report' : 'Start Assessment'}
                                                        </button>

                                                        <button
                                                            onClick={() => setSelectedStudentId(student.studentId === selectedStudentId ? null : student.studentId)}
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                        >
                                                            {student.studentId === selectedStudentId ? 'Hide Focus' : 'Forecast'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {selectedStudentId && (
                            <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
                                <div className="card">
                                    <FocusSchedule studentId={selectedStudentId} />
                                </div>
                            </div>
                        )}

                        <div className="card">
                            <h3 className="heading-3">Active Alerts</h3>
                            <div className="flex-center" style={{ height: '100px', backgroundColor: 'var(--bg-body)', borderRadius: '8px' }}>
                                <p className="text-muted">No alerts at this time.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'therapist':
                return (
                    <div className="animate-fade-in">
                        <h2 className="heading-2">Therapist Dashboard</h2>
                        <p className="text-muted">Welcome, {user.fullName}!</p>
                        <div className="card" style={{ marginTop: '20px' }}>
                            <h3 className="heading-3">Assigned Students ({students.length})</h3>
                            {students.length === 0 ? (
                                <p className="text-muted">No assigned students yet.</p>
                            ) : (
                                <ul style={{ paddingLeft: '20px' }}>
                                    {students.map((s) => (
                                        <li key={s.studentId}>{s.name} (Grade {s.grade})</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );

            case 'parent':
                return (
                    <div className="animate-fade-in">
                        <h2 className="heading-2">Parent Dashboard</h2>
                        <p className="text-muted">Welcome, {user.fullName}!</p>
                        <div className="card" style={{ marginTop: '20px' }}>
                            <h3 className="heading-3">My Children ({students.length})</h3>
                            {students.length === 0 ? (
                                <p className="text-muted">No children linked yet. Ask your child's teacher to add your email.</p>
                            ) : (
                                <ul style={{ paddingLeft: '20px' }}>
                                    {students.map((s) => (
                                        <li key={s.studentId}>{s.name} - Grade {s.grade}, Status: {s.screeningStatus}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );

            case 'admin':
                return (
                    <div className="animate-fade-in">
                        <h2 className="heading-2">Admin Dashboard</h2>
                        <p className="text-muted">Welcome, {user.fullName}!</p>
                        <div className="card" style={{ marginTop: '20px' }}>
                            <h3 className="heading-3">System Overview</h3>
                            <p>Admin features coming in later iterations.</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div>
                        <h2 className="heading-2">Dashboard</h2>
                        <p className="text-muted">Welcome, {user.fullName}!</p>
                    </div>
                );
        }
    };

    return (
        <div className="container">
            <header className="flex-between glass-card" style={{ padding: '1rem 2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(99, 102, 241, 0.4)'
                    }}>MM</div>
                    <h1 className="heading-1" style={{ fontSize: '1.75rem', margin: 0 }}>MindMap AI</h1>
                </div>
                <div className="flex-center" style={{ gap: '1.5rem' }}>
                    <span className="text-muted text-small" style={{ fontWeight: 500 }}>
                        {user.email} <span className="badge badge-neutral" style={{ marginLeft: '8px' }}>{user.role}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="btn btn-danger"
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {renderDashboardContent()}
        </div>
    );
};

export default Dashboard;
