import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeeManagement.css";
import { useNavigate } from "react-router-dom";


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

const FeeManagement = () => {
  const schoolCode = localStorage.getItem("schoolCode");
 const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const [selected, setSelected] = useState(null);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [totalFee, setTotalFee] = useState(0);
  const [paidFee, setPaidFee] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [payingDate] = useState(new Date().toISOString().split("T")[0]);

  const [fees, setFees] = useState({});
  const [feeHistory, setFeeHistory] = useState([]);

  // -----------------------------------
  // FETCH STUDENTS
  // -----------------------------------
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/students?school_code=${schoolCode}`
      );
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setStudents(list);
      setResults(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // -----------------------------------
  // SEARCH
  // -----------------------------------
  const searchNow = async () => {
    if (!searchQuery.trim()) {
      setResults(students);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/api/students/search?query=${searchQuery}&schoolCode=${schoolCode}`
      );
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  // -----------------------------------
  // OPEN ADD FEE
  // -----------------------------------
  const openFeeModal = async (stu) => {
    setSelected(stu);
    setFees({});

    try {
      const res = await axios.get(
        `${API_URL}/api/fee/summary/${stu.admissionId}/${schoolCode}`
      );

      const summary = res.data.summary || {};
      setTotalFee(summary.totalFeeAmount ?? 0);
      setPaidFee(summary.totalPaid ?? 0);

      if (summary.lastDueDate) {
        setDueDate(
          new Date(summary.lastDueDate).toISOString().split("T")[0]
        );
      } else {
        setDueDate("");
      }
    } catch (err) {
      console.error(err);
    }

    setShowFeeModal(true);
  };
    // -----------------------------------
  //outstanding-dues
  // -----------------------------------
  const openOutstandingModal = (student) => {
  navigate("/school-dashboard/outstanding-dues", {
    state: { student },
  });
};

  // -----------------------------------
  // OPEN HISTORY
  // -----------------------------------
  const openHistoryModal = async (stu) => {
    setSelected(stu);
    try {
      const res = await axios.get(
        `${API_URL}/api/fee/history/${stu.admissionId}/${schoolCode}`
      );
      setFeeHistory(res.data.payments || []);
    } catch (err) {
      console.error(err);
      setFeeHistory([]);
    }
    setShowHistoryModal(true);
  };

  // -----------------------------------
  // FEE BREAKUP HANDLERS
  // -----------------------------------
  const toggleFee = (head) => {
    setFees((prev) => {
      const updated = { ...prev };
      if (updated[head]) delete updated[head];
      else updated[head] = { amount: "", note: "" };
      return updated;
    });
  };

  const updateFee = (head, field, value) => {
    setFees((prev) => ({
      ...prev,
      [head]: {
        ...prev[head],
        [field]: value,
      },
    }));
  };

  const totalPayingNow = Object.values(fees).reduce(
    (sum, f) => sum + Number(f.amount || 0),
    0
  );

  // -----------------------------------
  // SUBMIT PAYMENT
  // -----------------------------------
