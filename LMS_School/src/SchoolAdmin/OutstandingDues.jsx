import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./OutstandingDues.css";
import { useNavigate } from "react-router-dom";

const OutstandingDues = () => {
  const { state } = useLocation();
  const student = state?.student;
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFees, setSelectedFees] = useState([]);

  // Fetch all fees (PAID + PENDING)
  const fetchFees = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/fee/pending-fees/${student.id}`);
      setFees(res.data.data || []);
    } catch (err) {
      console.error("Fetch fees error:", err);
      alert("Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.id) fetchFees();
  }, [student]);

  const toggleFeeSelection = (fee) => {
    if (fee.status !== "PENDING") return; // Only allow pending
    setSelectedFees((prev) => {
      const exists = prev.find((f) => f.itemId === fee.itemId);
      if (exists) return prev.filter((f) => f.itemId !== fee.itemId);
      return [...prev, fee];
    });
  };

  const totalPending = useMemo(() => {
    return fees
      .filter(f => f.status === "PENDING")
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  }, [fees]);

  const selectedTotal = useMemo(() => {
    return selectedFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  }, [selectedFees]);

  const nearestDueDate = useMemo(() => {
    const pendingDates = fees
      .filter(f => f.status === "PENDING" && f.dueDate)
      .map(f => new Date(f.dueDate))
      .filter(d => !isNaN(d));
    if (pendingDates.length === 0) return null;
    return new Date(Math.min(...pendingDates));
  }, [fees]);

  const paySelectedFees = async () => {
    if (selectedFees.length === 0) {
      alert("Please select at least one fee to pay");
      return;
    }

    const feeMasterId = selectedFees[0]?.feeMasterId;
    if (!feeMasterId) {
      console.error("Missing feeMasterId!", selectedFees);
      return alert("Error: Fee master ID not found for selected items");
    }

    const payload = {
      studentId: student.id,
      feeMasterId,
      selectedItems: selectedFees.map(f => ({
        itemId: f.itemId,
        feeHead: f.feeHead,
        amount: f.amount
      }))
    };

    console.log("===== PAY PENDING FEES START =====");
    console.log("Outgoing payload:", payload);

    try {
      const res = await axios.post(`${API_URL}/api/fee/pay-pending`, payload);
      console.log("✅ Payment response:", res.data);
      alert("✅ Payment successful");
      setSelectedFees([]);
      await fetchFees();
    } catch (err) {
      console.error("❌ Payment failed:", err.response?.data || err);
      alert("❌ Payment failed");
    }

    console.log("===== PAY PENDING FEES END =====");
  };

  if (!student) return <p>Student not found</p>;
  if (loading) return <p>Loading fees...</p>;

  return (
    <div className="dues-container">
      <div className="dues-card">
        <div className="dues-header">
          <h2>Outstanding Dues</h2>
        </div>

        {/* Student Info */}
        <div className="student-info">
          <div className="info-box"><b>Name:</b> {student.firstName} {student.lastName}</div>
          <div className="info-box"><b>Roll:</b> {student.rollNumber}</div>
          <div className="info-box"><b>Class:</b> {student.studentClass} - {student.section}</div>
        </div>

        {fees.length > 0 ? (
          <>
            {/* Summary */}
            <div className="summary-box">
              <div className="summary-card amount">
                <h3>₹ {totalPending}</h3>
                <p>Total Pending</p>
              </div>
              <div className="summary-card date">
                <h3>{nearestDueDate ? nearestDueDate.toLocaleDateString() : "-"}</h3>
                <p>Nearest Due Date</p>
              </div>
              <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
                <button
                  className="pay-now-btn"
                  disabled={selectedFees.length === 0}
                  onClick={paySelectedFees}
                >
                  💳 Pay Selected ({selectedFees.length})
                </button>
                <div style={{ fontWeight: 600 }}>Selected Amount: ₹ {selectedTotal}</div>
              </div>
            </div>

            {/* Table */}
            <table className="dues-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Fee Master ID</th>
                  <th>Fee Head</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(f => {
                  const isOverdue = f.dueDate && new Date(f.dueDate) < new Date();
                  const isPending = f.status === "PENDING";
                  return (
                    <tr key={f.itemId} className={isOverdue ? "overdue" : ""}>
                      <td>
                        {isPending ? (
                          <input
                            type="checkbox"
                            checked={selectedFees.some(s => s.itemId === f.itemId)}
                            onChange={() => toggleFeeSelection(f)}
                          />
                        ) : (
                          "✔"
                        )}
                      </td>
                      <td>{f.feeMasterId}</td>
                      <td>{f.feeHead}</td>
                      <td>₹ {f.amount}</td>
                      <td>{f.note || "-"}</td>
                      <td>
                        <span className={`status-badge ${f.status?.toLowerCase()}`}>
                          {f.status}
                        </span>
                      </td>
                      <td>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <div className="no-dues">🎉 No fees found</div>
        )}
      </div>
    </div>
  );
};

export default OutstandingDues;
