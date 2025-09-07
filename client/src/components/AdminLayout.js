import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = ({ theme }) => {
  return (
    <div className={`admin-layout theme-${theme}`}>
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/admin/dashboard" activeclassname="active">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to="/admin/register" activeclassname="active">Register</NavLink>
            </li>
            <li>
              <NavLink to="/admin/inbox" activeclassname="active">Inbox</NavLink>
            </li>
            <li>
              <NavLink to="/add-subject" activeclassname="active">Add Subject</NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
};

export default AdminLayout;
