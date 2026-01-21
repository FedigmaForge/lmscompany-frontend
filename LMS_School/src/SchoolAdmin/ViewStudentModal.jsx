import React from "react";
import { X } from "lucide-react";
import "./ViewStudentModal.css";

const ViewStudentModal = ({ student, onClose }) => {
  if (!student) return null;

  const fullName = `${student.firstName} ${student.lastName || ""}`;

  return (
    <div className="modal-backdrop">
      <div className="modal-box large">
        <div className="modal-header">
          <h2>Student Details</h2>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>

        <div className="view-grid">

          {/* ===== BASIC INFO ===== */}
          <h4>Basic Information</h4>
          <p><b>Name:</b> {fullName}</p>
          <p><b>Father:</b> {student.fatherName}</p>
          <p><b>Mother:</b> {student.motherName}</p>
          <p><b>DOB:</b> {student.dateOfBirth}</p>
          <p><b>Gender:</b> {student.gender}</p>
          <p><b>Blood Group:</b> {student.bloodGroup}</p>
          <p><b>Nationality:</b> {student.nationality}</p>
          <p><b>Category:</b> {student.category}</p>
          <p><b>Religion:</b> {student.religion}</p>

          {/* ===== CONTACT ===== */}
          <h4>Contact Details</h4>
          <p><b>Phone:</b> {student.phone}</p>
          <p><b>Email:</b> {student.email}</p>
          <p><b>Address:</b> {student.address}, {student.city}, {student.state} - {student.pinCode}</p>

          {/* ===== GUARDIAN ===== */}
          <h4>Guardian Details</h4>
          <p><b>Name:</b> {student.guardianName}</p>
          <p><b>Phone:</b> {student.guardianPhone}</p>
          <p><b>Relation:</b> {student.relation}</p>
          <p><b>Emergency:</b> {student.emergencyContact}</p>

          {/* ===== ACADEMIC ===== */}
          <h4>Academic Info</h4>
          <p><b>Class:</b> {student.studentClass}</p>
          <p><b>Section:</b> {student.section}</p>
          <p><b>Roll No:</b> {student.rollNumber}</p>
          <p><b>Session:</b> {student.academicSession}</p>
          <p><b>Fee Category:</b> {student.feeCategory}</p>
          <p><b>Discount:</b> {student.feeDiscount}%</p>
          <p><b>Previous Class:</b> {student.previousClass}</p>
          <p><b>Previous School:</b> {student.previousSchool}</p>

          {/* ===== MEDICAL ===== */}
          <h4>Medical</h4>
          <p><b>Conditions:</b> {student.medicalConditions}</p>
          <p><b>Allergies:</b> {student.allergies}</p>
          <p><b>Special Needs:</b> {student.specialNeeds}</p>

          {/* ===== DOCUMENTS ===== */}
          <h4>Documents</h4>
          <ul>
            {(student.documents || []).map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>

          {/* ===== OPTIONAL ===== */}
          <h4>Optional Services</h4>
          <ul>
            {(student.optionalServices || []).map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal;
