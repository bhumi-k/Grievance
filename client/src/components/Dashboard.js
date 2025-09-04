import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ theme }) => {
    const [subjects, setSubjects] = useState([]);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rollNo = localStorage.getItem('rollNo');
                const response = await fetch(`http://localhost:5000/api/subjects?rollNo=${rollNo}`);
                const data = await response.json();
                console.log("Fetched subjects:", data);
                setSubjects(data);
                setCurrentTime(Date.now());
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            }
        };
        fetchData();
    }, []);

    const isWithin48Hours = (resultDate) => {
        const resultTime = new Date(resultDate).getTime();
        const timePassed = currentTime - resultTime;
        return timePassed < 48 * 60 * 60 * 1000;
    };

    return (
        <div style={{
            padding: '30px',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            color: theme === 'dark' ? '#f0f0f0' : '#000',
            minHeight: '100vh',
        }}>
            {/* Alert */}
            <div style={{
                background: '#ffe6e6',
                color: 'black',
                border: '2px solid #ff4d4d',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                fontWeight: '500',
            }}>
                ⚠️ Please read all rules and regulations carefully before raising a grievance. Misuse of this feature may lead to disciplinary actions.
            </div>

            {/* Subject Cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {subjects.length === 0 ? (
                    <p>No subjects found or results not declared yet.</p>
                ) : (
                    subjects.map((subject) => {
                        const disabled = !isWithin48Hours(subject.result_date);

                        return (
                            <div key={subject.id} style={{
                                border: theme === 'dark' ? '1px solid #555' : '1px solid #ccc',
                                borderRadius: '12px',
                                padding: '16px',
                                width: '300px',
                                background: theme === 'dark' ? '#2b2b2b' : '#f9f9f9',
                                boxShadow: '2px 4px 8px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ color: '#007bff', marginBottom: '8px' }}>{subject.subject_name}</h3>
                                <p><strong>Faculty:</strong> {subject.faculty_name}</p>
                                <p><strong>Subject Code:</strong> {subject.subject_code || 'N/A'}</p>
                                <p><strong>Marks:</strong> {subject.marks_obtained}</p>
                                <button
                                    disabled={disabled}
                                    onClick={() => navigate(`/raise-grievance/${subject.id}`)}
                                    className={`btn ${disabled ? 'btn-secondary' : 'btn-primary'}`}
                                    style={{ marginTop: '10px' }}
                                    title={disabled ? "Grievance window closed (48hr passed)" : "Raise grievance"}
                                >
                                    Raise Grievance
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Dashboard;
