import React, { useState } from "react";
import "./Form.css";
import axios from "axios";

const Register = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNo: "",
    class: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("/api/register", formData);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={`form-container theme-${theme}`}>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <select
          name="role"
          style={{ padding: "8px 16px" }}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="user">Student</option>
          <option value="admin">Admin</option>
        </select>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
        />
        {formData.role === "user" && (
          <>
            <input
              name="rollNo"
              placeholder="Roll No."
              onChange={handleChange}
              required
            />
            <select name="class" onChange={handleChange} required>
              <option value="">Select Class</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
            </select>
          </>
        )}
        {formData.role === "admin" && (
          <input
            name="adminCode"
            placeholder="Admin Code"
            onChange={handleChange}
            required
          />
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
