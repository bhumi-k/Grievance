import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GrievanceForm = () => {
    const { id: subjectId } = useParams();
    const navigate = useNavigate();

    const [subject, setSubject] = useState(null);
    const [natureOfComplaint, setNatureOfComplaint] = useState('');
    const [assignmentNo, setAssignmentNo] = useState('');
    const [complaintDate] = useState(new Date().toISOString().split('T')[0]); // today's date in YYYY-MM-DD


    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/subject/${subjectId}`);
                const data = await res.json();
                setSubject(data);
            } catch (err) {
                console.error('Error fetching subject:', err);
            }
        };

        fetchSubject();
    }, [subjectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:5000/api/grievance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subjectId,
                complaintDate: new Date().toISOString().split('T')[0],
                natureOfComplaint,
                assignmentNo,
            }),
        });

        const data = await response.json();
        alert(data.message || 'Something went wrong');

        if (response.ok) {
            navigate('/dashboard'); // ✅ redirect after success
        }
    };

    if (!subject) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '30px auto' }}>
            <h2>Raise Grievance</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Name:</label>
                    <input className="form-control" value={subject.student_name} disabled />
                </div>

                <div className="mb-3">
                    <label>Roll No:</label>
                    <input className="form-control" value={subject.roll_no} disabled />
                </div>

                <div className="mb-3">
                    <label>Subject Name:</label>
                    <input className="form-control" value={subject.subject_name} disabled />
                </div>

                <div className="mb-3">
                    <label>Subject Code:</label>
                    <input className="form-control" value={subject.subject_code || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                    <label>Faculty Name:</label>
                    <input className="form-control" value={subject.faculty_name} disabled />
                </div>

                <div className="mb-3">
                    <label>Assignment Number:</label>
                    <input
                        className="form-control"
                        value={assignmentNo}
                        onChange={(e) => setAssignmentNo(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Nature of Grievance:</label>
                    <select
                        className="form-control"
                        value={natureOfComplaint}
                        onChange={(e) => setNatureOfComplaint(e.target.value)}
                        required
                    >
                        <option value="">-- Select Reason --</option>
                        <option value="Unfair means adopted by students">Unfair means adopted by students</option>
                        <option value="Questions were out of syllabus">Questions were out of syllabus</option>
                        <option value="Rubrics is not justified (give details)">Rubrics is not justified (give details)</option>
                        <option value="Re-assessment of assignment">Re-assessment of assignment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>


                <div className="mb-3">
                    <label>Date of Complaint (auto-filled):</label>
                    <input className="form-control" value={complaintDate} disabled />
                </div>

                <button type="submit" className="btn btn-danger">Submit Grievance</button>
            </form>
        </div>
    );
};

export default GrievanceForm;
