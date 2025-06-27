import React, { useState } from 'react';
import './AdminDashboard.css';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'faculty', // default
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await axios.post('/api/admin/register-role', formData);
      alert(res.data.message);
      setFormData({ name: '', email: '', password: '', role: 'faculty' });
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <button onClick={() => setActiveTab('register')}>➕ Register</button>
        <button onClick={() => setActiveTab('inbox')}>📥 Inbox</button>
      </aside>

      <main className="content">
        {activeTab === 'register' && (
          <>
            <h2>Register a Role</h2>
            <form onSubmit={handleRegister} className="admin-form">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="faculty">Faculty</option>
                <option value="hod">HOD</option>
                <option value="ceo">CEO</option>
                <option value="director">Director</option>
              </select>
              <button type="submit">Register Role</button>
            </form>
          </>
        )}

        {activeTab === 'inbox' && (
          <>
            <h2>Inbox</h2>
            <p>Inbox content will go here (messages, requests, etc.).</p>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
