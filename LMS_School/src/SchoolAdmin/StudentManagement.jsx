// StudentManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Phone, GraduationCap } from "lucide-react";
import "./StudentManagement.css";
import AddStudentModal from "./AddStudentModal";
import ViewStudentModal from "./ViewStudentModal";
const API_BASE = import.meta.env.VITE_API_URL;

const StudentManagement = () => {
  const navigate = useNavigate();
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
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
    // eslint-disable-next-line
  }, [token]);

  /* ================= FETCH STUDENTS ================= */

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`, // if backend checks token
        },
        params: {
          schoolCode: schoolCode, // matches your GET API
        },
      });

      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Fetch students error:", err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };
/* ================= DELETE STUDENT ================= */

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this student?")) {
    return;
  }

  try {
    await axios.delete(`${API_BASE}/api/students/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Student deleted successfully");
    fetchStudents(); // reload list
  } catch (err) {
    console.error("Delete student error:", err);
    alert(err.response?.data?.message || "Failed to delete student");
  }
};

  /* ================= FILTER LOGIC ================= */

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName || ""}`.toLowerCase();

    const nameMatch = fullName.includes(searchName.toLowerCase());

    const phoneMatch = String(s.phone || "").includes(searchPhone);

    const classMatch =
      filterClass === "" ? true : String(s.studentClass) === String(filterClass);

    return nameMatch && phoneMatch && classMatch;
  });

  if (!token) {
    return <p style={{ padding: 20 }}>Please login to continue</p>;
  }

  /* ================= UI ================= */

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

      {/* ===== ADD MODAL ===== */}
      {openAddModal && (
        <AddStudentModal
          onClose={() => {
            setOpenAddModal(false);
            fetchStudents(); // reload after add
          }}
        />
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
              {[...new Set(students.map((s) => s.studentClass))].map((cls) => (
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
    <th>Photo</th>
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
                  <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id}>

  {/* PROFILE PHOTO */}
  <td>
    {s.profilePhoto ? (
      <img
        src={s.profilePhoto}
        alt="Student"
        className="student-avatar"
        onError={(e) => (e.target.src = "/avatar.png")}
      />
    ) : (
      <span className="no-photo">N/A</span>
    )}
  </td>

  <td className="roll">{s.rollNumber || "-"}</td>

  <td>{s.firstName} {s.lastName}</td>

  <td>
    <span className="class-chip">
      Class {s.studentClass} {s.section}
    </span>
  </td>

  <td>{s.phone}</td>

 <td>
  <button
    className="view-btn"
    onClick={() => setViewStudent(s)}
  >
    View
  </button>

  <button
    className="edit-btn"
    onClick={() => setEditStudent(s)}
  >
    Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => handleDelete(s.id)}
  >
    Delete
  </button>
</td>

</tr>

                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* ===== VIEW STUDENT MODAL ===== */}
{viewStudent && (
  <ViewStudentModal
    student={viewStudent}
    onClose={() => setViewStudent(null)}
  />
)}
{editStudent && (
  <AddStudentModal
    editData={editStudent}
    onClose={() => {
      setEditStudent(null);
      fetchStudents();
    }}
  />
)}

    </div>
  );
};

export default StudentManagement;
