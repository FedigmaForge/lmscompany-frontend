import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AddStudentModal.css";
import ImageCropper from "./ImageCropper";

const API = import.meta.env.VITE_API_URL;

const AddStudentModal = ({ onClose, editData }) => {
  const [step, setStep] = useState(1);
  const token = localStorage.getItem("schoolToken");
  const schoolCode = localStorage.getItem("schoolCode");

  const [rawImage, setRawImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // PERSONAL
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    nationality: "Indian",
    category: "",
    religion: "",

    // CONTACT
    phone: "",
    email: "",
    password: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    guardianName: "",
    guardianPhone: "",
    relation: "",
    emergencyContact: "",

    // ACADEMIC
    studentClass: "",
    section: "",
    rollNumber: "",
    academicSession: "2024-25",
    feeCategory: "General",
    feeDiscount: 0,
    previousClass: "",
    previousSchool: "",

    // MEDICAL
    medicalConditions: "",
    allergies: "",
    specialNeeds: "",

    // ARRAYS
    documents: [],
    optionalServices: [],

    confirmationAccepted: false,
  });
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

  /* ================= PREFILL FOR EDIT ================= */

 useEffect(() => {
  if (editData) {
    setFormData((prev) => ({
      ...prev,
      ...editData,

      //  Fix date format for input[type="date"]
      dateOfBirth: formatDateForInput(editData.dateOfBirth),

      documents: editData.documents || [],
      optionalServices: editData.optionalServices || [],
      confirmationAccepted: false,
    }));
    setStep(1);
  }
}, [editData]);


  /* ================= VALIDATION HELPERS ================= */
const isValidPin = (pin) => !pin || /^\d{6}$/.test(pin);
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);
  const isValidEmail = (email) =>
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = () => {
    if (step === 1)
      return (
        formData.firstName &&
        formData.fatherName &&
        formData.gender &&
        formData.dateOfBirth
      );

    if (step === 2)
     return (
    isValidPhone(formData.phone) &&
    isValidPhone(formData.guardianPhone) &&
    (!formData.emergencyContact ||
      isValidPhone(formData.emergencyContact)) &&
    isValidEmail(formData.email) &&
    isValidPin(formData.pinCode) &&
    formData.address &&
    formData.city
  );

    if (step === 3) return formData.studentClass && formData.section;

    return true;
  };

  /* ================= HANDLERS ================= */

  const PHONE_FIELDS = ["phone", "guardianPhone", "emergencyContact"];

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  // Allow only numbers for phone fields
  if (PHONE_FIELDS.includes(name)) {
    if (!/^\d*$/.test(value)) return; // block alphabets
    if (value.length > 10) return;   // limit to 10 digits
  }

  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};


  const handleArrayCheck = (name, value) => {
    setFormData((p) => ({
      ...p,
      [name]: p[name].includes(value)
        ? p[name].filter((v) => v !== value)
        : [...p[name], value],
    }));
  };

  const nextStep = () => {
    if (!validateStep()) {
      alert("Please fill all required fields correctly (*)");
      return;
    }
    setStep((p) => p + 1);
  };

  /* ================= IMAGE HELPER ================= */

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!formData.confirmationAccepted) {
      alert("Please confirm all details");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          fd.append(key, JSON.stringify(formData[key]));
        } else {
          fd.append(key, formData[key]);
        }
      });

      fd.append("schoolCode", schoolCode);

      if (croppedImage) {
        const imageFile = base64ToFile(
          croppedImage,
          `student_${Date.now()}.jpg`
        );
        fd.append("profilePhoto", imageFile);
      }

      let res;

      if (editData) {
        res = await axios.put(
          `${API}/api/students/update/${editData.id}`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await axios.post(`${API}/api/students/add`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (res.data.success) {
        alert(
          editData
            ? "Student Updated Successfully"
            : "Student Added Successfully"
        );
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REVIEW ROW ================= */

  const R = ({ l, v }) => (
    <p>
      <b>{l}:</b> {v || "-"}
    </p>
  );

  /* ================= UI ================= */

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{editData ? "Edit Student" : "Add Student"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        </div>

        {/* ================= STEPPER ================= */}
        <div className="stepper">
          {[
            "Personal Information",
            "Contact Details",
            "Academic Information",
            "Additional Details",
            "Review & Submit",
          ].map((label, index) => (
            <div
              key={index}
              className={`step ${step === index + 1 ? "active" : ""}`}
            >
              <span>{index + 1}</span>
              <p>{label}</p>
            </div>
          ))}
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="form-grid">
  <input
    name="firstName"
    placeholder="First Name*"
    value={formData.firstName}
    onChange={handleChange}
  />

  <input
    name="lastName"
    placeholder="Last Name"
    value={formData.lastName}
    onChange={handleChange}
  />

  <input
    name="fatherName"
    placeholder="Father Name*"
    value={formData.fatherName}
    onChange={handleChange}
  />

  <input
    name="motherName"
    placeholder="Mother Name"
    value={formData.motherName}
    onChange={handleChange}
  />

 <div>
  <label style={{ fontSize: "12px" }}>Date of Birth</label>
  <input
  type="date"
  name="dateOfBirth"
  value={formData.dateOfBirth || ""}
  onChange={handleChange}
/>
</div>


  {/* Gender */}
  <select name="gender" value={formData.gender} onChange={handleChange}>
    <option value="">Gender*</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>

  {/* Blood Group Dropdown */}
  <select
    name="bloodGroup"
    value={formData.bloodGroup}
    onChange={handleChange}
  >
    <option value="">Select Blood Group</option>
    <option value="A+">A+</option>
    <option value="A-">A-</option>
    <option value="B+">B+</option>
    <option value="B-">B-</option>
    <option value="AB+">AB+</option>
    <option value="AB-">AB-</option>
    <option value="O+">O+</option>
    <option value="O-">O-</option>
  </select>

  <input
    name="nationality"
    placeholder="Nationality"
    value={formData.nationality}
    onChange={handleChange}
  />

  {/* Religion Dropdown */}
  <select
    name="religion"
    value={formData.religion}
    onChange={handleChange}
  >
    <option value="">Select Religion</option>
    <option value="Hindu">Hindu</option>
    <option value="Muslim">Muslim</option>
    <option value="Christian">Christian</option>
    <option value="Sikh">Sikh</option>
    <option value="Buddhist">Buddhist</option>
    <option value="Jain">Jain</option>
    <option value="Other">Other</option>
  </select>

  {/* Category */}
  <select name="category" value={formData.category} onChange={handleChange}>
    <option value="">Category</option>
    <option value="General">General</option>
    <option value="OBC">OBC</option>
    <option value="SC">SC</option>
    <option value="ST">ST</option>
  </select>
</div>

        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="form-grid">
            <div className="profile-upload">
              <label>Profile Photo</label>

              <input
                type="file"
                accept="image/*"
                onClick={(e) => (e.target.value = null)}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setRawImage(file);
                    setShowCropper(true);
                  }
                }}
              />

              {croppedImage && (
                <img
                  src={croppedImage}
                  alt="Preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginTop: 10,
                  }}
                />
              )}
            </div>

            <input
  name="phone"
  placeholder="Phone*"
  value={formData.phone}
  onChange={handleChange}
  inputMode="numeric"
  maxLength={10}
