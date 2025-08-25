// client/src/components/faculty/FacultyDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const FacultyDashboard = ({ theme }) => {
    const [grievances, setGrievances] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/grievances');
                const data = await res.json();
                setGrievances(data);
            } catch (err) {
                console.error('Error fetching grievances:', err);
            }
        };
        fetchGrievances();
    }, []);

    const containerStyle = {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
        color: theme === 'dark' ? '#f0f0f0' : '#000',
    };

    const sidebarStyle = {
        width: '220px',
        background: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
        padding: '20px',
        borderRight: '1px solid #ccc',
    };

    const contentStyle = {
        flex: 1,
        padding: '30px',
    };

    const cardStyle = {
        border: theme === 'dark' ? '1px solid #555' : '1px solid #ccc',
        borderRadius: '12px',
        padding: '16px',
        width: '300px',
        background: theme === 'dark' ? '#2b2b2b' : '#f9f9f9',
        boxShadow: '2px 4px 8px rgba(0,0,0,0.1)',
    };

    return (
        <div style={containerStyle}>
            <aside style={sidebarStyle}>
                <h3 style={{ marginBottom: '20px' }}>Faculty Panel</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li> <button onClick={() => navigate('/faculty-dashboard')} style={{ border: 0, padding: 3, margin: 5, width: '100%' }}>📋 Inbox </button></li>
                    <li> <button onClick={() => navigate('/')} style={{ border: 0, padding: 3, margin: 5, width: '100%' }}>🏠 Home</button></li>
                </ul>
            </aside>

            <main style={contentStyle}>
                <h2>Grievance inbox</h2>
                {grievances.length === 0 ? (
                    <p>No grievances found.</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {grievances.map((g) => (
                            <div key={g.id} style={cardStyle}>
                                <h3 style={{ color: '#007bff' }}>{g.subject_name}</h3>
                                <p><strong>Student:</strong> {g.student_name}</p>
                                <p><strong>Roll No:</strong> {g.roll_no}</p>
                                <p><strong>Complaint Date:</strong> {g.complaint_date}</p>
                                <p><strong>Nature:</strong> {g.nature_of_complaint}</p>
                                <p><strong>Faculty:</strong> {g.faculty_name}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                                    <button
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/resolve/${g.id}`)}

                                    >
                                        Resolve
                                    </button>

                                    <button
                                        style={{
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => alert(`Close grievance ID: ${g.id}`)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </main>
        </div>
    );
};

export default FacultyDashboard;
