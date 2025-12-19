import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Outlet } from "react-router-dom";


const API_BASE = import.meta.env.VITE_API_URL || "http://13.234.75.130:4000";

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/TeacherLogin");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await axios.get(`${API_BASE}/api/teachers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setProfile(res.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("teacherToken");
          navigate("/TeacherLogin");
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("teacherData");
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
              alt="Teacher"
            />
          </div>
          <h3 className="sp-name">{profile?.fullname || "Teacher"}</h3>
          <p className="sp-small">{profile?.employeeid} • {profile?.schoolCode}</p>
        </div>

        <nav className="sp-nav">
          <button onClick={() => navigate("")}>Dashboard</button>
          <button onClick={() => navigate("profile")}>Profile</button>
          <button onClick={() => navigate("attendance")}>Attendance</button>
          <button onClick={() => navigate("classes")}>My Classes</button>
          <button onClick={() => navigate("students")}>Students</button>
          <button onClick={handleLogout} className="sp-logout">Logout</button>
        </nav>
      </aside>

      {/* ✅ MAIN CONTENT - Changes by Route */}
      <main
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f5f5f5",
          height: "100vh",
          overflowY: "auto"
        }}
      >
        <Outlet /> {/* Dynamic Content */}
      </main>

    </div>
  );
}
