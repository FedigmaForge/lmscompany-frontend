import React from "react";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const adminName = "Admin";
  const adminEmail = "admin@company.com";

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h3>Hello {adminName},</h3>
        <p>Here you can manage your schools.</p>
      </div>
      <div className="navbar-right">
        <div className="admin-info">
          <FaUserCircle size={30} />
          <div>
            <h4>{adminName}</h4>
            <p>{adminEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
