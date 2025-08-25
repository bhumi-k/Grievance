import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import GrievanceForm from "./components/GrievanceForm";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import AdminInbox from "./components/AdminInbox";
import AdminRegister from "./components/AdminRegister";
import AdminLayout from "./components/AdminLayout";
import FacultyDashboard from './components/faculty/Dashboard';
import ResolveGrievance from './components/faculty/ResolveGrievance';

function RequireAdmin({ children }) {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/login" />;
}

function App() {
  const [theme, setTheme] = useState("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const logout = () => {
    localStorage.removeItem("rollNo");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
  };

  useEffect(() => {
    const rollNo = localStorage.getItem("rollNo");
    const savedRole = localStorage.getItem("role");
    if (rollNo) {
      setIsLoggedIn(true);
      setRole(savedRole);
    }
  }, []);

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
            {/* Public routes */}
            <Route
              path="/register"
              element={<Register setIsLoggedIn={setIsLoggedIn} theme={theme} />}
            />
            <Route
              path="/login"
              element={
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  setRole={setRole}
                  theme={theme}
                />
              }
            />
            <Route
              path="/"
              element={
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <h2>Welcome to the Portal</h2>
                  <p>Please login or register</p>
                </div>
              }
            />

            <Route path="/dashboard" element={<Dashboard theme={theme} />} />
            <Route path="/profile" element={<Profile theme={theme} />} />
            <Route path="/raise-grievance/:id" element={<GrievanceForm />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="register" element={<AdminRegister />} />
              <Route path="inbox" element={<AdminInbox />} />
            </Route>


            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />

            {/* ✅ Updated route to accept subject ID */}
            <Route path="/raise-grievance/:id" element={<GrievanceForm />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboard theme={theme} />} />
            <Route path="/resolve/:id" element={<ResolveGrievance theme={theme} />} />

          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
