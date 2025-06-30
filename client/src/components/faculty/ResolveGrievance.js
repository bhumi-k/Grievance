import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResolveGrievance = ({ theme }) => {
    const { id } = useParams(); // grievance ID
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [oldMarks, setOldMarks] = useState('');
    const [newMarks, setNewMarks] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/grievance/${id}`);
                const data = await res.json();
                setData(data);
                setOldMarks(data?.marks_obtained || '');
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/grievance/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newMarks }),
            });

            const result = await res.json();
            alert(result.message || 'Updated!');
            if (res.ok) navigate('/faculty-dashboard');
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update marks.');
        }
    };

    if (!data) return <p style={{ padding: '30px' }}>Loading...</p>;

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
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-success">Update</button>
                </form>
            </div>
        </div>
    );
};

export default ResolveGrievance;
