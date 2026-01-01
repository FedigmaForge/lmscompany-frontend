import React, { useState } from "react";
import "./TeacherLogin.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TeacherLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password || !schoolCode) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/teachers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, schoolCode }),
      });

      //  If server returned no body → avoid crashing
      let data = {};
      try {
        data = await response.clone().json();
      } catch (err) {
        console.log("JSON Parse Error: Empty or invalid response", err);
        alert("Invalid response from server.");
        setLoading(false);
        return;
      }

      if (!data.success) {
        alert(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      // Save login info
      localStorage.setItem("teacherToken", data.token);
      localStorage.setItem("teacherData", JSON.stringify(data.data));
      localStorage.setItem("schoolCode", data.data.schoolCode);

      alert("Login Successful!");
      window.location.href = "/teacher";
    } catch (err) {
      console.log("Login Error:", err);
      alert("Network error or server is down.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Teacher Login</h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter School Code"
          value={schoolCode}
          onChange={(e) => setSchoolCode(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default TeacherLogin;
