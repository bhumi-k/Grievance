import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResolveGrievance = ({ theme }) => {
    const { id } = useParams(); // grievance ID
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [oldMarks, setOldMarks] = useState('');
    const [newMarks, setNewMarks] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

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

            // User has valid role, fetch grievance details
            try {
                const res = await fetch(`http://localhost:5000/api/grievance/${id}`);
                const data = await res.json();
                setData(data);
                setOldMarks(data?.marks_obtained || '');
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newMarks || newMarks === oldMarks) {
            alert('Please enter a different mark value.');
            return;
        }

        setProcessing(true);

        try {
            const res = await fetch(`http://localhost:5000/api/grievance/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newMarks }),
            });

            const result = await res.json();

            if (res.ok) {
                alert('Grievance resolved successfully! Email notification sent to student.');
                navigate('/faculty-dashboard');
            } else {
                alert(`Error: ${result.error || 'Failed to resolve grievance'}`);
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Network error. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div style={{
                padding: '30px',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                color: theme === 'dark' ? '#f0f0f0' : '#000',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 style={{ marginTop: '20px' }}>Loading grievance details...</h5>
            </div>
        );
    }

    // Show access denied message
    if (accessDenied) {
        const userRole = localStorage.getItem('role');
        return (
            <div style={{
                padding: '30px',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                color: theme === 'dark' ? '#f0f0f0' : '#000',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
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
                            ? 'You must be logged in to resolve grievances.'
                            : 'Students cannot access grievance resolution. This area is restricted to faculty, admin, and other staff members.'
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

    if (!data) return <p style={{ padding: '30px' }}>Loading grievance data...</p>;

    return (
        <div style={{
            padding: '30px',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            color: theme === 'dark' ? '#f0f0f0' : '#000',
            minHeight: '100vh',
        }}>
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                background: theme === 'dark' ? '#2a2a2a' : '#f9f9f9'
            }}>
                <h3>{data.subject_name}</h3>
                <p><strong>Student:</strong> {data.student_name}</p>
                <p><strong>Roll No:</strong> {data.roll_no}</p>
                <p><strong>Complaint:</strong> {data.nature_of_complaint}</p>
                <p><strong>Date:</strong> {data.complaint_date}</p>
                <p><strong>Current Marks:</strong> {oldMarks}</p>

                <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                    <h4>Update Marks</h4>
                    <div className="mb-3">
                        <label>Old Marks:</label>
                        <input
                            className="form-control"
                            type="number"
                            value={oldMarks}
                            disabled
                        />
                    </div>

                    <div className="mb-3">
                        <label>New Marks:</label>
                        <input
                            className="form-control"
                            type="number"
                            value={newMarks}
                            onChange={(e) => setNewMarks(e.target.value)}
                            disabled={processing}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success"
                        disabled={processing}
                        style={{
                            opacity: processing ? 0.7 : 1,
                            cursor: processing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {processing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Resolving...
                            </>
                        ) : (
                            'Update'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResolveGrievance;
