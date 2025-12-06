import React, { useEffect, useState } from "react";
import axios from "axios";
import AddEditSchoolForm from "../Schools/AddSchool"; // ✅ import your existing form
import "../../styles/ManageSchools.css";

const ManageSchools = () => {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editSchoolId, setEditSchoolId] = useState(null);
  const token = localStorage.getItem("companyToken");

  const fetchSchools = () => {
    axios
      .get("http://localhost:4000/api/schools", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSchools(res.data))
      .catch((err) => console.error("Error fetching schools:", err));
  };

  useEffect(() => {
    fetchSchools();
  }, [token]);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("School deleted successfully!");
      fetchSchools();
    } catch (err) {
      console.error("Error deleting school:", err);
      alert("Failed to delete school");
    }
  };

  const handleAddNew = () => {
    setEditSchoolId(null);
    setShowForm(true);
  };

  const handleEdit = (id) => {
    setEditSchoolId(id);
    setShowForm(true);
  };

  const filteredSchools = schools.filter((s) =>
    s.school_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-schools-container">
      <div className="header-row">
        <h2>Manage Schools</h2>
        <button className="add-btn" onClick={handleAddNew}>
          + Add School
        </button>
      </div>

      {/* 🔍 Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by school name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📋 Schools Table */}
      <table className="school-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Logo</th>
            <th>School Name</th>
            <th>Email</th>
            <th>Status</th>
          
            <th>Joined On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSchools.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">
                No schools found.
              </td>
            </tr>
          ) : (
            filteredSchools.map((school, index) => (
              <tr key={school.school_code}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={school.school_logo}
                    alt="logo"
                    className="school-logo"
                  />
                </td>
                <td>{school.school_name}</td>
                <td>{school.email}</td>
                <td
                  className={
                    school.active === 1 ? "status-active" : "status-inactive"
                  }
                >
                  {school.active === 1 ? "Active" : "Inactive"}
                </td>
                
                <td>
                  {school.active_date
                    ? new Date(school.active_date).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(school.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(school.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🧩 Add/Edit Form (Popup) */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ✕
            </button>
            <AddEditSchoolForm
              schoolId={editSchoolId}
              onSuccess={() => {
                setShowForm(false);
                fetchSchools();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;
