import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import "./TeacherAttendance.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function TeacherAttendance() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const schoolCode = localStorage.getItem("schoolCode");
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const personId = teacherData?.employeeid;

  useEffect(() => {
    if (schoolCode && personId) {
      fetchSummary();
    }
  }, [schoolCode, personId]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `http://13.234.75.130:4000/api/attendance/summary/${schoolCode}/${personId}`
      );

      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (error) {
      console.log("Summary error:", error);
    } finally {
      setLoading(false);
    }
  };

  const labels = summary.map((item) => item.status);
  const values = summary.map((item) => item.count);

  // Calculate total count
  const totalCount = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,99,132,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(153,102,255,0.6)",
        ],
      },
    ],
  };

  return (
    <div className="attendance-container">
      <div className="attendance-card">

        {/* HEADER + BUTTON */}
        <div className="header-row">
          <h2 className="attendance-title">Attendance Summary</h2>

          {/* 👉 NEW BUTTON TO TAKE STUDENT ATTENDANCE */}
          <button
            className="student-attendance-btn"
            onClick={() => navigate("/teacher/student-attendance")}
          >
            Take Student Attendance
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : summary.length === 0 ? (
          <p className="no-data">No attendance records found</p>
        ) : (
          <>
            <div className="pie-wrapper">
              <Pie data={data} />
            </div>

            <div className="status-list">
              {summary.map((item, index) => (
                <p key={index} className="status-item">
                  <strong>{item.status}:</strong> {item.count}
                </p>
              ))}
            </div>

            <h3 className="total-count">
              Total Attendance Records: <span>{totalCount}</span>
            </h3>
          </>
        )}
      </div>
    </div>
  );
}
