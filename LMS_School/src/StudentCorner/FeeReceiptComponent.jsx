// src/StudentCorner/FeeReceiptComponent.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./FeeReceiptComponent.css";
import logo from '../images/schoollogo.png'
import Signature from '../images/signature.png'

const API_BASE =
  import.meta.env.VITE_API_URL || "http://13.234.75.130:4000";

export default function FeeReceiptComponent() {
  const [profile, setProfile] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  // 1️⃣ Fetch Student Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) return setError("Not authorized");

        const res = await axios.get(`${API_BASE}/api/students/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setProfile(res.data.data);
        else setError("Failed to load profile");
      } catch (err) {
        console.error("Profile Fetch Error", err);
        setError("Error fetching profile");
      }
    };

    fetchProfile();
  }, []);

  // 2️⃣ Fetch Fee Receipt after profile loads
  useEffect(() => {
    if (!profile) return;

    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/api/fee/fee-receipt/${profile.admissionId}/${profile.schoolCode}`
        );

        if (res.data.success) setReceipt(res.data);
        else setError(res.data.error || "No payment history found");
      } catch (err) {
        console.error("Fee Receipt Error", err);
        setError("Error fetching fee receipt");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [profile]);

  // 3️⃣ Generate PDF with full boxes
  const downloadPDF = (payment, master, download = false) => {
    const doc = new jsPDF("p", "mm", "a4");

    // OUTER BORDER
doc.rect(5, 5, 200, 287);

// === HEADER ===
// LOGO
doc.addImage(logo, "PNG", 10, 8, 25, 25);

// SCHOOL NAME
doc.setFont("helvetica", "bold");
doc.setFontSize(20);
doc.text("DOON INTERNATIONAL SCHOOL", 105, 18, { align: "center" });

// ADDRESS
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.text(
  "ALINAGAR (NEAR THANA), DARBHANGA - 847405",
  105,
  25,
  { align: "center" }
);

// Horizontal Divider
doc.line(10, 38, 200, 38);

// === SCHOOL DETAILS BOX ===
doc.rect(10, 38, 190, 12);

doc.setFontSize(10);
doc.text(`SchoolCode: ${master.schoolCode || "---"}`, 15, 46);

const formattedDate = new Date(payment.createdAt).toLocaleString();
doc.text(`Date: ${formattedDate}`, 160, 46, { align: "right" });

// === FEE RECEIPT TITLE ===
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text("FEE RECEIPT", 105, 60, { align: "center" });

// === STUDENT DETAILS BOX ===
doc.rect(10, 65, 190, 30);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);

doc.text(`S.No: ${payment.paymentId}`, 15, 75);
doc.text(`Name: ${profile.fullname}`, 15, 83);
doc.text(`Class: ${profile.standard || "N/A"}`, 15, 91);

doc.text(`Roll No: ${profile.rollNo || "—"}`, 160, 75, { align: "right" });
doc.text(`Sec: ${profile.section || "—"}`, 160, 83, { align: "right" });
doc.text(`Admission ID: ${profile.admissionId}`, 160, 91, { align: "right" });

// === TABLE HEADER ===
let y = 105;
doc.setFont("helvetica", "bold");
doc.rect(10, y, 190, 10);
doc.text("Particulars", 15, y + 7);
doc.text("Amount", 195, y + 7, { align: "right" });
const rows = [
  ["Tuition Fee", payment.remarks === "Tuition Fee" ? payment.payingNow : ""],
  ["School Fee", payment.remarks === "School Fee" ? payment.payingNow : ""],
  ["Transport", payment.remarks === "Transport" ? payment.payingNow : ""],
  ["Generator/Electricity", payment.remarks === "Generator/Electricity" ? payment.payingNow : ""],
  ["Books & Stationary", payment.remarks === "Books & Stationary" ? payment.payingNow : ""],
  ["Examination Fee", payment.remarks === "Examination Fee" ? payment.payingNow : ""],
  ["Library Fee", payment.remarks === "Library Fee" ? payment.payingNow : ""],
  ["Computer Lab Fee", payment.remarks === "Computer Lab Fee" ? payment.payingNow : ""],
  ["Games & Sports Fee", payment.remarks === "Games & Sports Fee" ? payment.payingNow : ""],
  ["Miscellaneous Charges", payment.remarks === "Miscellaneous Charges" ? payment.payingNow : ""],
  ["Fine", payment.remarks === "Fine" ? payment.payingNow : ""],
  ["Others", payment.remarks === "Others" ? payment.payingNow : ""],
];




