// AttendanceManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./AttendanceManagement.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://15.207.54.139:4000";

const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path><circle cx='12' cy='7' r='4'></circle></svg>`
  );

const AttendanceManagement = ({ type: initialType = "teacher", lockType }) => {

  const [type, setType] = useState(initialType);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [rowState, setRowState] = useState({}); // { [personKey]: { date, status, saving, savedAt, exists } }
  const [attendanceMap, setAttendanceMap] = useState({}); // { "<person_id>|<date>": record }
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const token = localStorage.getItem("schoolToken");
  const schoolCode = localStorage.getItem("schoolCode");
  const role = localStorage.getItem("role"); // "teacher" or "admin"

  const todayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const buildPhoto = (photo) => {
    if (!photo) return FALLBACK_AVATAR;
    return typeof photo === "string" && photo.startsWith("http") ? photo : `${API_BASE}${photo}`;
  };

  // mapping function - person_id uses admissionId / employeeid
  const getPersonKey = (item, isTeacher) => {
    return isTeacher ? (item.employeeid ?? item.id ?? "") : (item.admissionId ?? item.id ?? "");
  };

  // fetch lists
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/teachers`, {
        params: { school_code: schoolCode },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setTeachers(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/students`, {
        params: { school_code: schoolCode },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setStudents(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // fetch attendance for a date+type (returns map)
  const fetchAttendanceForDateAndType = async (date, personType) => {
    if (!date || !personType) return {};
    try {
      const res = await axios.get(`${API_BASE}/api/attendance/view`, {
        params: { school_code: schoolCode, date, type: personType },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const list = res.data?.data || [];
      const map = {};
      list.forEach((r) => {
        map[`${r.person_id}|${r.date}`] = r;
      });
      // merge into attendanceMap
      setAttendanceMap((prev) => ({ ...prev, ...map }));
      return map;
    } catch (err) {
      console.error("Error fetching attendance for date/type:", err);
      return {};
    }
  };

  // check single attendance record for a person_id + date
  const checkAttendanceForPerson = async (person_id, date, personType) => {
    if (!person_id || !date || !personType) return null;
    try {
      const res = await axios.get(`${API_BASE}/api/attendance/check`, {
        params: { school_code: schoolCode, person_id, date, type: personType },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success && res.data.exists) {
        const rec = res.data.record;
        setAttendanceMap((prev) => ({ ...prev, [`${person_id}|${date}`]: rec }));
        return rec;
      } else {
        setAttendanceMap((prev) => {
          const copy = { ...prev };
          delete copy[`${person_id}|${date}`];
          return copy;
        });
        return null;
      }
    } catch (err) {
      console.error("Error checking attendance:", err);
      return null;
    }
  };

  // initial load: fetch people & today's attendance for both types
  useEffect(() => {
    setLoading(true);
    (async () => {
      await Promise.all([fetchTeachers(), fetchStudents()]);
      const today = todayISO();
      await Promise.all([fetchAttendanceForDateAndType(today, "teacher"), fetchAttendanceForDateAndType(today, "student")]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // list currently shown
  const listToShow = type === "teacher" ? teachers : students;

  // sync rowState whenever list or attendanceMap change
  useEffect(() => {
    setRowState((prev) => {
      const next = { ...prev };
      const defaultDate = todayISO();

      listToShow.forEach((item) => {
        const k = getPersonKey(item, type === "teacher");
        if (!k) return;
        // prefer existing date in rowState else use defaultDate
        const currentDate = prev[k]?.date || defaultDate;
        const existing = attendanceMap[`${k}|${currentDate}`];

        if (!next[k]) {
          next[k] = {
            date: currentDate,
            status: existing?.status || "Present",
            saving: false,
            savedAt: existing ? (existing.created_at || new Date().toISOString()) : null,
            exists: !!existing,
          };
        } else {
          next[k] = {
            ...next[k],
            date: currentDate,
            status: existing?.status || next[k].status || "Present",
            exists: !!existing,
            savedAt: existing ? (existing.created_at || next[k].savedAt || new Date().toISOString()) : next[k].savedAt,
          };
        }
      });

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listToShow, attendanceMap, type]);

  // when type toggled, fetch attendance for today's date for that type (ensures map contains entries)
  useEffect(() => {
    (async () => {
      const d = todayISO();
      await fetchAttendanceForDateAndType(d, type);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // date changed in a row -> check that single person's attendance
  const handleDateChange = async (key, newDate, item) => {
    setRowState((s) => ({
      ...s,
      [key]: {
        ...(s[key] || { date: todayISO(), status: "Present", saving: false }),
        date: newDate,
      },
    }));

    // check attendance for this person/date
    const isTeacher = type === "teacher";
    const person_id = getPersonKey(item, isTeacher);
    if (!person_id) return;

    const rec = await checkAttendanceForPerson(person_id, newDate, type);
    if (rec) {
      setRowState((s) => ({
        ...s,
        [key]: {
          ...(s[key] || {}),
          status: rec.status,
          savedAt: rec.created_at || new Date().toISOString(),
          exists: true,
        },
      }));
    } else {
      setRowState((s) => ({
        ...s,
        [key]: {
          ...(s[key] || {}),
          status: s[key]?.status ?? "Present",
          savedAt: null,
          exists: false,
        },
      }));
    }
  };

  const handleRowChange = (key, field, value) => {
    setRowState((s) => ({
      ...s,
      [key]: {
        ...(s[key] || { date: todayISO(), status: "Present", saving: false }),
        [field]: value,
      },
    }));
  };

  // Save or Update (auto-detect)
  const handleSave = async (item) => {
    const isTeacher = type === "teacher";
    const person_id = getPersonKey(item, isTeacher);
    const key = person_id;
    const state = rowState[key] || { date: todayISO(), status: "Present" };

    if (!schoolCode) return alert("Missing school code (set localStorage.schoolCode).");
    if (!person_id) return alert("Missing id for this row.");
    if (!state.date) return alert("Please select a date.");

    setRowState((s) => ({ ...s, [key]: { ...(s[key] || {}), saving: true } }));

    try {
      // check local map first, then fallback to /check
      let existing = attendanceMap[`${person_id}|${state.date}`];
      if (!existing) {
        existing = await checkAttendanceForPerson(person_id, state.date, type);
      }

      const payload = {
        school_code: schoolCode,
        person_id,
        person_type: type,
        date: state.date,
        status: state.status,
        marked_by: localStorage.getItem("userId") || "admin",
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (existing) {
        const res = await axios.put(`${API_BASE}/api/attendance/update`, payload, { headers });
        if (res.data?.success) {
          setAttendanceMap((prev) => ({ ...prev, [`${person_id}|${state.date}`]: { ...existing, ...payload } }));
          setRowState((s) => ({ ...s, [key]: { ...(s[key] || {}), saving: false, savedAt: new Date().toISOString(), exists: true } }));
        } else {
          throw new Error(res.data?.message || "Update failed");
        }
      } else {
        const res = await axios.post(`${API_BASE}/api/attendance/add`, payload, { headers });
        if (res.data?.success) {
          setAttendanceMap((prev) => ({ ...prev, [`${person_id}|${state.date}`]: { ...payload } }));
          setRowState((s) => ({ ...s, [key]: { ...(s[key] || {}), saving: false, savedAt: new Date().toISOString(), exists: true } }));
        } else {
          throw new Error(res.data?.message || "Add failed");
        }
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert(err.response?.data?.message || err.message || "Failed to save attendance. See console.");
      setRowState((s) => ({ ...s, [key]: { ...(s[key] || {}), saving: false } }));
    }
  };

  const filteredList = useMemo(() => {
    const list = listToShow;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => {
      const name = (item.fullname || item.name || "").toString().toLowerCase();
      const empId = (item.employeeid || "").toString().toLowerCase();
      const admId = (item.admissionId || item.id || "").toString().toLowerCase();
      return name.includes(q) || empId.includes(q) || admId.includes(q);
    });
  }, [listToShow, query]);

  if (!token) {
    return (
      <div className="attendance-page auth-required">
        <h3>Auth required</h3>
        <p>Please login to manage attendance.</p>
        <a href="/login" className="link-btn">Login</a>
      </div>
    );
  }

  return (
    <section className="attendance-page">
      <div className="attendance-card">
        <div className="attendance-header">
          <h2>
  {role === "teacher"
    ? "Student Attendance Management"
    : (type === "teacher"
        ? "Teacher Attendance Management"
        : "Student Attendance Management")}
</h2>


          <div className="controls-row">
            {!lockType && (
              <div className="type-toggle">
                <button className={`toggle-btn ${type === "teacher" ? "active" : ""}`} onClick={() => setType("teacher")}>Teachers</button>
                <button className={`toggle-btn ${type === "student" ? "active" : ""}`} onClick={() => setType("student")}>Students</button>
              </div>
            )}

            <div className="search-left">
              <input type="search" placeholder={`Search ${type === "teacher" ? "teachers" : "students"} by name or ID...`} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="attendance-body">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="table-wrap">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th className="col-profile">Profile</th>
                    <th>Name</th>
                    <th style={{ minWidth: 140 }}>Date</th>
                    <th style={{ minWidth: 140 }}>Status</th>
                    <th style={{ width: 130 }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredList.length === 0 ? (
                    <tr><td colSpan={5} className="no-records">No records found</td></tr>
                  ) : filteredList.map((item) => {
                    const isTeacher = type === "teacher";
                    const idValue = getPersonKey(item, isTeacher);
                    const key = idValue;
                    const state = rowState[key] || { date: todayISO(), status: "Present", saving: false, exists: false, savedAt: null };
                    const photoSrc = buildPhoto(item.photo);

                    return (
                      <tr key={key} className={state.exists ? "row-saved" : ""}>
                        <td className="col-profile"><img src={photoSrc} alt="profile" className="avatar" /></td>

                        <td className="name-cell">
                          <div className="name-line">{item.fullname || item.name || "—"}</div>
                          <div className="sub-line">{isTeacher ? (item.employeeid || "") : (item.admissionId || item.id || "")}</div>
                        </td>

                        <td>
                          <input
                            type="date"
                            value={state.date}
                            onChange={(e) => handleDateChange(key, e.target.value, item)}
                            className="date-input"
                          />
                        </td>

                        <td>
                          <select value={state.status} onChange={(e) => handleRowChange(key, "status", e.target.value)} className="status-select">
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                            <option value="Half-Day">Half-Day</option>
                            <option value="Holiday">Holiday</option>
                          </select>
                        </td>

                        <td>
                          <button className="save-btn" onClick={() => handleSave(item)} disabled={state.saving}>
                            {state.saving ? "Saving..." : (state.exists ? "Update" : "Save")}
                          </button>

                          {state.savedAt && <div className="saved-note">Saved {new Date(state.savedAt).toLocaleString()}</div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AttendanceManagement;
