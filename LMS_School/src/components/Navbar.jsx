import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">LMS Portal</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {/* <li><Link to="/TeacherLogin">Teacher Corner</Link></li> */}
        {/* <li><Link to="/student-corner">Student Corner</Link></li> */}
        <li><Link to="/courses">Courses</Link></li>
        <li><Link to="/contact-us">Contact Us</Link></li>
        <li><Link to="/sign-in">Sign In</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
