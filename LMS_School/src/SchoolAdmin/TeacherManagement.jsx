import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageCropper from "./ImageCropper";
import "./TeacherManagement.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
const [phoneSearch, setPhoneSearch] = useState("");
const [subjectFilter, setSubjectFilter] = useState("");
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

  const token = localStorage.getItem("schoolToken");
  const schoolCode = localStorage.getItem("schoolCode");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { school_code: schoolCode },
      });
      setTeachers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => v && fd.append(k, v));

    await axios.post(`${API_BASE}/api/teachers/add`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setShowForm(false);
    fetchTeachers();
  };
const filteredTeachers = teachers.filter((t) => {
  const name = t.fullname?.toLowerCase() || "";
  const phone = String(t.mobileNo || "");
  const subject = t.subject || "";

  return (
    name.includes(search.toLowerCase()) &&
    phone.includes(phoneSearch) &&
    (subjectFilter === "" || subject === subjectFilter)
  );
});



  return (
    <div className="tm-page">
      {/* HEADER */}
      <div className="tm-header">
        <div>
          <h2>Teacher Management</h2>
          <p>Total Teachers: {teachers.length}</p>
        </div>
        <button className="tm-add-btn" onClick={() => setShowForm(true)}>
          + Add New Teacher
        </button>
      </div>

      {/* FILTERS */}
     <div className="tm-filters">
  <input
    placeholder="Search teacher name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <input
    placeholder="Search phone number..."
    value={phoneSearch}
    onChange={(e) => setPhoneSearch(e.target.value)}
  />

  <select
    value={subjectFilter}
    onChange={(e) => setSubjectFilter(e.target.value)}
  >
    <option value="">All Subjects</option>
    <option value="Math">Math</option>
    <option value="Science">Science</option>
  </select>

  <button
    className="clear"
    onClick={() => {
      setSearch("");
      setPhoneSearch("");
      setSubjectFilter("");
    }}
  >
    Clear Filters
  </button>
</div>


      {/* TABLE */}
      <div className="tm-card">
        <h3>Teachers List</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="tm-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Phone</th>
                <th>Employee ID</th>
                <th>Action</th>
              </tr>
            </thead>
           <tbody>
  {filteredTeachers.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
        No teachers found
      </td>
    </tr>
  ) : (
    filteredTeachers.map((t, index) => (
      <tr key={t.id || t.employeeid || index}>
        <td>
          {t.photo ? (
            <img
              src={`${API_BASE}${t.photo}`}
              alt="Teacher"
              className="tm-photo"
            />
          ) : (
            <span>-</span>
          )}
        </td>

        <td>{t.fullname || "-"}</td>
        <td>{t.subject || "-"}</td>
        <td>{t.mobileNo || "-"}</td>
        <td>{t.employeeid || "-"}</td>

        <td className="tm-actions">
          <button className="view">View</button>
          <button className="edit">Edit</button>
          <button className="delete">Delete</button>
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        )}
      </div>

      {/* ADD TEACHER MODAL */}
      {showForm && (
        <div className="tm-modal">
          <div className="tm-modal-content">
            <h3>Add New Teacher</h3>

           <form onSubmit={handleSubmit} className="tm-form">

  <input
    name="fullname"
    placeholder="Full Name"
    onChange={handleChange}
    required
  />

  <input
    name="subject"
    placeholder="Subject"
    onChange={handleChange}
    required
  />

  <input
    name="qualification"
    placeholder="Qualification"
    onChange={handleChange}
  />

  <input
    name="experience"
    type="number"
    placeholder="Experience (Years)"
    onChange={handleChange}
  />

  <input
    name="dateofbirth"
    type="date"
    onChange={handleChange}
  />

  <input
    name="mobileNo"
    type="number"
    placeholder="Mobile Number"
    onChange={handleChange}
    required
  />

  <input
    name="employeeid"
    type="number"
    placeholder="Employee ID"
    onChange={handleChange}
    required
  />

  <textarea
    name="presentAddress"
    placeholder="Present Address"
    onChange={handleChange}
    className="full"
  />

  <input
    name="email"
    type="email"
    placeholder="Email Address"
    onChange={handleChange}
    required
  />

  <input
    name="password"
    type="password"
    placeholder="Password"
    onChange={handleChange}
    required
  />

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFormData({ ...formData, photo: e.target.files[0] })
    }
    className="full"
  />

  <div className="tm-form-actions">
    <button type="submit" className="save">Save</button>
    <button type="button" className="cancel" onClick={() => setShowForm(false)}>
      Cancel
    </button>
  </div>

</form>

          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
