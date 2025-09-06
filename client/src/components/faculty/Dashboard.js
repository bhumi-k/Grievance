// client/src/components/faculty/FacultyDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const FacultyDashboard = ({ theme }) => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [processingClose, setProcessingClose] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const userRole = localStorage.getItem('role');

            // Check if user is logged in
            if (!userRole) {
                setAccessDenied(true);
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // Restrict access - only non-student users can access
            if (userRole === 'user') {
                setAccessDenied(true);
                setLoading(false);
                setTimeout(() => navigate('/dashboard'), 2000);
                return;
            }

            // User has valid role, fetch grievances
            try {
                const res = await fetch('http://localhost:5000/api/grievances');
                const data = await res.json();
                setGrievances(data);
            } catch (err) {
                console.error('Error fetching grievances:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [navigate]);

    const handleCloseGrievance = async (grievanceId) => {
        if (!window.confirm('Are you sure you want to close this grievance? This action cannot be undone.')) {
            return;
        }

        setProcessingClose(grievanceId);

        try {
            const response = await fetch(`http://localhost:5000/api/grievance/${grievanceId}/close`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                alert('Grievance closed successfully! Email notification sent to student.');
                // Remove the closed grievance from the list
                setGrievances(prev => prev.filter(g => g.id !== grievanceId));
            } else {
                alert(`Error: ${result.error || 'Failed to close grievance'}`);
            }
        } catch (error) {
            console.error('Error closing grievance:', error);
            alert('Network error. Please try again.');
        } finally {
            setProcessingClose(null);
        }
    };

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

    // Show loading state
    if (loading) {
        return (
            <div style={{
                ...containerStyle,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 style={{ marginTop: '20px' }}>Checking access permissions...</h5>
            </div>
        );
    }

    // Show access denied message
    if (accessDenied) {
        const userRole = localStorage.getItem('role');
        return (
            <div style={{
                ...containerStyle,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: theme === 'dark' ? '#2b2b2b' : '#f8f9fa',
                    borderRadius: '12px',
                    border: '2px solid #dc3545'
                }}>
                    <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>❌ Access Denied</h2>
                    <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                        {!userRole
                            ? 'You must be logged in to access the faculty dashboard.'
                            : 'Students cannot access the faculty dashboard. This area is restricted to faculty, admin, and other staff members.'
                        }
                    </p>
                    <p style={{ color: '#6c757d' }}>
                        {!userRole
                            ? 'Redirecting to login page...'
                            : 'Redirecting to student dashboard...'
                        }
                    </p>
                </div>
            </div>
        );
    }

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
                                            backgroundColor: processingClose === g.id ? '#6c757d' : '#dc3545',
                                            color: 'white',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: processingClose === g.id ? 'not-allowed' : 'pointer',
                                            opacity: processingClose === g.id ? 0.7 : 1
                                        }}
                                        onClick={() => handleCloseGrievance(g.id)}
                                        disabled={processingClose === g.id}
                                    >
                                        {processingClose === g.id ? 'Closing...' : 'Close'}
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
