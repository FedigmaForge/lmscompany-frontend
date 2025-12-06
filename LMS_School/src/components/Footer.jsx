import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <>
      <section className="stats-section">
        <div className="stat-item">
          <h2>10K+</h2>
          <p>Active Students</p>
        </div>
        <div className="stat-item">
          <h2>500+</h2>
          <p>Expert Instructors</p>
        </div>
        <div className="stat-item">
          <h2>1K+</h2>
          <p>Courses Available</p>
        </div>
        <div className="stat-item">
          <h2>95%</h2>
          <p>Success Rate</p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column about">
            <h3>LMS Portal</h3>
            <p>
              Empowering education through innovative learning management
              solutions. Your gateway to knowledge and growth.
            </p>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Courses</a></li>
              <li><a href="#">Student Corner</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2024 LMS Portal. All rights reserved. Built with <span className="heart">❤</span> for education.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
