// AddStudentModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import "./AddStudentModal.css";

const AddStudentModal = ({ onClose }) => {
    const [step, setStep] = useState(1);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2>Add New Student</h2>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* Stepper */}
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
                        <div>
                            <label>First Name *</label>
                            <input placeholder="Enter first name" />
                        </div>

                        <div>
                            <label>Last Name *</label>
                            <input placeholder="Enter last name" />
                        </div>

                        <div>
                            <label>Father's Name *</label>
                            <input placeholder="Enter father's name" />
                        </div>

                        <div>
                            <label>Mother's Name *</label>
                            <input placeholder="Enter mother's name" />
                        </div>

                        <div>
                            <label>Date of Birth *</label>
                            <input type="date" />
                        </div>

                        <div>
                            <label>Gender *</label>
                            <div className="radio-group">
                                <label><input type="radio" name="gender" /> Male</label>
                                <label><input type="radio" name="gender" /> Female</label>
                                <label><input type="radio" name="gender" /> Other</label>
                            </div>
                        </div>

                        {/*  Blood Group */}
                        <div>
                            <label>Blood Group</label>
                            <select>
                                <option value="">Select blood group</option>
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>O+</option>
                                <option>O-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                            </select>
                        </div>

                        {/*  Nationality */}
                        <div>
                            <label>Nationality</label>
                            <input defaultValue="Indian" />
                        </div>

                        {/*  Religion */}
                        <div>
                            <label>Religion</label>
                            <input placeholder="Enter religion" />
                        </div>

                        {/*  Caste / Category */}
                        <div>
                            <label>Caste / Category</label>
                            <select>
                                <option value="">Select category</option>
                                <option>General</option>
                                <option>OBC</option>
                                <option>SC</option>
                                <option>ST</option>
                            </select>
                        </div>
                    </div>
                )}
                {/* ================= STEP 2 : CONTACT DETAILS ================= */}
                {step === 2 && (
                    <>
                        <div className="form-grid">
                            {/* Phone & Email */}
                            <div>
                                <label>Phone Number *</label>
                                <input type="text" placeholder="Enter phone number" />
                            </div>

                            <div>
                                <label>Email Address</label>
                                <input type="email" placeholder="Enter email address" />
                            </div>

                            {/* Address (full width) */}
                            <div className="full-width">
                                <label>Address *</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter complete address"
                                />
                            </div>

                            {/* City, State, PIN */}
                            <div>
                                <label>City *</label>
                                <input placeholder="Enter city" />
                            </div>

                            <div>
                                <label>State *</label>
                                <input placeholder="Enter state" />
                            </div>

                            <div>
                                <label>PIN Code *</label>
                                <input placeholder="Enter PIN code" />
                            </div>
                        </div>

                        {/* Guardian Information */}
                        <div className="section-divider">
                            <span>Guardian Information</span>
                        </div>

                        <div className="form-grid">
                            <div>
                                <label>Guardian Name *</label>
                                <input placeholder="Enter guardian name" />
                            </div>

                            <div>
                                <label>Guardian Phone *</label>
                                <input placeholder="Enter guardian phone" />
                            </div>

                            <div>
                                <label>Relation *</label>
                                <select>
                                    <option value="">Select relation</option>
                                    <option>Father</option>
                                    <option>Mother</option>
                                    <option>Brother</option>
                                    <option>Sister</option>
                                    <option>Guardian</option>
                                </select>
                            </div>

                            <div className="full-width">
                                <label>Emergency Contact</label>
                                <input placeholder="Enter emergency contact number" />
                            </div>
                        </div>
                    </>
                )}


                {/* ================= STEP 3 : ACADEMIC INFORMATION ================= */}
                {step === 3 && (
                    <>
                        <div className="form-grid">
                            {/* Class */}
                            <div>
                                <label>Class *</label>
                                <select>
                                    <option value="">Select class</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i + 1}>
                                            Class {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <label>Section *</label>
                                <select>
                                    <option value="">Select section</option>
                                    <option>A</option>
                                    <option>B</option>
                                    <option>C</option>
                                </select>
                            </div>

                            {/* Roll Number */}
                            <div>
                                <label>Roll Number</label>
                                <input placeholder="Auto-generated or manual" />
                            </div>

                            {/* Academic Session */}
                            <div>
                                <label>Academic Session *</label>
                                <select>
                                    <option>2024-25</option>
                                    <option>2025-26</option>
                                </select>
                            </div>

                            {/* Previous Class */}
                            <div>
                                <label>Previous Class</label>
                                <input placeholder="Enter previous class" />
                            </div>

                            {/* Previous School (FULL WIDTH) */}
                            <div className="full-width">
                                <label>Previous School</label>
                                <input placeholder="Enter previous school name" />
                            </div>
                        </div>

                        {/* Fee Category */}
                        <div className="section-divider">
                            <span>Fee Category</span>
                        </div>

                        <div className="form-grid">
                            {/* Fee Category */}
                            <div>
                                <label>Fee Category</label>
                                <div className="radio-vertical">
                                    <label>
                                        <input type="radio" name="feeCategory" defaultChecked /> General
                                    </label>
                                    <label>
                                        <input type="radio" name="feeCategory" /> Economical
                                    </label>
                                    <label>
                                        <input type="radio" name="feeCategory" /> Premium
                                    </label>
                                </div>
                            </div>

                            {/* Fee Discount */}
                            <div>
                                <label>Fee Discount (%)</label>
                                <input type="number" defaultValue={0} />
                            </div>

                            {/* Scholarship */}
                            <div className="checkbox-align">
                                <label>
                                    <input type="checkbox" /> Eligible for Scholarship
                                </label>
                            </div>
                        </div>
                    </>
                )}
                {/* ================= STEP 4 : ADDITIONAL DETAILS ================= */}
                {step === 4 && (
                    <>
                        {/* Medical Information */}
                        <h3 className="section-title">Medical Information</h3>

                        <div className="form-grid">
                            <div>
                                <label>Medical Conditions</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter any medical conditions"
                                />
                            </div>

                            <div>
                                <label>Allergies</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter any allergies"
                                />
                            </div>

                            <div className="full-width">
                                <label>Special Needs</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter any special needs or requirements"
                                />
                            </div>
                        </div>

                        {/* Required Documents */}
                        <div className="section-divider">
                            <span>Required Documents</span>
                        </div>

                        <div className="checkbox-grid">
                            <label><input type="checkbox" /> Birth Certificate</label>
                            <label><input type="checkbox" /> Address Proof</label>
                            <label><input type="checkbox" /> Previous Mark Sheet</label>
                            <label><input type="checkbox" /> Transfer Certificate</label>
                            <label><input type="checkbox" /> Caste Certificate</label>
                            <label><input type="checkbox" /> Income Certificate</label>
                            <label><input type="checkbox" /> Medical Certificate</label>
                            <label><input type="checkbox" /> Passport Size Photographs</label>
                        </div>

                        {/* Optional Services */}
                        <div className="section-divider">
                            <span>Optional Services</span>
                        </div>

                        <div className="checkbox-grid">
                            <label><input type="checkbox" /> Transport Facility</label>
                            <label><input type="checkbox" /> Hostel Facility</label>
                            <label><input type="checkbox" /> Lunch Facility</label>
                            <label><input type="checkbox" /> Extra Coaching</label>
                        </div>
                    </>
                )}
                {/* ================= STEP 5 : REVIEW & SUBMIT ================= */}
                {step === 5 && (
                    <>
                        <h3 className="section-title">Review Student Information</h3>

                        {/* Personal Information */}
                        <div className="review-section">
                            <h4>Personal Information</h4>
                            <div className="review-grid">
                                <p><strong>Name:</strong> John Doe</p>
                                <p><strong>DOB:</strong> 12-06-2012</p>
                                <p><strong>Gender:</strong> Male</p>
                                <p><strong>Blood Group:</strong> O+</p>
                                <p><strong>Nationality:</strong> Indian</p>
                                <p><strong>Category:</strong> OBC</p>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="review-section">
                            <h4>Contact Details</h4>
                            <div className="review-grid">
                                <p><strong>Phone:</strong> 9876543210</p>
                                <p><strong>Email:</strong> john@example.com</p>
                                <p className="full-width">
                                    <strong>Address:</strong> Hyderabad, Telangana – 500001
                                </p>
                                <p><strong>Guardian:</strong> Mr. Smith</p>
                                <p><strong>Guardian Phone:</strong> 9123456789</p>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="review-section">
                            <h4>Academic Information</h4>
                            <div className="review-grid">
                                <p><strong>Class:</strong> Class 5</p>
                                <p><strong>Section:</strong> A</p>
                                <p><strong>Roll Number:</strong> Auto</p>
                                <p><strong>Session:</strong> 2024-25</p>
                                <p><strong>Fee Category:</strong> General</p>
                                <p><strong>Discount:</strong> 0%</p>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="review-section">
                            <h4>Additional Details</h4>
                            <div className="review-grid">
                                <p><strong>Medical Conditions:</strong> None</p>
                                <p><strong>Allergies:</strong> None</p>
                                <p><strong>Special Needs:</strong> No</p>
                                <p className="full-width">
                                    <strong>Documents:</strong> Birth Certificate, Address Proof
                                </p>
                            </div>
                        </div>

                        {/* Final Confirmation */}
                        <div className="final-confirm">
                            <label>
                                <input type="checkbox" /> I confirm that the above information is correct
                            </label>
                        </div>
                    </>
                )}



                {/* Footer */}
                <div className="modal-footer">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)}>
                            Back
                        </button>
                    )}

                    {step < 5 ? (
                        <button className="primary" onClick={() => setStep(step + 1)}>
                            Next →
                        </button>
                    ) : (
                        <button className="primary">Submit</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;
