import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ClassTeacherAssignment.css";

const API_BASE = "http://13.234.75.130:4000";

const ClassTeacherAssignment = () => {
  const [standard, setStandard] = useState("");
  const [section, setSection] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null); // show user-friendly messages

  const schoolCode = localStorage.getItem("schoolCode");
  const token = localStorage.getItem("schoolToken");

  useEffect(() => {
    fetchTeachers();
    fetchAssignments();
  }, []);

  // ----------------------------------------------------
  // FETCH TEACHERS
  // ----------------------------------------------------
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { school_code: schoolCode },
      });

      const teacherList = res.data.data || [];
      setTeachers(teacherList);
    } catch (err) {
      console.error("❌ fetchTeachers error:", err);
      setMessage("Error fetching teachers. See console.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // FETCH ASSIGNMENTS
  // ----------------------------------------------------
  const fetchAssignments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/class-teacher-assignment/assignments`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { schoolCode },
        }
      );
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error("❌ fetchAssignments error:", err);
      setMessage("Error fetching assignments.");
    }
  };

  // ----------------------------------------------------
  // helper: check duplicate
  // ----------------------------------------------------
  const isDuplicate = (std, sec, excludeId = null) => {
    if (!std || !sec) return false;
    return assignments.some((a) => {
      // match by schoolCode + standard + section
      const sameStd = String(a.standard) === String(std);
      const sameSec = String(a.section) === String(sec);
      const sameSchool = String(a.schoolCode || a.school_code || schoolCode) === String(schoolCode);
      const differentId = excludeId ? a.id !== excludeId : true;
      return sameStd && sameSec && sameSchool && differentId;
    });
  };

  // ----------------------------------------------------
  // ASSIGN OR UPDATE CLASS TEACHER
  // ----------------------------------------------------
const handleAssign = async () => {
  if (!standard || !section || !teacherId) {
    alert("Please select Standard, Section, and Teacher.");
    return;
  }

  // client-side duplicate check:
  if (isDuplicate(standard, section, editId)) {
    alert(`An assignment already exists for Standard ${standard} Section ${section}. Standard+Section must be unique.`);
    return;
  }

  // find teacher name
  const teacher = teachers.find((t) => String(t.id) === String(teacherId));
  const teacherName = teacher ? teacher.fullname : "";

  try {
    if (editId) {
      // UPDATE
      await axios.put(
        `${API_BASE}/api/class-teacher-assignment/edit/${editId}`,
        { standard, section, teacherId, teacherName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Assignment updated successfully.");
      setEditId(null);
    } else {
      // CREATE
      await axios.post(
        `${API_BASE}/api/class-teacher-assignment/assign`,
        { schoolCode, standard, section, teacherId, teacherName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Teacher assigned successfully.");
    }

    setStandard("");
    setSection("");
    setTeacherId("");
    fetchAssignments();
  } catch (err) {
    console.error("❌ Error on assignTeacher:", err);
    const errMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Error saving assignment";

    if (/duplicate/i.test(errMsg) || /exists/i.test(errMsg)) {
      alert(`Assignment for Standard ${standard} Section ${section} already exists (server).`);
    } else {
      alert(errMsg);
    }
  }
};


  // ----------------------------------------------------
  // EDIT BUTTON CLICK
  // ----------------------------------------------------
  const handleEdit = (assignment) => {
    setMessage(null);
    setEditId(assignment.id);
    setStandard(assignment.standard);
    setSection(assignment.section);
    setTeacherId(String(assignment.teacherId));
  };

  // ----------------------------------------------------
  // DELETE ASSIGNMENT
  // ----------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    setMessage(null);

    try {
      await axios.delete(
        `${API_BASE}/api/class-teacher-assignment/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Assignment deleted.");
      fetchAssignments();
    } catch (err) {
      console.error("❌ Delete error:", err);
      setMessage("Error deleting assignment");
    }
  };

  // ----------------------------------------------------
  // FILTER LIST
  // ----------------------------------------------------
  const filteredAssignments = assignments.filter((a) => {
    return (
      (!search || String(a.teacherName || "").toLowerCase().includes(search.toLowerCase())) &&
      (!standard || a.standard === standard)
    );
  });

  return (
    <div className="assign-container">
      <h2 className="assign-title">Class Teacher Assignment</h2>

      {message && <div className="ct-message">{message}</div>}

      {/* FORM */}
      <div className="assign-form">
        <div className="form-group">
          <label>Standard</label>
          <select value={standard} onChange={(e) => setStandard(e.target.value)}>
            <option value="">Select Standard</option>
            {["LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map((std) => (
              <option key={std} value={std}>{std}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Section</label>
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">Select Section</option>
            {["A","B","C","D","E"].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Teacher Name</label>
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.fullname}</option>
            ))}
          </select>
        </div>

        <button className="assign-btn" onClick={handleAssign}>
          {editId ? "Update" : "Assign"} Teacher
        </button>
      </div>

      {/* Filters */}
      <div className="assign-filters">
        <input type="text" placeholder="Search Teacher..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={standard} onChange={(e) => setStandard(e.target.value)}>
          <option value="">Filter by Standard</option>
          {["LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map((std) => (
            <option key={std} value={std}>{std}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <table className="assign-table">
        <thead>
          <tr>
            <th>Standard</th>
            <th>Section</th>
            <th>Teacher</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignments.length ? filteredAssignments.map((a) => (
            <tr key={a.id}>
              <td>{a.standard}</td>
              <td>{a.section}</td>
              <td>{a.teacherName}</td>
              <td>
                <button onClick={() => handleEdit(a)}>Edit</button>
                <button onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="4" style={{ textAlign: "center" }}>No assignments found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClassTeacherAssignment;
