import React from "react";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to LMS Portal</h1>
        <p>
          Transform your learning journey with our comprehensive Learning Management System.
          Access courses, track progress, and achieve your educational goals.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Explore Courses</button>
          <button className="btn-outline">Get Started</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
