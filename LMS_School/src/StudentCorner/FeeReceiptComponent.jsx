// src/StudentCorner/FeeReceiptComponent.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./FeeReceiptComponent.css";
import logo from "../images/schoollogo.png";
import Signature from "../images/signature.png";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function FeeReceiptComponent() {
  const [profile, setProfile] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // 1 Fetch Student Profile
  // -----------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) return setError("Not authorized");

        const res = await axios.get(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setProfile(res.data.data);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Profile Fetch Error", err);
        setError("Error fetching profile");
      }
    };

    fetchProfile();
  }, []);

  // -----------------------------
  // 2 Fetch Fees after profile loads
  // -----------------------------
  useEffect(() => {
    if (!profile) return;

    const fetchFees = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE}/api/fee/pending-fees/${profile.id}`
        );

        if (res.data.success) {
          setFees(res.data.data || []);
        } else {
          setError("Failed to fetch fees");
        }
      } catch (err) {
        console.error("Fetch fees error:", err);
        setError("Failed to load fees");
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [profile]);

  // -----------------------------
  // Only PAID fees for receipt
  // -----------------------------
  const paidFees = fees;   // show all fees

  // -----------------------------
  // 3 Generate PDF
  // -----------------------------
  const downloadPDF = (payment) => {
    const doc = new jsPDF("p", "mm", "a4");

    // --------------------------------
    // Build fee structure for PDF
    // --------------------------------
    const FEE_HEADS = [
      "Tuition Fee",
      "Transport",
      "Generator/Electricity",
      "Books & Stationary",
      "Examination Fee",
      "Library Fee",
      "Computer Lab Fee",
      "Games & Sports Fee",
      "Miscellaneous Charge",
      "Fine",
      "Others",
    ];

    const feeData = {};
    FEE_HEADS.forEach((h) => {
      feeData[h] = { amount: 0, note: "" };
    });

    // Assign clicked payment into its fee head
    feeData[payment.feeHead] = {
      amount: Number(payment.amount),
      note: payment.note || "",
    };

    // --------------------------------
    // PDF Layout
    // --------------------------------

    doc.rect(5, 5, 200, 287);

    doc.addImage(logo, "PNG", 10, 8, 25, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("DOON INTERNATIONAL SCHOOL", 105, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "ALINAGAR (NEAR THANA), DARBHANGA - 847405",
      105,
      25,
      { align: "center" }
    );

    doc.line(10, 38, 200, 38);

    // School info
    doc.rect(10, 38, 190, 12);
    doc.text(`SchoolCode: ${profile.schoolCode || "---"}`, 15, 46);
    doc.text(
      `Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}`,
      195,
      46,
      { align: "right" }
    );

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FEE RECEIPT", 105, 60, { align: "center" });

    // Student info
    doc.rect(10, 65, 190, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Receipt No: ${payment.paymentId}`, 15, 75);
    doc.text(`Name: ${profile.firstName} ${profile.lastName || ""}`, 15, 83);
    doc.text(`Class: ${profile.studentClass || "-"}`, 15, 91);

    doc.text(`Roll No: ${profile.rollNumber || "-"}`, 195, 75, { align: "right" });
    doc.text(`Sec: ${profile.section || "-"}`, 195, 83, { align: "right" });
    doc.text(`Student ID: ${profile.id}`, 195, 91, { align: "right" });

    // --------------------------------
    // Table Header
    // --------------------------------
    let y = 105;
    doc.setFont("helvetica", "bold");
    doc.rect(10, y, 190, 10);
    doc.text("Particulars", 15, y + 7);
    doc.text("Amount", 195, y + 7, { align: "right" });

    // --------------------------------
    // Table Rows (ALL FEE HEADS)
    // --------------------------------
    let startY = y + 10;
    let total = 0;

    doc.setFont("helvetica", "normal");

    FEE_HEADS.forEach((head) => {
      const amount = Number(feeData[head]?.amount || 0);
      const note = feeData[head]?.note || "";

      doc.rect(10, startY, 190, 10);
      doc.line(150, startY, 150, startY + 10);

      doc.text(head, 15, startY + 7);
      doc.text(note, 115, startY + 7);

      if (amount > 0) {
        doc.text(amount.toFixed(2), 195, startY + 7, {
          align: "right",
        });
        total += amount;
      }

      startY += 10;
    });

    // --------------------------------
    // Total
    // --------------------------------
   // TOTAL
  doc.setFont("helvetica", "bold");
  doc.rect(10, startY, 190, 12);
  doc.text(`TOTAL: ${total.toFixed(2)}`, 195, startY + 8, {
    align: "right",
  });

    // --------------------------------
    // Footer
    // --------------------------------
    startY += 25;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.text(
      "Note: Tuition fee and other charges are accepted from 1st to 10th of each month.",
      10,
      startY
    );

    startY += 10;
    doc.text("A/C No: 310511010000018", 10, startY);
    startY += 6;
    doc.text("IFSC Code: UBIN0831051", 10, startY);

    doc.addImage(Signature, "PNG", 165, startY, 50, 20, undefined, "NONE", 30); // rotate 15 degrees
    doc.text("Recipient Signature", 195, startY + 10, {
      align: "right",
    });

    window.open(doc.output("bloburl"), "_blank");
  };


  // -----------------------------
  // UI States
  // -----------------------------
  if (loading) return <div className="fee-loading">Loading receipt...</div>;

  if (error) return <p className="fee-error">{error}</p>;

  if (!paidFees.length)
    return <p className="fee-error">No payment history found.</p>;

  return (
    <div className="fee-container">
      <h2>Fee Payment History</h2>

      {/* Student Info */}
      <div className="student-info-box">
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>Student ID:</strong> {profile.id}</p>
        <p><strong>School Code:</strong> {profile.schoolCode}</p>
      </div>

      {/* Payment Table */}
      <div className="table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Fee Head</th>
              <th>Amount</th>
              <th>status</th>
              <th>Payment Date</th>
              <th>Receipt</th>

            </tr>
          </thead>

          <tbody>
            {paidFees.map((f) => (
              <tr
                key={f.itemId}
                style={{
                  backgroundColor: f.status === "PENDING" ? "#fff3cd" : "transparent",
                }}
              >
                <td>{f.paymentId}</td>
                <td>{f.feeHead}</td>
                <td>₹{f.amount}</td>
                <td>
                  <span
                    style={{
                      color: f.status === "PENDING" ? "orange" : "green",
                      fontWeight: "bold",
                    }}
                  >
                    {f.status}
                  </span>
                </td>
                <td>
                  {f.paymentDate
                    ? new Date(f.paymentDate).toLocaleDateString()
                    : "-"}
                </td>

                <td>
                  {f.status === "PAID" ? (
                    <button
                      className="view-btn"
                      onClick={() => downloadPDF(f)}
                    >
                      View
                    </button>
                  ) : (
                    <span style={{ color: "#999" }}>Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
