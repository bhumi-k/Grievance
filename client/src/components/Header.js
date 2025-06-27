import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Form.css';

const Header = ({ theme, toggleTheme, isLoggedIn, logout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      background: '#007bff',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 30px',
      alignItems: 'center'
    }}>
      <h2 style={{ margin: 0 }}>Student Portal</h2>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
        {!isLoggedIn ? (
          <>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
          </>
        ) : (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDropdown(prev => !prev)}
              style={{
                cursor: 'pointer',
                fontSize: '22px',
                background: 'white',
                color: '#007bff',
                padding: '6px 10px',
                borderRadius: '50%',
                fontWeight: 'bold'
              }}
              title="Profile"
            >
              👤
            </div>
            {showDropdown && (
              <ul style={{
                position: 'absolute',
                top: 45,
                right: 0,
                background: '#fff',
                color: '#333',
                listStyle: 'none',
                padding: '8px 0',
                borderRadius: '8px',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 999,
                minWidth: '120px'
              }}>
                <li
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Profile
                </li>
                <li
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                    navigate('/');
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Logout
                </li>
              </ul>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          style={{
            background: 'white',
            color: '#007bff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '16px'
          }}
          title="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
