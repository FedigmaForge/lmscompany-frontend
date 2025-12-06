import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AddEditSchoolForm from "./AddSchool";
import "../../styles/SchoolList.css";

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const fetchTriggered = useRef(false);

  const token = localStorage.getItem("companyToken");
  const BASE_UPLOAD_URL = "http://localhost:4000/uploads/";

  const fetchSchools = async () => {
    if (fetchTriggered.current) return;
    fetchTriggered.current = true;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchools(res.data);
      setImageErrors({});
    } catch (err) {
      console.error("Error fetching schools:", err);
      alert("Failed to fetch schools");
    } finally {
      setLoading(false);
      fetchTriggered.current = false;
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/schools/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("School deleted successfully");
      fetchSchools();
    } catch (err) {
      console.error("Error deleting school:", err);
      alert("Failed to delete school");
    }
  };

  const handleEdit = (id) => {
    setEditingSchoolId(id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingSchoolId(null);
    setShowForm(true);
  };

  const handleImageError = (schoolId, logo, event) => {
    const status = event.target ? event.target.status || "unknown" : "unknown";
    console.error(`Failed to load logo for school ID ${schoolId}: ${logo} (Status: ${status})`);
    setImageErrors((prev) => ({ ...prev, [schoolId]: true }));
  };

  const getLogoUrl = (logo) => {
    if (!logo || typeof logo !== "string") return null;
    const cleanLogo = logo.replace(/^'|'$/g, '');
    if (cleanLogo.startsWith("http")) return cleanLogo;
    return `${BASE_UPLOAD_URL}${cleanLogo}`;
  };

  // ✅ Toggle school status (Active <-> Inactive)
  const handleToggleStatus = async (schoolId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await axios.put(
        `http://localhost:4000/api/schools/${schoolId}/status`,
        { active: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId ? { ...s, active: newStatus } : s
        )
      );
    } catch (err) {
      console.error("Error updating school status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="school-list-container">
      <h1>Manage Schools</h1>

      {showForm ? (
        <AddEditSchoolForm
          schoolId={editingSchoolId}
          onSuccess={() => {
            fetchSchools();
            setShowForm(false);
          }}
        />
      ) : (
        <>
          <button onClick={handleAdd}>➕ Add School</button>

          {loading ? (
            <p>Loading schools...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>School Name</th>
                  <th>Code</th>
                  <th>Contact</th>
                  <th>Account Type</th>
                  <th>Education Type</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Active Date</th>
                  <th>Deactive Date</th>
                  <th>Logo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id}>
                    <td>{school.id}</td>
                    <td>{school.school_name}</td>
                    <td>{school.school_code}</td>
                    <td>{school.contact_number || "-"}</td>
                    <td>{school.account_type}</td>
                    <td>{school.education_type || "School"}</td>
                    <td>{school.email || "-"}</td>

                    {/* ✅ Status Toggle Button */}
                    <td>
                      {/* <label className="switch">
                        <input
                          type="checkbox"
                          checked={school.active === 1}
                          onChange={() =>
                            handleToggleStatus(school.id, school.active)
                          }
                        />
                        <span className="slider round"></span>
                      </label> */}
                         <td>
  <div
    className={`switch-bar ${school.active === 1 ? "on" : "off"}`}
    onClick={() => handleToggleStatus(school.id, school.active)}
  >
    {school.active === 1 ? "ON" : "OFF"}
  </div>
</td>

                    </td>

                    <td>{school.active_date ? school.active_date.split('T')[0] : "-"}</td>
                    <td>{school.deactive_date ? school.deactive_date.split('T')[0] : "-"}</td>
                    <td>
                      {school.school_logo && !imageErrors[school.id] ? (
                        <img
                          src={getLogoUrl(school.school_logo)}
                          alt={`${school.school_name} Logo`}
                          width="50"
                          height="50"
                          style={{ objectFit: "contain" }}
                          onError={(e) => handleImageError(school.id, school.school_logo, e)}
                        />
                      ) : (
                        <span>No Logo</span>
                      )}
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(school.id)}>✏️ Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(school.id)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default SchoolList;
