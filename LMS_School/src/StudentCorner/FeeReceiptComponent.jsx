// src/StudentCorner/FeeReceiptComponent.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./FeeReceiptComponent.css";
import logo from '../images/schoollogo.png'
import Signature from '../images/signature.png'

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";
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

export default function FeeReceiptComponent() {
  const [profile, setProfile] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

   // -----------------------------
  // Parse remarks safely
  // -----------------------------
  const parseRemarks = (remarks) => {
    try {
      return remarks ? JSON.parse(remarks) : {};
    } catch {
      return {};
    }
  };
 
  // 1 Fetch Student Profile
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

  //  Fetch Fee Receipt after profile loads
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

  // 3 Generate PDF with full boxes
 const downloadPDF = (payment, master) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Parse fee breakup safely
  let feeData = {};
  try {
    feeData = payment.remarks ? JSON.parse(payment.remarks) : {};
  } catch {
    feeData = {};
  }

  // OUTER BORDER
  doc.rect(5, 5, 200, 287);

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

  doc.line(10, 38, 200, 38);

  // SCHOOL DETAILS
  doc.rect(10, 38, 190, 12);
  doc.text(`SchoolCode: ${master.schoolCode || "---"}`, 15, 46);
  doc.text(
    `Date: ${new Date(payment.createdAt).toLocaleDateString()}`,
    195,
    46,
    { align: "right" }
  );

  // TITLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FEE RECEIPT", 105, 60, { align: "center" });

  // STUDENT DETAILS
  doc.rect(10, 65, 190, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text(`S.No: ${payment.paymentId}`, 15, 75);
  doc.text(`Name: ${profile.fullname}`, 15, 83);
  doc.text(`Class: ${profile.standard || "N/A"}`, 15, 91);

  doc.text(`Roll No: ${profile.rollNo || "-"}`, 195, 75, { align: "right" });
  doc.text(`Sec: ${profile.section || "-"}`, 195, 83, { align: "right" });
  doc.text(`Admission ID: ${profile.admissionId}`, 195, 91, { align: "right" });

  // TABLE HEADER
  let y = 105;
  doc.setFont("helvetica", "bold");
  doc.rect(10, y, 190, 10);
  doc.text("Particulars", 15, y + 7);
  doc.text("Amount", 195, y + 7, { align: "right" });

  // TABLE ROWS (same as printed receipt)
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
      doc.text(amount.toFixed(2), 195, startY + 7, { align: "right" });
      total += amount;
    }
    startY += 10;
  });

  // TOTAL
  doc.setFont("helvetica", "bold");
  doc.rect(10, startY, 190, 12);
  doc.text(`TOTAL: ${total.toFixed(2)}`, 195, startY + 8, {
    align: "right",
  });

  // FOOTER
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
            {receipt.payments.map((p) => {
              const breakup = parseRemarks(p.remarks);
              return (
                <tr key={p.paymentId}>
                  <td>{p.paymentId}</td>
                  <td>₹{p.payingNow}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td>
                    {Object.keys(breakup).length ? (
                      <ul className="fee-breakup-list">
                        {Object.entries(breakup).map(([k, v]) => (
                          <li key={k}>
                            {k}: ₹{v.amount}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        downloadPDF(p, receipt.feeMaster)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
