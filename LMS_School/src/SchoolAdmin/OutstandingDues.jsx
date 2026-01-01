import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OutstandingDues.css";
import { useLocation, useNavigate } from "react-router-dom";


const OutstandingDues = ({ onClose }) => {
    const schoolCode = localStorage.getItem("schoolCode");
    const { state } = useLocation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const student = state?.student;
    const [dues, setDues] = useState([]);
    const [paying, setPaying] = useState({});
    const [waiveFine, setWaiveFine] = useState({});
    const [approvedBy, setApprovedBy] = useState("");
    if (!student) {
        return (
            <div style={{ padding: 20 }}>
                <h3>No student selected</h3>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }
    const closePage = () => {
        navigate(-1);
    };
    // -----------------------------
    // FETCH OUTSTANDING MONTHS
    // -----------------------------
    const fetchOutstanding = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/fee/outstanding/${student.admissionId}/${schoolCode}`
            );
            setDues(res.data.dues || []);
        } catch (err) {
            console.error(err);
            setDues([]);
        }
    };

    useEffect(() => {
        fetchOutstanding();
    }, []);

    // -----------------------------
    // HANDLE PAYMENT INPUT
    // -----------------------------
    const updatePaying = (month, value) => {
        setPaying((prev) => ({
            ...prev,
            [month]: Number(value),
        }));
    };

    const toggleWaiveFine = (month) => {
        setWaiveFine((prev) => ({
            ...prev,
            [month]: !prev[month],
        }));
    };

    // -----------------------------
    // SUBMIT PAYMENT
    // -----------------------------
    const submitOutstandingPayment = async () => {
        const payload = dues
            .filter((d) => paying[d.month] > 0)
            .map((d) => ({
                month: d.month,
                payingNow: paying[d.month],
                fine:
                    waiveFine[d.month] ? 0 : Number(d.fine || 0),
                fineWaivedBy: waiveFine[d.month]
                    ? approvedBy
                    : null,
            }));

        if (!payload.length) {
            alert("Enter amount to pay");
            return;
        }

        if (Object.values(waiveFine).includes(true) && !approvedBy) {
            alert("Please enter approved by (Director/Admin)");
            return;
        }

        try {
            await axios.post(`${API_URL}/api/fee/outstanding/pay`, {
                admissionId: student.admissionId,
                studentId: student.id,
                schoolCode,
                payments: payload,
            });

            alert("Outstanding dues cleared successfully");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Payment failed");
        }
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="dues-modal">
            <div className="dues-modal-content">
                <span className="dues-close" onClick={closePage}>×</span>

                <button className="cancel" onClick={closePage}>
                    Close
                </button>

                <h3>Outstanding Dues</h3>

                {/* STUDENT INFO */}
                <div className="dues-student-box">
                    <div><strong>Name:</strong> {student.fullname}</div>
                    <div><strong>Admission ID:</strong> {student.admissionId}</div>
                    <div><strong>Contact:</strong> {student.contactNumber}</div>
                </div>

                {/* OUTSTANDING TABLE */}
                <table className="dues-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Fine</th>
                            <th>Due</th>
                            <th>Pay Now</th>
                            <th>Waive Fine</th>
                        </tr>
                    </thead>

                    <tbody>
                        {dues.map((d) => {
                            const effectiveFine = waiveFine[d.month]
                                ? 0
                                : Number(d.fine || 0);

                            return (
                                <tr key={d.month}>
                                    <td>{d.month}</td>
                                    <td>₹{d.totalAmount}</td>
                                    <td>₹{d.paidAmount}</td>
                                    <td>₹{effectiveFine}</td>
                                    <td>
                                        ₹{d.totalAmount - d.paidAmount + effectiveFine}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            onChange={(e) =>
                                                updatePaying(d.month, e.target.value)
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={!!waiveFine[d.month]}
                                            onChange={() => toggleWaiveFine(d.month)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* APPROVAL */}
                {Object.values(waiveFine).includes(true) && (
                    <div className="approval-box">
                        <label>Approved By</label>
                        <input
                            placeholder="Director / Admin"
                            value={approvedBy}
                            onChange={(e) => setApprovedBy(e.target.value)}
                        />
                    </div>
                )}

                {/* ACTIONS */}
                <div className="dues-actions">
                    <button onClick={submitOutstandingPayment}>
                        Submit Payment
                    </button>
                    <button className="cancel" onClick={closePage}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OutstandingDues;
