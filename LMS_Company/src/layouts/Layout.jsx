import React, { useState } from "react";
import Sidebar from "../pages/Dashboard/Sidebar";
import Navbar from "../pages/Dashboard/Navbar";
import { Outlet } from "react-router-dom";
import "../styles/Dashboard.css";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar />
        <div className="page-content">
          {/* This is where nested pages will render */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
