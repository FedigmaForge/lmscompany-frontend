// src/Teacher/TeacherEditProfile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherEditProfile.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://15.207.54.139:4000";

export default function TeacherEditProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("teacherToken");

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullname: "",
    subject: "",
    qualification: "",
    experience: "",
    dateofbirth: "",
    mobileNo: "",
    presentAddress: "",
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("teacherProfile");
    if (saved) {
      const p = JSON.parse(saved);
      setProfile({
        fullname: p.fullname || "",
        subject: p.subject || "",
        qualification: p.qualification || "",
        experience: p.experience || "",
        dateofbirth: p.dateofbirth || "",
        mobileNo: p.mobileNo || "",
        presentAddress: p.presentAddress || "",
        photo: null
      });
      if (p.photo) setPhotoPreview(`${API_BASE}${p.photo}`);
    } else {
      // optional: fetch profile if not present
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/teachers/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) {
            const p = res.data.data;
            setProfile({
              fullname: p.fullname || "",
              subject: p.subject || "",
              qualification: p.qualification || "",
              experience: p.experience || "",
              dateofbirth: p.dateofbirth || "",
              mobileNo: p.mobileNo || "",
              presentAddress: p.presentAddress || "",
              photo: null
            });
            if (p.photo) setPhotoPreview(`${API_BASE}${p.photo}`);
            localStorage.setItem("teacherProfile", JSON.stringify(p));
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      };
      fetchProfile();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile((prev) => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullname", profile.fullname);
      formData.append("subject", profile.subject);
      formData.append("qualification", profile.qualification);
      formData.append("experience", profile.experience);
      formData.append("dateofbirth", profile.dateofbirth);
      formData.append("mobileNo", profile.mobileNo);
      formData.append("presentAddress", profile.presentAddress);
      if (profile.photo) formData.append("photo", profile.photo);

      const res = await axios.put(`${API_BASE}/api/teachers/profile/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        // update local cache
        localStorage.setItem("teacherProfile", JSON.stringify(res.data.data));
        alert("Profile updated successfully");
        navigate("/teacher/profile"); // go back to profile screen
      } else {
        setError(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error", err);
      setError(err.response?.data?.message || "Server error while updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tep-page">
      <div className="tep-container">
        <h2>Edit Profile</h2>

        {error && <p className="tep-error">{error}</p>}

        <form className="tep-form" onSubmit={handleSubmit}>
          <div className="tep-row">
            <label>Full Name</label>
            <input name="fullname" value={profile.fullname} onChange={handleChange} required />
          </div>

          <div className="tep-row">
            <label>Subject</label>
            <input name="subject" value={profile.subject} onChange={handleChange} />
          </div>

          <div className="tep-row">
            <label>Qualification</label>
            <input name="qualification" value={profile.qualification} onChange={handleChange} />
          </div>

          <div className="tep-row">
            <label>Experience (years)</label>
            <input name="experience" type="number" value={profile.experience} onChange={handleChange} min="0" />
          </div>

          <div className="tep-row">
            <label>Date of Birth</label>
            <input name="dateofbirth" type="date" value={profile.dateofbirth} onChange={handleChange} />
          </div>

          <div className="tep-row">
            <label>Mobile No</label>
            <input name="mobileNo" value={profile.mobileNo} onChange={handleChange} />
          </div>

          <div className="tep-row">
            <label>Present Address</label>
            <textarea name="presentAddress" value={profile.presentAddress} onChange={handleChange} />
          </div>

          <div className="tep-row">
            <label>Photo</label>
            <input type="file" accept="image/*" onChange={handlePhoto} />
            {photoPreview && <img src={photoPreview} alt="preview" className="tep-preview" />}
          </div>

          <div className="tep-actions">
            <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
            <button type="button" className="tep-cancel" onClick={() => navigate("/teacher/profile")}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
