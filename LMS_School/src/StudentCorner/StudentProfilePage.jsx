// StudentProfilePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    console.log("StudentProfilePage: token from localStorage:", token);

    if (!token) {
      console.warn("StudentProfilePage: No token found, redirecting to /student-login");
      navigate("/student-corner");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("StudentProfilePage: Fetching profile from", `${API_BASE}/api/students/profile`);
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("StudentProfilePage: Profile response:", res.data);

        if (res.data && res.data.success) {
          setProfile(res.data.data);
          // Keep local cache consistent
          localStorage.setItem("studentProfile", JSON.stringify(res.data.data));
        } else {
          setError(res.data.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("StudentProfilePage fetch error:", err.response?.data || err.message || err);
        setError(err.response?.data?.message || "Server error while fetching profile");
        // if auth error, redirect to login
        if (err.response?.status === 401) {
          console.warn("StudentProfilePage: Unauthorized — redirecting to login");
          localStorage.removeItem("studentToken");
          navigate("/student-corner");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    console.log("StudentProfilePage: Logging out");
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentProfile");
    navigate("/student-corner");
  };

  if (loading) {
    return <div className="sp-page"><p className="sp-loading">Loading profile...</p></div>;
  }

  if (error) {
    return (
      <div className="sp-page">
        <p className="sp-error">Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="sp-page">
        <p>No profile available.</p>
      </div>
    );
  }

  return (
    <div className="sp-page">
  

      <main className="sp-main">
        <div className="sp-banner">
          <div className="sp-banner-overlay" />
          <div className="sp-banner-content">
            <img
              className="sp-banner-avatar"
              src={profile.photo ? `${API_BASE}${profile.photo}` : "/default-avatar.png"}
              alt="Avatar"
            />
            <div>
              <h1>{profile.fullname}</h1>
              <p className="sp-meta">Admission: {profile.admissionId} • Class: {profile.standard} {profile.section}</p>
            </div>
            <div className="sp-actions">
              <button onClick={() => { console.log("Edit Profile clicked"); navigate(`/student-edit/${profile.admissionId}`); }}>Edit Profile</button>
              <button onClick={handleLogout} className="sp-logout-inline">Logout</button>
            </div>
          </div>
        </div>

        <section className="sp-section">
          <h2>Personal Details</h2>
          <div className="sp-grid">
            <div><strong>Full Name</strong><p>{profile.fullname}</p></div>
            <div><strong>Admission ID</strong><p>{profile.admissionId}</p></div>
            <div><strong>Date of Birth</strong><p>{profile.dateofbirth || "N/A"}</p></div>
            <div><strong>Gender</strong><p>{profile.gender || "N/A"}</p></div>
            <div><strong>Contact</strong><p>{profile.contactNumber || "N/A"}</p></div>
            <div><strong>Address</strong><p>{profile.address || "N/A"}</p></div>
          </div>
        </section>

        <section className="sp-section">
          <h2>Academic</h2>
          <div className="sp-grid">
            <div><strong>Standard</strong><p>{profile.standard || "N/A"}</p></div>
            <div><strong>Section</strong><p>{profile.section || "N/A"}</p></div>
            <div><strong>School Code</strong><p>{profile.schoolCode}</p></div>
          </div>
        </section>

        <section className="sp-section">
          <h2>Account</h2>
          <div className="sp-grid">
            <div><strong>Email</strong><p>{profile.email || "N/A"}</p></div>
            <div><strong>Last Sync</strong><p>{new Date().toLocaleString()}</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}
