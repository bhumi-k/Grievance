import React, { useState } from 'react';
import axios from 'axios';

const AddSubject = () => {
    const [formData, setFormData] = useState({
        subject_name: '',
        subject_code: '',
        assignment_no: 'ASG001',
        student_roll_no: '',
        faculty_email: '',
        marks_obtained: '85',
        result_date: new Date().toISOString().slice(0, 16)
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/subjects', formData);
            setMessage('✅ ' + response.data.message);
            // Reset form
            setFormData({
                subject_name: '',
                subject_code: '',
                assignment_no: 'ASG001',
                student_roll_no: '',
                faculty_email: '',
                marks_obtained: '85',
                result_date: new Date().toISOString().slice(0, 16)
            });
        } catch (error) {
            setMessage('❌ ' + (error.response?.data?.error || 'Error adding subject'));
        }
    };

    const checkUsers = async () => {
        try {
            const response = await axios.get('/api/debug/users');
            const users = response.data;
            const students = users.filter(u => u.role === 'user');
            const faculty = users.filter(u => u.role !== 'user');

            setMessage(`👥 Students: ${students.map(s => `${s.name}(${s.roll_no})`).join(', ')} | Faculty: ${faculty.map(f => `${f.name}(${f.email})`).join(', ')}`);
        } catch (error) {
            setMessage('❌ ' + (error.response?.data?.error || 'Error fetching users'));
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
            <h2>Add Subject (Manual Entry)</h2>

            <button
                onClick={checkUsers}
                style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    cursor: 'pointer'
                }}
            >
                Check Available Users
            </button>

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
                    <label>Student Roll Number *</label>
                    <input
                        type="text"
                        name="student_roll_no"
                        value={formData.student_roll_no}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 2021001"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Faculty Email (optional)</label>
                    <input
                        type="email"
                        name="faculty_email"
                        value={formData.faculty_email}
                        onChange={handleChange}
                        placeholder="Leave empty to use any admin/faculty"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
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