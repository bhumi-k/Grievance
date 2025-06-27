import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Header from "./components/Header";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [theme, setTheme] = useState("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("role");
  };

  return (
    <div className={`theme-${theme}`}>
      <Router>
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          isLoggedIn={isLoggedIn}
          logout={logout}
        />

        <main style={{ minHeight: "80vh" }}>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>Welcome to the Portal</h2>
                {isLoggedIn ? (
                  <p>You are logged in ✅</p>
                ) : (
                  <p>Please login or register</p>
                )}
              </div>
            } />

<Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            <Route path="/profile" element={
              <div style={{ padding: "40px" }}>
                <h2>Your Profile</h2>
                <p>Welcome, user!</p>
              </div>
            } />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
