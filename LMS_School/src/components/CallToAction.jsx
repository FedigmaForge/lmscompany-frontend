import React from 'react';
// Import the corresponding CSS file
import './CallToAction.css';

const CallToAction = () => {
  return (
    // The main container with the gradient background
    <div className="cta-container">
      <div className="cta-content">
        {/* Main headline */}
        <h2 className="cta-headline">Ready to Start Learning?</h2>
        
        {/* Supporting text */}
        <p className="cta-text">
          Join thousands of students who have already transformed their careers with our courses. 
          Sign up today and get access to our comprehensive learning platform.
        </p>
        
        {/* Buttons container */}
        <div className="cta-buttons">
          {/* Sign Up button - White background, Pink text */}
          <button className="cta-button primary-button">
            Sign Up Now
          </button>
          
          {/* Contact Us button - Pink background, White text */}
          <button className="cta-button secondary-button">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;