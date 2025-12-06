import React, { useState } from "react";
import axios from "axios";
import "./SchoolAdmin.css";

const Attendance = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("Present");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const schoolCode = localStorage.getItem("schoolCode");
      await axios.post("http://localhost:4000/api/attendance", {
        employeeId,
        status,
        schoolCode,
      });
      alert("Attendance submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit attendance.");
    }
  };

  return (
    <div className="form-container">
      <h2>Mark Attendance</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Attendance;
