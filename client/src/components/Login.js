import React, { useState } from "react";
import "./Form.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsLoggedIn, setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("/api/login", { email, password });
    const user = res.data.user;

    alert(res.data.message);

    // Save all needed info to localStorage
    localStorage.setItem("user", JSON.stringify(user));

    setRole(user.role);
    setIsLoggedIn(true);

    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};



  return (
    <div className="form-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
