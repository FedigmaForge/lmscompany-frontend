import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageCropper from "./ImageCropper";
import "./TeacherManagement.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    fullname: "",
    subject: "",
    qualification: "",
    experience: "",
    dateofbirth: "",
    mobileNo: "",
    employeeid: "",
    presentAddress: "",
    email: "",
    password: "",
    active: 1,
    photo: null,
    schoolCode: localStorage.getItem("schoolCode") || "",
  });

  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("schoolToken");
  const schoolCode = localStorage.getItem("schoolCode");

  useEffect(() => {
    if (token) fetchTeachers();
  }, [token]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { school_code: schoolCode },
      });
      setTeachers(res.data.data || []);
    } catch (err) {
      console.error("fetchTeachers error:", err);
      alert("Error fetching teachers. See console.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      if (!file) return;
      setSelectedFile(file);
      setShowCropper(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveCropped = (croppedBlobOrDataUrl) => {
    if (croppedBlobOrDataUrl instanceof Blob || croppedBlobOrDataUrl instanceof File) {
      const file =
        croppedBlobOrDataUrl instanceof File
          ? croppedBlobOrDataUrl
          : new File([croppedBlobOrDataUrl], `photo_${Date.now()}.png`, {
              type: croppedBlobOrDataUrl.type || "image/png",
            });
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    } else if (typeof croppedBlobOrDataUrl === "string" && croppedBlobOrDataUrl.startsWith("data:")) {
      const arr = croppedBlobOrDataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8 = new Uint8Array(n);
      while (n--) u8[n] = bstr.charCodeAt(n);
      const blob = new Blob([u8], { type: mime });
      const file = new File([blob], `photo_${Date.now()}.png`, { type: mime });
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    }
    setShowCropper(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Login required.");

    try {
      setLoading(true);
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value !== null && value !== undefined) {
          fd.append(key, value);
        }
      });

      const url = isEditing
        ? `${API_BASE}/api/teachers/update/${editingId}`
        : `${API_BASE}/api/teachers/add`;
      const method = isEditing ? "put" : "post";

      const res = await axios({
        method,
        url,
        data: fd,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message || (isEditing ? "Updated!" : "Added!"));
      resetForm();
      fetchTeachers();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed! Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setFormData({
      fullname: teacher.fullname || "",
      subject: teacher.subject || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      dateofbirth: teacher.dateofbirth ? teacher.dateofbirth.split("T")[0] : "",
      mobileNo: teacher.mobileNo || "",
      employeeid: teacher.employeeid || "",
      presentAddress: teacher.presentAddress || "",
      email: teacher.email || "",
      password: "", 
      active: teacher.active ?? 1,
      photo: null,
      schoolCode: teacher.schoolCode || localStorage.getItem("schoolCode") || "",
    });

    setPreview(teacher.photo || null);
    setIsEditing(true);
    setEditingId(teacher.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/teachers/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Teacher deleted");
      fetchTeachers();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      subject: "",
      qualification: "",
      experience: "",
      dateofbirth: "",
      mobileNo: "",
      employeeid: "",
      presentAddress: "",
      email: "",
      password: "",
      active: 1,
      photo: null,
      schoolCode: localStorage.getItem("schoolCode") || "",
    });
    setPreview(null);
    setIsEditing(false);
    setEditingId(null);
    setSelectedFile(null);
  };

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Auth required</h3>
        <p>Please login to manage teachers.</p>
        <a href="/login">Login</a>
      </div>
    );
  }

  return (
    <div className="teacher-management">
      <h2>Teacher Management</h2>

      {showCropper && (
        <ImageCropper
          image={selectedFile}
          onSave={handleSaveCropped}
          onClose={() => setShowCropper(false)}
        />
      )}

      {/* Form */}
      <form className="teacher-form" onSubmit={handleSubmit}>
        <input name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
        <input name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} />
        <input name="experience" placeholder="Experience" value={formData.experience} onChange={handleChange} />
        <input type="date" name="dateofbirth" value={formData.dateofbirth} onChange={handleChange} />
        <input name="mobileNo" placeholder="Mobile Number" value={formData.mobileNo} onChange={handleChange} />
        <input name="employeeid" placeholder="Employee ID" value={formData.employeeid} onChange={handleChange} />
        <input name="presentAddress" placeholder="Address" value={formData.presentAddress} onChange={handleChange} />

        {!isEditing && (
          <>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </>
        )}

        <input name="schoolCode" value={formData.schoolCode} readOnly />

        <div className="profile-upload">
          <label>Profile Photo</label>
          <input type="file" name="photo" accept="image/*" onChange={handleChange} />
          {preview && (
            <img
              src={preview}
              alt="preview"
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{isEditing ? "Update" : "Add"} Teacher</button>
          {isEditing && (
            <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Teacher List */}
      <h3>All Teachers</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="teacher-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Subject</th>
              <th>Qualification</th>
              <th>Experience</th>
              <th>Mobile</th>
              <th>Employee ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.photo ? (
                    <img
                      src={`${API_BASE}${t.photo}`}
                      alt="profile"
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{t.fullname}</td>
                <td>{t.subject}</td>
                <td>{t.qualification}</td>
                <td>{t.experience}</td>
                <td>{t.mobileNo}</td>
                <td>{t.employeeid}</td>
                <td>
                  <button onClick={() => handleEdit(t)}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} style={{ marginLeft: 6 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherManagement;
