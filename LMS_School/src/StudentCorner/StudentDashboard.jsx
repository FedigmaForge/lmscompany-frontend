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
      navigate("/sign-in");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await axios.get(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.data) {
          const data = res.data.data;

          //  Map backend fields to frontend expectations
          const mappedProfile = {
            ...data,
            fullname: `${data.firstName} ${data.lastName}`,
            admissionId: data.id,
            standard: data.studentClass,
            photo: data.profilePhoto,
          };

          setProfile(mappedProfile);
          localStorage.setItem("studentProfile", JSON.stringify(mappedProfile));
        }
      } catch (err) {
        console.error("StudentDashboard fetch error:", err.response?.data || err.message || err);

        if (err.response?.status === 401) {
          localStorage.removeItem("studentToken");
          localStorage.removeItem("studentProfile");
          navigate("/sign-in");
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
    navigate("/sign-in");
  };

  if (loadingProfile) {
    return <div className="sp-page"><p className="sp-loading">Loading profile...</p></div>;
  }

  return (
    <div className="sp-page">

      {/*  FIXED SIDEBAR */}
      <aside className="sp-sidebar">
        <div className="sp-sidebar-top">
          <div className="sp-avatar-wrap">
            <img
              className="sp-avatar"
              src={profile?.photo || "/default-avatar.png"}
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
      <main
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f9f9f9",
          height: "100vh",
          overflowY: "auto"
        }}
      >
        <Outlet /> {/*  Child pages load here */}
      </main>

    </div>
  );
}
