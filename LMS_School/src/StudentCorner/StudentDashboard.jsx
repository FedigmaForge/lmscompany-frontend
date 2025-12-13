// StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Outlet } from "react-router-dom";
import "./StudentProfile.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/student-corner");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await axios.get(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("studentToken");
          navigate("/student-corner");
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentProfile");
    navigate("/");
  };

  return (
    <div className="sp-page">

      {/* ✅ FIXED SIDEBAR */}
      <aside className="sp-sidebar">
        <div className="sp-sidebar-top">
          <div className="sp-avatar-wrap">
            <img
              className="sp-avatar"
              src={profile?.photo ? `${API_BASE}${profile.photo}` : "/default-avatar.png"}
              alt="Student"
            />
          </div>
          <h3 className="sp-name">{profile?.fullname || "Student"}</h3>
          <p className="sp-small">{profile?.admissionId} • {profile?.schoolCode}</p>
        </div>

        <nav className="sp-nav">
          <button className="active">Dashboard</button>
          <button onClick={() => navigate("profile")}>Profile</button>
          <button onClick={() => navigate("attendance")}>Attendance</button>
          <button onClick={() => navigate("results")}>Results</button>
          <button onClick={() => navigate("homework")}>Homework</button>
          <button onClick={() => navigate("FeeReceiptComponent")}>FeeReceiptComponent</button>
          <button onClick={handleLogout} className="sp-logout">Logout</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      {/* <main className="sp-main">
        <h1>Welcome {profile?.fullname || "Student"}</h1>
        <div className="sd-cards">
          <div className="sd-card">Attendance: <strong>--</strong></div>
          <div className="sd-card">Homework: <strong>--</strong></div>
          <div className="sd-card">Results: <strong>--</strong></div>
        </div>

        <section className="sd-welcome">
          <h3>Hello {profile?.fullname || "Student"}</h3>
          <p>Use the menu to view profile, attendance, results and homework.</p>
        </section>
      </main> */}
      {/* Changing Content */}
      <main
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f9f9f9",
          height: "100vh",
          overflowY: "auto"
        }}
      >
        <Outlet /> {/* 👈 Child pages load here */}
      </main>

    </div>
  );
}
