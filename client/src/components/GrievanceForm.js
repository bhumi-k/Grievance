import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const GrievanceForm = () => {
    const { id: subjectId } = useParams();
    const navigate = useNavigate();
    const formRef = useRef(); // ✅ Move useRef here

    const [subject, setSubject] = useState(null);
    const [natureOfComplaint, setNatureOfComplaint] = useState('');
    const [assignmentNo, setAssignmentNo] = useState('');
    const [complaintDate] = useState(new Date().toISOString().split('T')[0]);

    // ✅ Define this as a normal function, not a component
    const sendStudentEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm('service_85b4frr', 'template_oxp6ci9', formRef.current, 'rxoHKciQkJb9cgceX')
            .then((result) => {
                alert('Email sent successfully!');
                console.log(result.text);
            }, (error) => {
                alert('Failed to send email.');
                console.log(error.text);
            });

        e.target.reset();
    };

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
        sendStudentEmail(e); // ✅ Pass event to send email

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
            navigate('/dashboard');
        }
    };

    if (!subject) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '30px auto' }}>
            <h2>Raise Grievance</h2>
            {/* ✅ Attach the formRef here */}
            <form ref={formRef} onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Name:</label>
                    <input className="form-control" name="student_name" value={subject.student_name} readOnly style={{ backgroundColor: "#e9ecef" }} />
                </div>

                <div className="mb-3">
                    <label>Roll No:</label>
                    <input className="form-control" name="roll_no" value={subject.roll_no} readOnly style={{ backgroundColor: "#e9ecef" }} />
                </div>

                <div className="mb-3">
                    <label>Subject Name:</label>
                    <input className="form-control" name="subject_name" value={subject.subject_name} readOnly style={{ backgroundColor: "#e9ecef" }} />
                </div>

                <div className="mb-3">
                    <label>Subject Code:</label>
                    <input className="form-control" name="subject_code" value={subject.subject_code || 'N/A'} readOnly style={{ backgroundColor: "#e9ecef" }} />
                </div>

                <div className="mb-3">
                    <label>Faculty Name:</label>
                    <input className="form-control" name="faculty_name" value={subject.faculty_name} readOnly style={{ backgroundColor: "#e9ecef" }} />
                </div>

                <div className="mb-3">
                    <label>Assignment Number:</label>
                    <input
                        className="form-control"
                        name="assignment_no"
                        value={assignmentNo}
                        onChange={(e) => setAssignmentNo(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Nature of Grievance:</label>
                    <select
                        className="form-control"
                        name="nature_of_grievance"
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
                    <input className="form-control" name="complaint_date" value={complaintDate} readOnly style={{ backgroundColor: "#e9ecef" }} />
                </div>

                <button type="submit" className="btn btn-danger">Submit Grievance</button>
            </form>
        </div>
    );
};

export default GrievanceForm;
