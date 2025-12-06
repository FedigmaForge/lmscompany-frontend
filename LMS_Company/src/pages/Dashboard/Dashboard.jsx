import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [schools, setSchools] = useState([]);
  const token = localStorage.getItem("companyToken");

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/schools", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSchools(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  const activeCount = schools.filter((s) => s.active === 1).length;
  const inactiveCount = schools.filter((s) => s.active === 0).length;

  return (
    <div className="dashboard-overview">
      <h3>Dashboard Overview</h3>
      <div className="stats-grid">
        <div className="card total">
          <p>Total Schools</p>
          <h2>{schools.length}</h2>
        </div>
        <div className="card active">
          <p>Active Schools</p>
          <h2>{activeCount}</h2>
        </div>
        <div className="card inactive">
          <p>Inactive Schools</p>
          <h2>{inactiveCount}</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