/>
            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            <textarea className="full-width" name="address" placeholder="Address*" value={formData.address} onChange={handleChange} />
            <input name="city" placeholder="City*" value={formData.city} onChange={handleChange} />
            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
            <input name="pinCode" placeholder="PIN" value={formData.pinCode} onChange={handleChange} />
            <input name="guardianName" placeholder="Guardian Name" value={formData.guardianName} onChange={handleChange} />
            <input
  name="guardianPhone"
  placeholder="Guardian Phone*"
  value={formData.guardianPhone}
  onChange={handleChange}
  inputMode="numeric"
  maxLength={10}
/>
            <input name="relation" placeholder="Relation" value={formData.relation} onChange={handleChange} />
            <input
  name="emergencyContact"
  placeholder="Emergency Contact"
  value={formData.emergencyContact}
  onChange={handleChange}
  inputMode="numeric"
  maxLength={10}
/>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="form-grid">
            <input name="studentClass" placeholder="Class*" value={formData.studentClass} onChange={handleChange} />
            <input name="section" placeholder="Section*" value={formData.section} onChange={handleChange} />
            <input name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} />
            <input name="academicSession" value={formData.academicSession} onChange={handleChange} />
            <input name="feeCategory" value={formData.feeCategory} onChange={handleChange} />
            <input type="number" name="feeDiscount" value={formData.feeDiscount} onChange={handleChange} />
            <input name="previousClass" placeholder="Previous Class" value={formData.previousClass} onChange={handleChange} />
            <input name="previousSchool" placeholder="Previous School" value={formData.previousSchool} onChange={handleChange} />
          </div>
        )}

        {/* ================= STEP 4 ================= */}
        {/* ================= STEP 4 ================= */}
{step === 4 && (
  <>
    <div className="form-grid">
      <textarea
        name="medicalConditions"
        placeholder="Medical Conditions"
        value={formData.medicalConditions}
        onChange={handleChange}
      />

      <textarea
        name="allergies"
        placeholder="Allergies"
        value={formData.allergies}
        onChange={handleChange}
      />

      <textarea
        name="specialNeeds"
        placeholder="Special Needs"
        value={formData.specialNeeds}
        onChange={handleChange}
      />
    </div>

    <h4>Documents</h4>
    <div className="checkbox-grid">
      {["Birth Certificate", "TC", "Mark Sheet", "Address Proof"].map(d => (
        <label key={d}>
          <input
            type="checkbox"
            checked={formData.documents.includes(d)}
            onChange={() => handleArrayCheck("documents", d)}
          />
          {d}
        </label>
      ))}
    </div>

    <h4>Optional Services</h4>
    <div className="checkbox-grid">
      {["Transport", "Hostel", "Lunch", "Coaching"].map(s => (
        <label key={s}>
          <input
            type="checkbox"
            checked={formData.optionalServices.includes(s)}
            onChange={() => handleArrayCheck("optionalServices", s)}
          />
          {s}
        </label>
      ))}
    </div>
  </>
)}


        {/* ================= STEP 5 ================= */}
        {step === 5 && (
          <div className="review-section">
            <R l="Name" v={`${formData.firstName} ${formData.lastName}`} />
            <R l="Phone" v={formData.phone} />
            <R l="Class" v={`${formData.studentClass}-${formData.section}`} />

            <label className="final-confirm">
              <input
                type="checkbox"
                name="confirmationAccepted"
                checked={formData.confirmationAccepted}
                onChange={handleChange}
              />
              I confirm all details are correct
            </label>
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="modal-footer">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}>Back</button>
          )}

          {step < 5 ? (
            <button
              className="primary"
              disabled={!validateStep()}
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button
              className="primary"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : editData ? "Update" : "Submit"}
            </button>
          )}
        </div>
      </div>

      {/* IMAGE CROPPER */}
      {showCropper && (
        <ImageCropper
          image={rawImage}
          onSave={(img) => {
            setCroppedImage(img);
            setShowCropper(false);
          }}
          onClose={() => setShowCropper(false)}
        />
      )}
    </div>
  );
};

export default AddStudentModal;
