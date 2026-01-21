import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SchoolAdminLogin.css";

// Slider images
import slide1 from "../images/slide1.jpeg";
import slide2 from "../images/slide2.jpeg";
import slide3 from "../images/slide3.jpeg";

const slides = [slide1, slide2, slide3];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SchoolAdminLogin = () => {
  const [role, setRole] = useState("student"); // default student
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const navigate = useNavigate();

  // ---------------------------
  // Auto Image Slider
  // ---------------------------
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // ---------------------------
  // Login Submit
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !schoolCode) {
      setError("Please fill all fields");
      return;
    }

    try {
      // =====================
      //  STUDENT LOGIN
      // =====================
      if (role === "student") {
        const res = await axios.post(`${API_BASE}/api/students/login`, {
          email,
          password,
          schoolCode,
        });

        if (!res.data.success) {
          setError(res.data.message || "Invalid credentials");
          return;
        }

        localStorage.setItem("studentToken", res.data.token);
        localStorage.setItem("studentEmail", email);
        localStorage.setItem("schoolCode", schoolCode);

        // Fetch student profile
        const profileRes = await axios.get(
          `${API_BASE}/api/students/profile`,
          {
            headers: {
              Authorization: `Bearer ${res.data.token}`,
            },
          }
        );

        if (profileRes.data.success) {
          localStorage.setItem(
            "studentProfile",
            JSON.stringify(profileRes.data.data)
          );
        }

        navigate("/student/dashboard");
      }

      // =====================
      //  ADMIN LOGIN
      // =====================
      if (role === "admin") {
        const response = await axios.post(
          `${API_BASE}/api/schools/login`,
          {
            email,
            password,
            school_code: schoolCode,
          }
        );

        if (!response.data.success) {
          setError(response.data.message || "Invalid credentials");
          return;
        }

        localStorage.setItem("schoolToken", response.data.token);
        localStorage.setItem("schoolCode", schoolCode);
        localStorage.setItem(
          "schoolName",
          response.data.school.school_name
        );
        localStorage.setItem(
          "schoolLogo",
          response.data.school.school_logo
        );

        navigate("/school-dashboard");
      }

      // =====================
      // 🚧 TEACHER (future)
      // =====================
      if (role === "teacher") {
        alert("Teacher login API not connected yet");
      }
    } catch (err) {
      console.error(" Login Error:", err);
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="login-wrapper">
      {/* ---------------- LEFT SLIDER ---------------- */}
      <div className="login-slider">
        <img src={slides[activeSlide]} alt="slide" />

        <div className="slider-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={i === activeSlide ? "dot active" : "dot"}
            />
          ))}
        </div>
      </div>

      {/* ---------------- RIGHT LOGIN ---------------- */}
      <div className="login-form-section">
        <h2>Welcome </h2>
        <p className="subtitle">Select your role to login</p>

        {/*  ROLE TOGGLE */}
        <div className="role-toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>

          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>

          <button
            type="button"
            className={role === "teacher" ? "active" : ""}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="School Code"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value)}
          />

          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SchoolAdminLogin;
