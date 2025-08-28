import React, { useState } from 'react';
import './Form.css';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', rollNo: '', class: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ✅ Outlook Email Validation Function
  const isOutlookEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@(svims-pune.edu.in)$/i.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Check Outlook email
    if (!isOutlookEmail(formData.email)) {
      alert("Please use a valid SVIMS Outlook email address (e.g. @svims-pune.edu.in email id)");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post('/api/register', formData);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
        <input name="rollNo" placeholder="Roll No." onChange={handleChange} required />
        <select name="class" onChange={handleChange} required>
          <option value="">Select Class</option>
          <option value="MCA">MCA</option>
          <option value="MBA">MBA</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
