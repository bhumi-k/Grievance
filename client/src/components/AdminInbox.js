import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminInbox = ({ theme }) => {
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const res = await axios.get("/api/grievances");
        setGrievances(res.data);
      } catch (err) {
        console.error("❌ Error fetching grievances:", err);
      }
    };
    fetchGrievances();
  }, []);

  return (
    <div className={`theme-${theme}`} style={{ padding: "20px" }}>
      <h2>📥 Grievance Inbox</h2>

      {grievances.length === 0 ? (
        <p>No grievances yet.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Stream</th>
              <th>Complaint Date</th>
              <th>Nature of Complaint</th>
            </tr>
          </thead>
          <tbody>
            {grievances.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.student_name}</td>
                <td>{g.roll_no}</td>
                <td>{g.stream}</td>
                <td>{new Date(g.complaint_date).toLocaleDateString()}</td>
                <td>{g.nature_of_complaint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminInbox;
