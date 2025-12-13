import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SchoolAdminLogin.css";

const SchoolAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !schoolCode) {
      setError("All fields are required!");
      return;
    }

    try {
      // ✅ Make sure URL matches backend route
      const response = await axios.post("http://localhost:4000/api/schools/login", {
        email,
        password,
        school_code: schoolCode, // Must match backend
      });

      if (response.data.success) {
        // Save login info in localStorage
        localStorage.setItem("schoolToken", response.data.token);
        localStorage.setItem("schoolCode", schoolCode);
        localStorage.setItem("schoolName", response.data.school.school_name);
         localStorage.setItem("schoolLogo", response.data.school.school_logo);
        alert(`Welcome ${response.data.school.school_name}!`);
        navigate("/school-dashboard"); // Redirect after login
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Display backend error message if available
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <section className="admin-login-section">
      <div className="admin-login-box">
        <h2>School Admin Login</h2>
        {error && <p className="error-msg">{error}</p>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="School Code"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
            required
          />

          <button type="submit">Sign In</button>
        </form>
      </div>
    </section>
  );
};

export default SchoolAdminLogin;
