import React, { useState, type FormEvent } from 'react';
import { studentAPI } from '../services/api';

interface CreateStudentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateStudentForm: React.FC<CreateStudentFormProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        grade: '',
        parentEmails: '',
        languagePreference: 'en',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

         
        const age = parseInt(formData.age);
        const grade = parseInt(formData.grade);

        if (age < 4 || age > 18) {
            setError('Age must be between 4 and 18');
            return;
        }

        if (grade < 1 || grade > 12) {
            setError('Grade must be between 1 and 12');
            return;
        }

        setLoading(true);

        try {
            const parentEmails = formData.parentEmails
                ? formData.parentEmails.split(',').map(e => e.trim()).filter(e => e)
                : undefined;

            await studentAPI.createStudent({
                name: formData.name,
                age,
                grade,
                parentEmails,
                languagePreference: formData.languagePreference,
            });

            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="heading-3">Add New Student</h3>

            {error && (
                <div className="badge badge-danger" style={{ display: 'block', marginBottom: '1rem', padding: '0.75rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Name: *</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid-cols-2">
                    <div className="form-group">
                        <label className="form-label">Age: *</label>
                        <input
                            type="number"
                            name="age"
                            className="form-control"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            min="4"
                            max="18"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Grade: *</label>
                        <input
                            type="number"
                            name="grade"
                            className="form-control"
                            value={formData.grade}
                            onChange={handleChange}
                            required
                            min="1"
                            max="12"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Parent Email(s) (comma separated):</label>
                    <input
                        type="text"
                        name="parentEmails"
                        className="form-control"
                        value={formData.parentEmails}
                        onChange={handleChange}
                        placeholder="parent1@email.com, parent2@email.com"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Language:</label>
                    <select
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

                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-secondary"
                    >
                        {loading ? 'Creating...' : 'Create Student'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateStudentForm;
