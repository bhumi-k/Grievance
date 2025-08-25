import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const role = localStorage.getItem("role"); // ✅ check role from storage

  if (role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAdmin;
