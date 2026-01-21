import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentCorner.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("📥 Login Form Submitted");
    console.log("➡️ Sending Login Request With:", { email, password, schoolCode });

    if (!email || !password || !schoolCode) {
      setError("Please fill all fields: Email, Password, and School Code");
      return;
    }

    try {
      console.log(`🌐 POST: ${API_BASE}/api/students/login`);

      const res = await axios.post(`${API_BASE}/api/students/login`, {
        email,
        password,
        schoolCode,
      });

      console.log("✅ Login Response:", res.data);

      if (!res.data.success) {
        setError(res.data.message || "Invalid credentials");
        return;
      }

      console.log("🔐 Storing JWT Token & Login Details in LocalStorage");

      localStorage.setItem("studentToken", res.data.token);
      localStorage.setItem("studentEmail", email);
      localStorage.setItem("schoolCode", schoolCode);

      // ✅ Fetch Student Profile
      console.log(`🌐 GET: ${API_BASE}/api/students/profile`);
      const profileRes = await axios.get(`${API_BASE}/api/students/profile`, {
        headers: {
          Authorization: `Bearer ${res.data.token}`,
        },
      });

      if (profileRes.data.success) {
        localStorage.setItem(
          "studentProfile",
          JSON.stringify(profileRes.data.data)
        );
      }

      console.log("✅ Redirecting to /student/dashboard");
      navigate("/student/dashboard");

    } catch (err) {
      console.error("🔥 Login Error:", err);
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="student-login-container">
      <form className="student-login-form" onSubmit={handleSubmit}>
        <h2>Student Login</h2>
        {error && <p className="error-msg">{error}</p>}

        {/* EMAIL */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
          />
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
          />
        </div>

        {/* SCHOOL CODE */}
        <div className="form-group">
          <label>School Code</label>
          <input
            type="text"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
            placeholder="Enter your School Code"
          />
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default StudentLogin;
