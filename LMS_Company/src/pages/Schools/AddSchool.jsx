import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/AddEditSchoolForm.css";

const AddEditSchoolForm = ({ schoolId, onSuccess }) => {
  const [school, setSchool] = useState({
    school_name: "",
    school_code: "",
    contact_number: "",
    account_type: "basic",
    education_type: "school",
    email: "",
    password: "",
    active: 1,
    active_date: "",
    deactive_date: "",
    school_logo: null
  });

  const token = localStorage.getItem("companyToken");

  // Fetch school data if editing
  useEffect(() => {
    if (!schoolId) return;
    console.log("Fetching school data for ID:", schoolId);
    axios
      .get(`http://localhost:4000/api/schools/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("School data fetched:", res.data);
        // Format dates to YYYY-MM-DD
        const formattedData = {
          ...res.data,
          school_logo: null,
          password: "",
          education_type: res.data.education_type || "school",
          active_date: res.data.active_date ? res.data.active_date.split('T')[0] : "",
          deactive_date: res.data.deactive_date ? res.data.deactive_date.split('T')[0] : ""
        };
        setSchool(formattedData);
      })
      .catch((err) => console.error("Error fetching school:", err));
  }, [schoolId, token]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    console.log("Input change:", { name, value, type, checked, files });

    if (type === "file") setSchool({ ...school, [name]: files[0] });
    else if (type === "checkbox") setSchool({ ...school, [name]: checked ? 1 : 0 });
    else setSchool({ ...school, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", school);

    const formData = new FormData();
    for (let key in school) {
      if (school[key] !== null && school[key] !== undefined) {
        // Format dates to YYYY-MM-DD
        if (key === "active_date" || key === "deactive_date") {
          formData.append(key, school[key] ? new Date(school[key]).toISOString().split('T')[0] : "");
        } else {
          formData.append(key, school[key]);
        }
      }
    }

    try {
      let response;
      if (schoolId) {
        console.log("Updating school ID:", schoolId);
        response = await axios.put(
          `http://localhost:4000/api/schools/${schoolId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        console.log("Adding new school");
        response = await axios.post(
          "http://localhost:4000/api/schools",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      console.log("API response:", response.data);
      alert(schoolId ? "School updated successfully!" : "School added successfully!");
      if (onSuccess) onSuccess();

      // Reset form
      setSchool({
        school_name: "",
        school_code: "",
        contact_number: "",
        account_type: "basic",
        education_type: "school",
        email: "",
        password: "",
        active: 1,
        active_date: "",
        deactive_date: "",
        school_logo: null
      });
    } catch (err) {
      console.error("Error submitting form:", err);
      alert(err.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <form className="school-form" onSubmit={handleSubmit}>
      <h2>{schoolId ? "Edit School" : "Add School"}</h2>

      <input
        type="text"
        name="school_name"
        placeholder="School Name"
        value={school.school_name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="school_code"
        placeholder="School Code"
        value={school.school_code}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="contact_number"
        placeholder="Contact Number"
        value={school.contact_number}
        onChange={handleChange}
      />

      <select
        name="account_type"
        value={school.account_type}
        onChange={handleChange}
      >
        <option value="basic">Basic</option>
        <option value="prime">Prime</option>
        <option value="Advance">Advance</option>
      </select>

      <select
        name="education_type"
        value={school.education_type}
        onChange={handleChange}
      >
        <option value="school">School</option>
        <option value="college">College</option>
        <option value="institute">Institute</option>
        <option value="University">University</option>
      </select>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={school.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder={schoolId ? "Leave blank to keep current password" : "Password"}
        value={school.password}
        onChange={handleChange}
      />

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="active"
          checked={school.active === 1}
          onChange={handleChange}
        />
        Active
      </label>

      <label>
        Active Date:
        <input
          type="date"
          name="active_date"
          value={school.active_date}
          onChange={handleChange}
        />
      </label>

      <label>
        Deactive Date:
        <input
          type="date"
          name="deactive_date"
          value={school.deactive_date}
          onChange={handleChange}
        />
      </label>

      <label>
        School Logo:
        <input type="file" name="school_logo" onChange={handleChange} />
      </label>

      <button type="submit">{schoolId ? "Update School" : "Add School"}</button>
    </form>
  );
};

export default AddEditSchoolForm;