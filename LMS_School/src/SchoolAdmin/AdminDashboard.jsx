import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import axios from "axios";
import {
  LayoutGrid,
  LogOut,
  CheckCircle,
  Clock,
  Landmark,
  Bell,
  ClipboardList,
  CalendarDays,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("schoolToken");
  const schoolCode = localStorage.getItem("schoolCode");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
    }
  }, [token, navigate]);

  /* ================= FETCH STUDENTS (SAME AS StudentManagement) ================= */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            schoolCode: schoolCode,
          },
        });

        setStudents(res.data.data || []);
      } catch (err) {
        console.error("Fetch students error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && schoolCode) {
      fetchStudents();
    }
  }, [token, schoolCode]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/sign-in");
  };

  return (
    <div className="dashboard-container">
      {/* ================= HEADER ================= */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="icon-circle">
            <LayoutGrid size={26} />
          </div>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, admin!</p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* ================= QUICK OVERVIEW ================= */}
      <h2 className="section-title">Quick Overview</h2>

      <div className="cards-grid">
        <Link to="/school-dashboard/student" className="card-link">
          <StatCard
            title="Total Students"
            value={loading ? "..." : students.length}
            type="blue"
          />
        </Link>

        <StatCard title="Active Classes" value="12" type="green" />
        <StatCard title="Pending Tasks" value="8" type="orange" />
        <StatCard title="Notifications" value="23" type="pink" />
      </div>

      {/* ================= MANAGEMENT SECTIONS ================= */}
      <h2 className="section-title">Management Sections</h2>

      <div className="management-grid">
        <Link to="/school-dashboard/attendance" style={{ textDecoration: "none" }}>
          <ManageCard
            icon={<CheckCircle size={26} />}
            title="Mark Attendance"
            desc="Track and manage student attendance"
            count={students.length}
            color="green"
          />
        </Link>

        <Link to="/school-dashboard/timetable" style={{ textDecoration: "none" }}>
          <ManageCard
            icon={<Clock size={26} />}
            title="Time Table"
            desc="View and manage class schedules"
            count="12"
            color="blue"
          />
        </Link>

        <Link to="/school-dashboard/fees" style={{ textDecoration: "none" }}>
          <ManageCard
            icon={<Landmark size={26} />}
            title="Ledgers"
            desc="Financial records and transactions"
            count="8"
            color="orange"
          />
        </Link>

        <Link to="/school-dashboard/notifications" style={{ textDecoration: "none" }}>
          <ManageCard
            icon={<Bell size={26} />}
            title="Notifications & Announcements"
            desc="Manage system notifications and announcements"
            count="23"
            color="red"
          />
        </Link>

        <Link to="/school-dashboard/assignments" style={{ textDecoration: "none" }}>
          <ManageCard
            icon={<ClipboardList size={26} />}
            title="Assignments"
            desc="Create and manage student assignments"
            count="15"
            color="gray"
          />
        </Link>

        <Link to="/school-dashboard/class-schedule" style={{ textDecoration: "none" }}>
          <ManageCard
            icon={<CalendarDays size={26} />}
            title="Class Schedule"
            desc="Organize and view class timings"
            count="6"
            color="blue"
          />
        </Link>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, type }) {
  return (
    <div className={`card card-${type}`}>
      <p className="card-title">{title}</p>
      <h3 className="card-value">{value}</h3>
    </div>
  );
}

function ManageCard({ icon, title, desc, count, color }) {
  return (
    <div className="manage-card">
      <div className={`manage-icon bg-${color}`}>{icon}</div>
      <span className={`manage-count count-${color}`}>{count}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <button className={`manage-btn btn-${color}`}>Manage</button>
    </div>
  );
}
