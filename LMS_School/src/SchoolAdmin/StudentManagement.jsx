// StudentManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Phone, GraduationCap } from "lucide-react";
import "./StudentManagement.css";
import AddStudentModal from "./AddStudentModal";
const API_BASE = import.meta.env.VITE_API_URL;

const StudentManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("schoolToken");
  const schoolCode = localStorage.getItem("schoolCode");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterClass, setFilterClass] = useState("");

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
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  };

  //  FIXED FILTER LOGIC
  const filteredStudents = students.filter((s) => {
    const nameMatch = s.fullname
      ?.toLowerCase()
      .includes(searchName.toLowerCase());

    const phoneMatch = String(s.contactNumber || "").includes(searchPhone);

    const classMatch =
      filterClass === ""
        ? true
        : Number(s.standard) === Number(filterClass);

    return nameMatch && phoneMatch && classMatch;
  });

  if (!token) {
    return <p style={{ padding: 20 }}>Please login to continue</p>;
  }

  return (
    <div className="student-page">
      {/* ===== HEADER ===== */}
      <div className="student-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <div>
            <h1>Students Management</h1>
            <p>Total Students: {students.length}</p>
          </div>
        </div>

        <button className="add-btn" onClick={() => setOpenAddModal(true)}>
          <Plus /> Add New Student
        </button>

      </div>
      {openAddModal && (
        <AddStudentModal onClose={() => setOpenAddModal(false)} />
      )}

      {/* ===== FILTERS ===== */}
      <div className="filter-card">
        <h3>Filters & Search</h3>

        <div className="filter-grid">
          {/* Search by Name */}
          <div className="filter-input">
            <Search />
            <input
              placeholder="Search student name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          {/* Search by Phone */}
          <div className="filter-input">
            <Phone />
            <input
              placeholder="Search phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>

          {/* Filter by Class */}
          <div className="filter-input">
            <GraduationCap />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {[...new Set(students.map((s) => s.standard))].map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-btn"
            onClick={() => {
              setSearchName("");
              setSearchPhone("");
              setFilterClass("");
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ===== STUDENT LIST ===== */}
      <div className="table-card">
        <h3>Students List</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Phone Number</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, i) => (
                  <tr key={s.id}>
                    <td className="roll">{s.admissionId}</td>
                    <td>{s.fullname}</td>
                    <td>
                      <span className="class-chip">
                        Class {s.standard} {s.section}
                      </span>
                    </td>
                    <td>{s.contactNumber}</td>
                    <td>
                      <button className="view-btn">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