const submitFee = async () => {
  const requestPayload = {
    admissionId: selected.admissionId,
    studentId: selected.id,
    schoolCode,
    payingNow: totalPayingNow,
    dueDate,
    feeBreakup: fees, // receipt style
  };

  // ===============================
  // 🔍 BEFORE API CALL (DEVTOOLS)
  // ===============================
  console.group("💰 FEE PAYMENT SUBMIT");
  console.log("👨‍🎓 Student Selected:", selected);
  console.log("🏫 School Code:", schoolCode);
  console.log("📄 Admission ID:", selected.admissionId);
  console.log("🧾 Student ID:", selected.id);
  console.log("💵 Total Paying Now:", totalPayingNow);
  console.log("📆 Due Date:", dueDate);
  console.log("🧮 Fee Breakup Object:", fees);
  console.log("📦 Final Payload:", requestPayload);
  console.groupEnd();

  try {
    const res = await axios.post(
      `${API_URL}/api/fee/pay`,
      requestPayload
    );

    // ===============================
    //  AFTER SUCCESS
    // ===============================
    console.group(" FEE PAYMENT SUCCESS");
    console.log(" API Response:", res.data);
    console.groupEnd();

    alert("Fee payment added successfully");
    setShowFeeModal(false);
    fetchStudents();

  } catch (err) {
    // ===============================
    // ERROR HANDLING
    // ===============================
    console.group("❌ FEE PAYMENT FAILED");
    console.error("Error Message:", err.message);
    console.error("Error Response:", err.response?.data);
    console.error("Error Status:", err.response?.status);
    console.groupEnd();

    alert("Fee payment failed");
  }
};


  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <section className="fee-container">
      <h2>Fee Management</h2>

      <div className="fee-search-box">
        <input
          placeholder="Search by Name / Admission ID / Phone"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchNow}>Search</button>
      </div>

      <table className="students-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Admission ID</th>
            <th>Contact</th>
            <th>Add Fee</th>
            <th>Pending Fees</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {results.map((s) => (
            <tr key={s.id}>
              <td>
                <img
                  src={s.photo ? `${API_URL}${s.photo}` : "/user.png"}
                  className="student-photo"
                />
              </td>
              <td>{s.fullname}</td>
              <td>{s.admissionId}</td>
              <td>{s.contactNumber}</td>
              <td>
                <button onClick={() => openFeeModal(s)}>Add Fee</button>
              </td>
              <td>
               
                <button
                  className="dues-btn"
                  onClick={() => openOutstandingModal(s)}
                >
                  Outstanding Dues
                </button>
              </td>
              <td>
                <button onClick={() => openHistoryModal(s)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD FEE MODAL */}
      {showFeeModal && selected && (
        <div className="fee-modal">
          <div className="fee-modal-content">
            {/* STUDENT DETAILS */}
            <div className="student-info-box">
              <div>
                <strong>Name:</strong> {selected.fullname}
              </div>
              <div>
                <strong>Admission ID:</strong> {selected.admissionId}
              </div>
              <div>
                <strong>Contact:</strong> {selected.contactNumber}
              </div>
            </div>

            {/* FEE SUMMARY */}
            <div className="fee-summary-box">
              <div>
                <strong>Total Fee:</strong> ₹ {totalFee}
              </div>
              <div>
                <strong>Paid:</strong> ₹ {paidFee}
              </div>
              <div>
                <strong>Pending:</strong> ₹ {totalFee - paidFee}
              </div>
            </div>
            <h3>Add Fee – {selected.fullname}</h3>

            <table className="receipt-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Particulars</th>
                  <th>Note</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {FEE_HEADS.map((h) => (
                  <tr key={h}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!fees[h]}
                        onChange={() => toggleFee(h)}
                      />
                    </td>
                    <td>{h}</td>
                    <td>
                      <input
                        disabled={!fees[h]}
                        value={fees[h]?.note || ""}
                        onChange={(e) =>
                          updateFee(h, "note", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        disabled={!fees[h]}
                        value={fees[h]?.amount || ""}
                        onChange={(e) =>
                          updateFee(h, "amount", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>TOTAL</strong></td>
                  <td><strong>₹ {totalPayingNow}</strong></td>
                </tr>
              </tfoot>
            </table>

            <div className="form-row">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="fee-modal-buttons">
              <button onClick={submitFee}>Submit</button>
              <button onClick={() => setShowFeeModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fee-modal">
          <div className="fee-modal-content">

            <h3>Fee History</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Paid</th>
                  <th>Payment Date</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.map((f) => (
                  <tr key={f.paymentId}>
                    <td>₹ {f.payingNow}</td>
                    <td>{f.paymentDate}</td>
                    <td>{f.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowHistoryModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeeManagement;
