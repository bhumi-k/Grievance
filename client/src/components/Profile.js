import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = ({ theme }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        password: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`/api/users/${user.id}`, formData);
      alert(res.data.message);
      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (!user) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading profile...
      </p>
    );
  }

  return (
    <div
      className="profile-container"
      style={{
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
        color: theme === "dark" ? "#f0f0f0" : "#000",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2 className="welcome-text">Hi, {user.name} 👋</h2>

      <div
        className="profile-card"
        style={{
          background: theme === "dark" ? "#2b2b2b" : "#f9f9f9",
          color: theme === "dark" ? "#f0f0f0" : "#000",
          border: theme === "dark" ? "1px solid #555" : "1px solid #ccc",
          borderRadius: "12px",
          padding: "20px",
          maxWidth: "400px",
          margin: "auto",
        }}
      >
        {!editMode ? (
          <>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            {user.role === "user" && (
              <>
                <p>
                  <strong>Roll No:</strong> {user.roll_no}
                </p>
                <p>
                  <strong>Class:</strong> {user.class}
                </p>
              </>
            )}
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
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
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
