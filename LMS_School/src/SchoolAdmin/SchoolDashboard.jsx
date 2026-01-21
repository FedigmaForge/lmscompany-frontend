import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./SchoolDashboard.css";

const SchoolDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("schoolToken");
  //  Add this
  const schoolLogo = localStorage.getItem("schoolLogo");

  // If not logged in → show Auth Required UI
  if (!token) {
    return (
      <div className="auth-required">
        <h2>Auth Required</h2>
        <p>Please login to manage teachers.</p>
        <button
          className="login-btn"
          onClick={() => navigate("/sign-in")}
        >
          Login
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("schoolToken");
    localStorage.removeItem("schoolCode");
    localStorage.removeItem("schoolName");

    navigate("/sign-in");
  };

  return (
    <div className="school-dashboard-container">
      <aside className="sidebar">

        {/* Load Logo */}
        {schoolLogo && (
          <img
            src={schoolLogo}
            alt="School Logo"
            className="school-logo"
          />
        )}

        <h3 className="sidebar-title">
          {localStorage.getItem("schoolName") || "School Admin"}
        </h3>

        <ul className="sidebar-menu">
           <li onClick={() => navigate("/school-dashboard")}> Home</li>
          <li onClick={() => navigate("/school-dashboard/teacher")}> Teacher</li>
          <li onClick={() => navigate("/school-dashboard/student")}> Student</li>
          <li onClick={() => navigate("/school-dashboard/attendance")}>Attendance</li>

          <li onClick={() => navigate("/school-dashboard/class-teacher-assignment")}>
            Class Teacher Assignment
          </li>

          <li onClick={() => navigate("/school-dashboard/fees")}> Fee Management</li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>


      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SchoolDashboard;
