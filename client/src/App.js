import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import Register from './components/Register';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GrievanceForm from './components/GrievanceForm';
import AdminDashboard from './components/AdminDashboard'
import Profile from './components/Profile';
function App() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [role, setRole] = useState(null);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const logout = () => {
    localStorage.removeItem('rollNo');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const rollNo = localStorage.getItem('rollNo');
    if (rollNo) {
      setIsLoggedIn(true);
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

        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route
              path="/register"
              element={<Register setIsLoggedIn={setIsLoggedIn} />}
            />
           <Route
  path="/login"
  element={<Login setIsLoggedIn={setIsLoggedIn} setRole={setRole} />}
/>
            <Route
              path="/"
              element={
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h2>Welcome to the Portal</h2>
                  {isLoggedIn ? <p>You are logged in ✅</p> : <p>Please login or register</p>}
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <Profile theme={theme} />
              }
            />
            <Route path="/dashboard" element={<Dashboard theme={theme} />} />
<Route
  path="/admin-dashboard"
  element={
    role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
  }
/>

            {/* ✅ Updated route to accept subject ID */}
            <Route path="/raise-grievance/:id" element={<GrievanceForm />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;