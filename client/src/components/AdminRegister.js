// src/components/admin/AdminRegister.jsx
import React, { useState } from "react";
import axios from "axios";

const AdminRegister = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "faculty",
  });

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;
    if (!name || !email || !password || !role) return alert("All fields are required");
    try {
      const res = await axios.post("/api/admin/register-role", formData);
      alert(res.data.message);
      setFormData({ name: "", email: "", password: "", role: "faculty" });
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={`theme-${theme}`}>
      <h2>Register a Role</h2>
      <form onSubmit={handleRegister} className="admin-form" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <select name="role" value={formData.role} onChange={handleChange} required>
          <option value="faculty">Faculty</option>
          <option value="hod">HOD</option>
          <option value="ceo">CEO</option>
          <option value="director">Director</option>
        </select>
        <button type="submit">Register Role</button>
      </form>
    </div>
  );
};

export default AdminRegister;
