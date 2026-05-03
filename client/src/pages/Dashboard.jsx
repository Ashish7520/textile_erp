// client/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

// Import our new, clean sub-dashboards
import OwnerDashboard from "./OwnerDashboard";
import CutterDashboard from "./CutterDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is logged in
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/");
    } else {
      setUser(JSON.parse(loggedInUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>Loading App...</div>
    );

  return (
    <div className="dashboard-container">
      {/* Universal Header for all users */}
      <div className="header">
        <h2>Textile ERP: {user.username.toUpperCase()}</h2>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Render the correct dashboard based on the user's role */}
      {user.role === "owner" && <OwnerDashboard user={user} />}
      {user.role === "cutting_man" && <CutterDashboard user={user} />}
      {user.role === "employee" && <EmployeeDashboard user={user} />}
    </div>
  );
}

export default Dashboard;
