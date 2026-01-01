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

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const STATUS_LIST = ["Present", "Absent", "Leave", "Half-Day", "Holiday"];
const COLORS = ["#4CAF50", "#F44336", "#FFC107", "#2196F3", "#9C27B0"];

export default function StudentAttendanceSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL;
  const schoolCode = "9087124";
  const admissionId = "111";

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/attendance/summary/${schoolCode}/${admissionId}`
        );

        if (res.data.success) {
          const dataMap = {};
          res.data.data.forEach((d) => (dataMap[d.status] = d.count));

          const normalized = STATUS_LIST.map((status) => ({
            status,
            count: dataMap[status] || 0,
          }));

          setSummary(normalized);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching summary:", err);
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p>Loading attendance summary...</p>;
  if (!summary || summary.length === 0) return <p>No attendance records found.</p>;

  const total = summary.reduce((acc, s) => acc + s.count, 0);

  const data = {
    labels: summary.map((s) => s.status),
    datasets: [
      {
        label: "Attendance Count",
        data: summary.map((s) => s.count),
        backgroundColor: COLORS,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Attendance Summary",
      },
    },
  };

  return (
    <div style={{ maxWidth: 300, margin: "0 auto", textAlign: "center" }}>
      <Pie data={data} options={options} />
      <div style={{ marginTop: 20 }}>
        <h3>Total Attendance Records: {total}</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {summary.map((s, idx) => (
            <li key={idx} style={{ color: COLORS[idx], fontWeight: "bold", margin: "5px 0" }}>
              {s.status}: {s.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
