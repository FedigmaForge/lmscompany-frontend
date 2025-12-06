import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaSchool, FaSignOutAlt, FaBars } from "react-icons/fa";

const Sidebar = ({ collapsed, toggleSidebar }) => {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <img src="/logo.png" alt="Logo" className="logo" />}
        <FaBars className="toggle-btn" onClick={toggleSidebar} />
      </div>

      <ul className="menu">
        <li>
          <Link to="/dashboard">
            <FaHome />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </li>

        <li>
          <Link to="/manageschools">
            <FaSchool />
            {!collapsed && <span>Manage Schools</span>}
          </Link>
        </li>

        <li>
          <Link to="/">
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
