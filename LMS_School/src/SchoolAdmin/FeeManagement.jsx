import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FeeManagement.css";
const API_BASE = "http://15.207.54.139:4000";
const FeeManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [selected, setSelected] = useState(null);
  const [totalFee, setTotalFee] = useState(0);
  const [paidFee, setPaidFee] = useState(0);
  const [payNow, setPayNow] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payingDate] = useState(new Date().toISOString().split("T")[0]);
  const [feeHistory, setFeeHistory] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const schoolCode = localStorage.getItem("schoolCode");
  // -----------------------------------------
  // FETCH STUDENTS
  // -----------------------------------------
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/students?school_code=${schoolCode}`
      );
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      setStudents(list);
      setResults(list);
    } catch (err) {
      console.error("Fetch Students Error:", err);
      setStudents([]);
      setResults([]);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);
  // -----------------------------------------
  // SEARCH STUDENTS
  // -----------------------------------------
  const searchNow = async () => {
    if (!searchQuery.trim()) return setResults(students);

    try {
      const res = await axios.get(
        `${API_BASE}/api/students/search?query=${searchQuery}&schoolCode=${schoolCode}`
      );

      setResults(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Search Error:", err);
      setResults([]);
    }
  };

  // -----------------------------------------
  // OPEN ADD FEE FORM
  // -----------------------------------------
  const openFeeModal = async (stu) => {
    setSelected(stu);
    setPayNow("");

    try {
      console.log("Fetching summary for:", stu.admissionId);

      const res = await axios.get(
        `${API_BASE}/api/fee/summary/${stu.admissionId}/${schoolCode}`
      );

      const summary = res.data.summary || {};

      // Set Total Fee & Paid Fee
      setTotalFee(summary.totalFeeAmount ?? 0);
      setPaidFee(summary.totalPaid ?? 0);

      // ---------------------------------------
      // SET DUE DATE (FROM DATABASE)
      // ---------------------------------------
      if (summary.lastDueDate) {
        console.log("📌 Last Due Date Found:", summary.lastDueDate);

        // Convert date to yyyy-mm-dd format
        const formatted = new Date(summary.lastDueDate)
          .toISOString()
          .split("T")[0];

        setDueDate(formatted);
      } else {
        console.log("⚠ No previous due date");
        setDueDate(""); // keep empty
      }

    } catch (err) {
      console.error("Summary Error:", err);
      setTotalFee(0);
      setPaidFee(0);
      setDueDate("");
    }

    setShowFeeModal(true);
  };


  // -----------------------------------------
  // LOAD HISTORY
  // -----------------------------------------
  const openHistoryModal = async (stu) => {
    setSelected(stu);

    try {
      const res = await axios.get(
        `${API_BASE}/api/fee/history/${stu.admissionId}/${schoolCode}`
      );

      setFeeHistory(res.data.payments || []);
    } catch (err) {
      console.error("History Error:", err);
      setFeeHistory([]);
    }

    setShowHistoryModal(true);
  };

  // -----------------------------------------
  // SUBMIT PAYMENT
  // -----------------------------------------
  const submitFee = async () => {
    if (!totalFee || payNow === "" || !dueDate) {
      alert("All fields are required");
      return;
    }

    const total = Number(totalFee);
    const paid = Number(paidFee);
    const now = Number(payNow);

    const remaining = total - (paid + now);

    if (remaining < 0) {
      alert("Paying exceeds remaining amount");
      return;
    }

    try {
      // Step 1 → ensure fee master exists
      await axios.post(`${API_BASE}/api/fee/master/create`, {
        admissionId: selected.admissionId,
        studentId: selected.id,
        totalFeeAmount: total,
        schoolCode,
        remarks,  // ✅ ADD HERE
      });

      // Step 2 → add payment
      const res = await axios.post(`${API_BASE}/api/fee/pay`, {
        admissionId: selected.admissionId,
        studentId: selected.id,
        schoolCode,
        payingNow: now,
        dueDate,
        remarks,  // ✅ ALSO INCLUDED HERE
      });

      if (res.data.success) {
        alert("Fee payment added successfully");
        setShowFeeModal(false);
        fetchStudents(); // refresh list
      }
    } catch (err) {
      console.error("Submit Fee Error:", err);
      alert("Failed to submit fee");
    }
  };


  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <section className="fee-container">
      <h2>Fee Management</h2>

      {/* SEARCH BOX */}
      <div className="fee-search-box">
        <input
          type="text"
          placeholder="Search by Name / Phone / Admission ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchNow}>Search</button>
      </div>

      {/* STUDENT TABLE */}
      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Admission ID</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Add Fee</th>
              <th>History</th>
            </tr>
          </thead>

          <tbody>
            {results.map((s) => (
              <tr key={s.id}>
                <td>
                  <img
                    src={`${API_BASE}${s.photo}`}
                    className="student-photo"
                    alt=""
                  />
                </td>
                <td>{s.fullname}</td>
                <td>{s.admissionId}</td>
                <td>{s.contactNumber}</td>
                <td>{s.email}</td>

                <td>
                  <button onClick={() => openFeeModal(s)}>Add Fee</button>
                </td>

                <td>
                  <button onClick={() => openHistoryModal(s)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ADD FEE MODAL */}
      {showFeeModal && selected && (
        <div className="fee-modal">
          <div className="fee-modal-content">
            <h3>Add Fee – {selected.fullname}</h3>
            <div className="fee-student-info">
              <img
                src={`${API_BASE}${selected.photo}`}
                className="student-photo-large"
              />
              <div>
                <p><strong>Name:</strong> {selected.fullname}</p>
                <p><strong>Admission ID:</strong> {selected.admissionId}</p>
                <p><strong>Phone:</strong> {selected.contactNumber}</p>
                <p><strong>Email:</strong> {selected.email}</p>
              </div>
            </div>
            {/* ---------------------- FORM ---------------------- */}
            <div className="fee-form-grid">

              <div className="form-group">
                <label>Total Fee</label>
                <input
                  type="number"
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  onBlur={() => {
                    if (totalFee && totalFee.length > 0) setIsLocked(true);
                  }}
                  disabled={isLocked}
                />

              </div>

              <div className="form-group">
                <label>Paid Fee</label>
                <input type="number" value={paidFee} readOnly />
              </div>

              <div className="form-group">
                <label>Paying Now</label>
                <input
                  type="number"
                  placeholder="Paying Now"
                  value={payNow}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const remaining = totalFee - paidFee;
                    if (val > remaining) {
                      alert(`Max payable is ₹${remaining}`);
                      return;
                    }
                    setPayNow(val);
                  }}
                />
              </div>


              <div className="form-group">
                <label>Pending Amount</label>
                <input
                  type="number"
                  value={Math.max(totalFee - paidFee - payNow, 0)}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Paying Date</label>
                <input type="date" value={payingDate} readOnly />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <select
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                >
                  <option value="">Select Remarks</option>
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="School Fee">School Fee</option>
                  <option value="Transport">Transport</option>
                  <option value="Generator/Electricity">Generator/Electricity</option>
                  <option value="Books & Stationary">Books & Stationary</option>
                  <option value="Examination Fee">Examination Fee</option>
                  <option value="Library Fee">Library Fee</option>
                  <option value="Computer Lab Fee">Computer Lab Fee</option>
                  <option value="Games & Sports Fee">Games & Sports Fee</option>
                  <option value="Miscellaneous Charges">Miscellaneous Charges</option>
                  <option value="Fine">Fine</option>
                  <option value="Others">Others</option>
                </select>
              </div>


            </div>
            <div className="fee-modal-buttons">
              <button onClick={submitFee}>Submit</button>
              <button onClick={() => setShowFeeModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}


      {/* HISTORY MODAL */}
      {showHistoryModal && selected && (
        <div className="fee-modal">
          <div className="fee-modal-content">
            <h3>Fee History – {selected.fullname}</h3>

            <table className="history-table">
              <thead>
                <tr>
                  <th>Paid</th>
                  <th>Payment Date</th>
                  <th>Due Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.map((f) => (
                  <tr key={f.paymentId}>
                    <td>₹{f.payingNow}</td>
                    <td>{f.paymentDate}</td>
                    <td>{f.dueDate}</td>
                    <td>{f.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fee-modal-buttons">
              <button onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeeManagement;
