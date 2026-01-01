import React from "react";
import "./AdminDashboard.css";
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

export default function AdminDashboard() {
  return (
    <div className="dashboard-container">
      {/* Header */}
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
        <button className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Quick Overview */}
      <h2 className="section-title">Quick Overview</h2>

      <div className="cards-grid">
        <StatCard title="Total Students" value="245" type="blue" />
        <StatCard title="Active Classes" value="12" type="green" />
        <StatCard title="Pending Tasks" value="8" type="orange" />
        <StatCard title="Notifications" value="23" type="pink" />
      </div>

      {/* Management Sections */}
      <h2 className="section-title">Management Sections</h2>

      <div className="management-grid">
        <ManageCard
          icon={<CheckCircle size={26} />}
          title="Mark Attendance"
          desc="Track and manage student attendance"
          count="45"
          color="green"
        />
        <ManageCard
          icon={<Clock size={26} />}
          title="Time Table"
          desc="View and manage class schedules"
          count="12"
          color="blue"
        />
        <ManageCard
          icon={<Landmark size={26} />}
          title="Ledgers"
          desc="Financial records and transactions"
          count="8"
          color="orange"
        />
        <ManageCard
          icon={<Bell size={26} />}
          title="Notifications & Announcements"
          desc="Manage system notifications and announcements"
          count="23"
          color="red"
        />
        <ManageCard
          icon={<ClipboardList size={26} />}
          title="Assignments"
          desc="Create and manage student assignments"
          count="15"
          color="gray"
        />
        <ManageCard
          icon={<CalendarDays size={26} />}
          title="Class Schedule"
          desc="Organize and view class timings"
          count="6"
          color="blue"
        />
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

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
