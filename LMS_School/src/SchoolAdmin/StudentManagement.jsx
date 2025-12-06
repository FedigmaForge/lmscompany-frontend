// StudentManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageCropper from "./ImageCropper";
import "./TeacherManagement.css"; // reuse same simple styles as teacher

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    fullname: "",
    admissionId: "",
    standard: "",
    section: "",
    dateofbirth: "",
    gender: "",
    contactNumber: "",
    address: "",
    email: "",
    password: "",
    photo: null,
    schoolCode: localStorage.getItem("schoolCode") || "",
  });

  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const schoolCode = localStorage.getItem("schoolCode");

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { school_code: schoolCode },
      });
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("fetchStudents error:", err);
      alert("Error fetching students. See console.");
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
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  // Cropped input can be Blob/File or dataURL; convert to File if dataURL
  const handleSaveCropped = (croppedBlobOrDataUrl) => {
    if (croppedBlobOrDataUrl instanceof Blob || croppedBlobOrDataUrl instanceof File) {
      const file = croppedBlobOrDataUrl instanceof File
        ? croppedBlobOrDataUrl
        : new File([croppedBlobOrDataUrl], `photo_${Date.now()}.png`, { type: croppedBlobOrDataUrl.type || "image/png" });
      setFormData((p) => ({ ...p, photo: file }));
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
      setFormData((p) => ({ ...p, photo: file }));
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

      // set schoolCode just in case
      if (!formData.schoolCode) fd.append("schoolCode", schoolCode);

      const url = isEditing
        ? `${API_BASE}/api/students/update/${editingId}`
        : `${API_BASE}/api/students/add`;

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
      fetchStudents();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed! Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      fullname: student.fullname || "",
      admissionId: student.admissionId || "",
      standard: student.standard || "",
      section: student.section || "",
      dateofbirth: student.dateofbirth ? student.dateofbirth.split("T")[0] : "",
      gender: student.gender || "",
      contactNumber: student.contactNumber || "",
      address: student.address || "",
      email: student.email || "",
      password: "", // keep blank on edit
      photo: null,
      schoolCode: student.schoolCode || localStorage.getItem("schoolCode") || "",
    });

    // preview: if backend stores path like "/uploads/..." show full url
    setPreview(student.photo ? `${API_BASE}${student.photo}` : null);
    setIsEditing(true);
    setEditingId(student.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/api/students/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Student deleted");
      fetchStudents();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      admissionId: "",
      standard: "",
      section: "",
      dateofbirth: "",
      gender: "",
      contactNumber: "",
      address: "",
      email: "",
      password: "",
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
        <p>Please login to manage students.</p>
        <a href="/login">Login</a>
      </div>
    );
  }

  return (
    <div className="teacher-management">
      <h2>Student Management</h2>

      {showCropper && (
        <ImageCropper image={selectedFile} onSave={handleSaveCropped} onClose={() => setShowCropper(false)} />
      )}

      <form className="teacher-form" onSubmit={handleSubmit}>
        <input name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange} required />
        <input name="admissionId" placeholder="Admission ID" value={formData.admissionId} onChange={handleChange} required />
        <input name="standard" placeholder="Standard" value={formData.standard} onChange={handleChange} />
        <input name="section" placeholder="Section" value={formData.section} onChange={handleChange} />
        <input type="date" name="dateofbirth" value={formData.dateofbirth} onChange={handleChange} />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} />
        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
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
          {preview && <img src={preview} alt="preview" style={{ width: 80, height: 80, objectFit: "cover" }} />}
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{isEditing ? "Update" : "Add"} Student</button>
          {isEditing && <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>Cancel</button>}
        </div>
      </form>

      <h3>All Students</h3>
      {loading ? <p>Loading...</p> : (
        <table className="teacher-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Admission ID</th>
              <th>Standard</th>
              <th>Section</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.photo ? (
                    <img
                      src={`${API_BASE}${s.photo}`}
                      alt="profile"
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{s.fullname}</td>
                <td>{s.admissionId}</td>
                <td>{s.standard}</td>
                <td>{s.section}</td>
                <td>{s.contactNumber}</td>
                <td>
                  <button onClick={() => handleEdit(s)}>Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ marginLeft: 6 }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentManagement;
