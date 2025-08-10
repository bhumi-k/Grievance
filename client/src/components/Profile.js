import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        name: storedUser.name || '',
        email: storedUser.email || '',
        password: ''
      });
    }
    setLoading(false); // ✅ End loading state
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

const handleSave = async () => {
  try {
    const res = await axios.put(`/api/users/${user.id}`, formData);
    alert(res.data.message + '. Please log in again.');

    // Clear saved user data and log out
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('rollNo');

    // Redirect to login
    window.location.href = '/login';
  } catch (err) {
    alert(err.response?.data?.message || 'Update failed');
  }
};


  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</p>;
  }

  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
      No profile data found. Please log in again.
    </p>;
  }

  return (
    <div className="profile-container">
      <h2 className="welcome-text">Hi, {user.name} 👋</h2>

      <div className="profile-card">
        {!editMode ? (
          <>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            {user.role === 'user' && (
              <>
                <p><strong>Roll No:</strong> {user.roll_no}</p>
                <p><strong>Class:</strong> {user.class}</p>
              </>
            )}
            <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
          </>
        ) : (
          <>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
            />
            <div className="button-group">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
