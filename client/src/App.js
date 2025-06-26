import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GrievanceForm from './components/GrievanceForm';


function App() {
  const [theme, setTheme] = useState('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const logout = () => {
    localStorage.removeItem('rollNo');
    setIsLoggedIn(false);

  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const rollNo = localStorage.getItem('rollNo');
    if (rollNo) {
      setIsLoggedIn(true); // ✅ persist login across refresh
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
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
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
                <div style={{ padding: '40px' }}>
                  <h2>Your Profile</h2>
                  <p>Welcome, user!</p>
                </div>
              }
            />
            <Route path="/dashboard" element={<Dashboard theme={theme} />} />

            <Route path="/raise-grievance" element={<GrievanceForm />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
