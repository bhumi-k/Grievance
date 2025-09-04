import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddSubject = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject_name: '',
        subject_code: '',
        assignment_no: 'CCE1',
        student_roll_no: '',
        faculty_email: '',
        marks_obtained: '85',
        result_date: new Date().toISOString().slice(0, 16)
    });

    const [message, setMessage] = useState('');
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);



    // Check authentication and load data
    useEffect(() => {
        const checkAuth = async () => {
            const userRole = localStorage.getItem('role');

            if (!userRole || userRole !== 'admin') {
                setMessage('❌ Access denied. Only administrators can add subjects.');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            await loadUsers();
        };

        checkAuth();
    }, [navigate]);

    const loadUsers = async () => {
        try {
            const response = await axios.get('/api/debug/users');
            const users = response.data;

            setStudents(users.filter(u => u.role === 'user'));
            setFaculty(users.filter(u => u.role !== 'user'));
            setLoading(false);
        } catch (error) {
            setMessage('❌ Error loading users');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.student_roll_no) {
            setMessage('❌ Please select a student');
            return;
        }

        try {
            const response = await axios.post('/api/subjects', formData);
            setMessage('✅ ' + response.data.message);

            // Reset form
            setFormData({
                subject_name: '',
                subject_code: '',
                assignment_no: 'CCE1',
                student_roll_no: '',
                faculty_email: '',
                marks_obtained: '85',
                result_date: new Date().toISOString().slice(0, 16)
            });
        } catch (error) {
            setMessage('❌ ' + (error.response?.data?.error || 'Error adding subject'));
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h3>Loading...</h3>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
            <h2>Add Subject</h2>

            {message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                    backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    color: message.startsWith('✅') ? '#155724' : '#721c24',
                    border: `1px solid ${message.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Subject Name *</label>
                    <input
                        type="text"
                        name="subject_name"
                        value={formData.subject_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Data Structures"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Subject Code</label>
                    <input
                        type="text"
                        name="subject_code"
                        value={formData.subject_code}
                        onChange={handleChange}
                        placeholder="e.g., CS101"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Assignment Number</label>
                    <select
                        name="assignment_no"
                        value={formData.assignment_no}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="CCE1">CCE1</option>
                        <option value="CCE2">CCE2</option>
                        <option value="ESE">ESE</option>

                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Student *</label>
                    <select
                        name="student_roll_no"
                        value={formData.student_roll_no}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="">-- Select Student --</option>
                        {students.map(student => (
                            <option key={student.id} value={student.roll_no}>
                                {student.name} ({student.roll_no})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Faculty</label>
                    <select
                        name="faculty_email"
                        value={formData.faculty_email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="">-- Auto-assign Faculty --</option>
                        {faculty.map(fac => (
                            <option key={fac.id} value={fac.email}>
                                {fac.name} ({fac.role})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Marks Obtained</label>
                    <input
                        type="number"
                        name="marks_obtained"
                        value={formData.marks_obtained}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        placeholder="Enter marks (0-100)"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Result Date</label>
                    <input
                        type="datetime-local"
                        name="result_date"
                        value={formData.result_date}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Add Subject
                </button>
            </form>
        </div>
    );
};

export default AddSubject;