let rowHeight = 10;
let startY = y + 10;

doc.setFont("helvetica", "normal");

rows.forEach((row) => {
  doc.rect(10, startY, 190, rowHeight);
  doc.line(150, startY, 150, startY + rowHeight);

  doc.text(row[0], 15, startY + 7);

  doc.text(
    row[1] ? `${Number(row[1]).toFixed(2)}` : "",
    195,
    startY + 7,
    { align: "right" }
  );

  startY += rowHeight;
});

// === TOTAL BOX ===
// === TOTAL BOX ===
doc.setFont("helvetica", "bold");
doc.rect(10, startY, 190, 12);

// Calculate total properly from rows
const totalAmount = rows.reduce((sum, row) => {
  return sum + Number(row[1] || 0);
}, 0);

doc.text(
  `TOTAL: ${totalAmount.toFixed(2)}`,
  195,
  startY + 8,
  { align: "right" }
);


startY += 25;

// === FOOTER ===
doc.setFont("helvetica", "normal");
doc.setFontSize(9);

doc.text(
  "Note: Tuition fee and other charges are accepted from 1st to 10th of each month.",
  10,
  startY
);

startY += 10;
doc.text(`A/C No: 310511010000018`, 10, startY);

startY += 6;
doc.text(`IFSC Code: UBIN0831051`, 10, startY);
// === SIGNATURE IMAGE WITH ROTATION ===
doc.addImage(Signature, "PNG", 165, startY, 50, 20, undefined, "NONE", 30); // rotate 15 degrees

doc.text("Signature", 185, startY + 10, { align: "right" });


// OPEN PDF
const url = doc.output("bloburl");
window.open(url, "_blank");

  };

  // UI States
  if (loading)
    return <div className="fee-loading">Loading receipt...</div>;

  if (error) return <p className="fee-error">{error}</p>;

  if (!receipt || !receipt.payments?.length)
    return (
      <p className="fee-error">No payment history found.</p>
    );

  return (
    <div className="fee-container">
      <h2>Fee Payment History</h2>

      {/* Student Info */}
      <div className="student-info-box">
        <p><strong>Name:</strong> {profile.fullname}</p>
        <p><strong>Admission ID:</strong> {profile.admissionId}</p>
        <p><strong>School Code:</strong> {profile.schoolCode}</p>
        <p><strong>Total Fee:</strong> ₹{receipt.summary.totalFee}</p>
        <p><strong>Total Paid:</strong> ₹{receipt.summary.totalPaid}</p>
        <p><strong>Pending:</strong> ₹{receipt.summary.totalPending}</p>
      </div>

      {/* Payment Table */}
      <div className="table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Paid Amount</th>
              <th>Payment Date</th>
              <th>Due Date</th>
              <th>Remarks</th>
              <th>Receipt</th>
            </tr>
          </thead>

          <tbody>
            {receipt.payments.map((p) => (
              <tr key={p.paymentId}>
                <td>{p.paymentId}</td>
                <td>₹{p.payingNow}</td>
                <td>{p.createdAt}</td>
                <td>{p.dueDate}</td>
                <td>{p.remarks || "—"}</td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() => downloadPDF(p, receipt.feeMaster)}
                  >
                    View
                  </button>

                  <button
                    className="download-btn"
                    onClick={() =>
                      downloadPDF(p, receipt.feeMaster, true)
                    }
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
