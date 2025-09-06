import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Form.css";

const AdminDashboard = ({ theme }) => {
  const [grievanceCount, setGrievanceCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get("/api/grievances/count");
        setGrievanceCount(res.data.total);
      } catch (err) {
        console.error("❌ Error fetching grievance count:", err);
      }
    };
    fetchCount();
  }, []);

  return (
    <div className={`admin-dashboard theme-${theme}`}>
      <h2>📊 Admin Dashboard</h2>

      <div className="cards">
        <div className="card">
          <h3>Total Grievances</h3>
          <p>{grievanceCount}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
