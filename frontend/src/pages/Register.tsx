import React, { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'teacher',
        phone: '',
        schoolCode: '',
        languagePreference: 'en',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');


        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }


        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            return;
        }

        setLoading(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                role: formData.role,
                phone: formData.phone || undefined,
                schoolCode: formData.schoolCode || undefined,
                languagePreference: formData.languagePreference,
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '3rem 0' }}>
            <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="heading-1" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>MindMap AI</h1>
                    <p className="text-muted">Join us to help students thrive.</p>
                </div>
                <h2 className="heading-2" style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'none' }}>Create Account</h2>

                {error && (
                    <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName" className="form-label">Full Name: *</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="form-control"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email: *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid-cols-2">
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password: *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm: *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-control"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <small className="text-muted text-small" style={{ display: 'block', marginTop: '-10px', marginBottom: '15px' }}>
                        Min 8 chars, uppercase, lowercase, number, special char
                    </small>

                    <div className="form-group">
                        <label htmlFor="role" className="form-label">Role: *</label>
                        <select
                            id="role"
                            name="role"
                            className="form-control"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="teacher">Teacher</option>
                            <option value="therapist">Therapist</option>
                            <option value="parent">Parent</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">Phone:</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+919876543210"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="schoolCode" className="form-label">School Code:</label>
                        <input
                            type="text"
                            id="schoolCode"
                            name="schoolCode"
                            className="form-control"
                            value={formData.schoolCode}
                            onChange={handleChange}
                            placeholder="e.g., TEST-001"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="languagePreference" className="form-label">Language Preference:</label>
                        <select
                            id="languagePreference"
                            name="languagePreference"
                            className="form-control"
                            value={formData.languagePreference}
                            onChange={handleChange}
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                            <option value="te">తెలుగు (Telugu)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-secondary btn-block"
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="text-muted text-small" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
