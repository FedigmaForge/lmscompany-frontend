import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TeacherStudents.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);

  const token = localStorage.getItem("teacherToken");
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));

  useEffect(() => {
    if (!teacherData) return;
    fetchAssignedClass();
  }, []);

  // ----------------------------------------------------
  // Step 1: Fetch the teacher's assigned class
  // ----------------------------------------------------
  const fetchAssignedClass = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/api/class-teacher-assignment`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          schoolCode: teacherData.schoolCode,
          teacherName: teacherData.fullname,
        },
      });

      if (res.data.data.length === 0) {
        setAssignment(null);
        setStudents([]);
        setLoading(false);
        return;
      }

      const assign = res.data.data[0];
      setAssignment(assign);

      // Step 2: Fetch students of assigned class
      fetchStudents(assign.standard, assign.section);
    } catch (err) {
      console.error("❌ Error fetching assigned class:", err);
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Step 2: Fetch students of the class
  // ----------------------------------------------------
  const fetchStudents = async (standard, section) => {
    try {
      console.log("📘 Fetching Students ->", standard, section);

      const res = await axios.get(
        `${API_BASE}/api/class-teacher-assignment/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            schoolCode: teacherData.schoolCode,
            standard,
            section,
          },
        }
      );

      setStudents(res.data.students || []);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="ts-container">
      <h2 className="ts-title">My Class Students</h2>

      {loading && <p className="ts-loading">Loading...</p>}

      {!loading && !assignment && (
        <p className="ts-noassign">You are not assigned to any class.</p>
      )}

      {!loading && assignment && (
        <div className="ts-info-box">
          <p>
            <strong>Standard:</strong> {assignment.standard}
          </p>
          <p>
            <strong>Section:</strong> {assignment.section}
          </p>
        </div>
      )}

      <div className="ts-list">
        {students.map((stu) => (
          <div className="ts-card" key={stu.studentId}>
            <img
              src={stu.photo ? `${API_BASE}${stu.photo}` : "/default-student.png"}
              alt="student"
              className="ts-photo"
            />
            <div className="ts-details">
              <h4>{stu.fullname}</h4>
              <p><strong>Admission ID:</strong> {stu.admissionId}</p>
              <p><strong>Parent Contact:</strong> {stu.parentContact}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && assignment && students.length === 0 && (
        <p className="ts-no-students">No students found for this class.</p>
      )}
    </div>
  );
}
