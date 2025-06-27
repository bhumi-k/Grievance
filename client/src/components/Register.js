import React, { useState } from 'react';
import './Form.css';
import axios from 'axios';

const Register = () => {
  const [roleType, setRoleType] = useState('student'); // student or admin

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    class: '',
    adminCode: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, rollNo, class: className, adminCode } = formData;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
      };

      if (roleType === 'student') {
        if (!rollNo || !className) {
          alert("Roll No. and Class are required for students.");
          return;
        }
        payload.rollNo = rollNo;
        payload.class = className;
      } else if (roleType === 'admin') {
        if (!adminCode) {
          alert("Admin Code is required.");
          return;
        }
        payload.adminCode = adminCode;
      }

      const res = await axios.post('/api/register', payload);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <select value={roleType} onChange={(e) => setRoleType(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />


        {roleType === 'student' && (
          <>
            <input name="rollNo" placeholder="Roll No." onChange={handleChange} required />
            <input name="class" placeholder="Class" onChange={handleChange} required />
          </>
        )}

        {roleType === 'admin' && (
          <input name="adminCode" placeholder="Admin Code" onChange={handleChange} required />
        )}

        <input name="rollNo" placeholder="Roll No." onChange={handleChange} required />
        <select name="class" onChange={handleChange} required>
          <option value="">Select Class</option>
          <option value="MCA">MCA</option>
          <option value="MBA">MBA</option>
        </select>
main
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
