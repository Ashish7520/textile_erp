import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";
import "../App.css";

import CuttingOverview from "../components/owner/CuttingOverview";
import InventorySection from "../components/owner/InventorySection";
import UserSection from "../components/owner/UserSection";
import RuleSection from "../components/owner/RuleSection";
import CreateJobSection from "../components/owner/CreateJobSection";
import StitchingManager from "../components/owner/StitchingManager";
import WageCard from "../components/WageCard";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [myJobs, setMyJobs] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payUserId, setPayUserId] = useState("");
  const [payAmount, setPayAmount] = useState("");

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      if (parsedUser.role === "cutting_man") loadMyJobs(parsedUser.id);
      if (parsedUser.role === "employee") loadMyTasks(parsedUser.id);
      if (parsedUser.role === "owner") loadEmployees();
    }
  }, []);

  const loadMyJobs = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/cutting/my-jobs/${uid}`);
      setMyJobs(res.data);
    } catch (e) {}
  };
  const loadMyTasks = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/stitching/employee/${uid}`);
      setMyTasks(res.data);
    } catch (e) {}
  };
  const loadEmployees = async () => {
    try {
      const cutters = await axios.get(`${API_URL}/auth/role/cutting_man`);
      const stitchers = await axios.get(`${API_URL}/auth/role/employee`);
      setEmployees([...cutters.data, ...stitchers.data]);
    } catch (e) {}
  };

  const handleFinishCut = async (jobId, metersUsed) => {
    try {
      await axios.post(`${API_URL}/api/cutting/finish`, { jobId, metersUsed });
      alert("Done!");
      loadMyJobs(user.id);
    } catch (err) {
      alert("Error");
    }
  };
  const handleMarkWorkDone = async (taskId) => {
    if (!confirm("Are you sure you finished this stitching task?")) return;
    try {
      await axios.post(`${API_URL}/api/stitching/work-done`, { taskId });
      alert("Great! Manager will verify it now.");
      loadMyTasks(user.id);
    } catch (err) {
      alert("Error");
    }
  };
  const handleGiveAdvance = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/wages/pay`, {
        userId: payUserId,
        amount: payAmount,
        type: "advance",
      });
      alert("Payment Recorded!");
      setPayAmount("");
    } catch (err) {
      alert("Error");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Textile ERP: {user.username.toUpperCase()}</h2>
        <button
          className="btn-logout"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {user.role === "owner" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {[
              "overview",
              "inventory",
              "users",
              "rules",
              "create_job",
              "stitching",
              "payments",
            ].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "btn-primary" : "form-input"}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          {activeTab === "overview" && <CuttingOverview />}
          {activeTab === "inventory" && <InventorySection />}
          {activeTab === "users" && <UserSection />}
          {activeTab === "rules" && <RuleSection />}
          {activeTab === "create_job" && <CreateJobSection />}
          {activeTab === "stitching" && <StitchingManager user={user} />}
          {activeTab === "payments" && (
            <div className="section-card">
              <h3 className="section-title">💰 Wage & Advance Management</h3>
              <form onSubmit={handleGiveAdvance} className="add-fabric-form">
                <select
                  className="form-input"
                  value={payUserId}
                  onChange={(e) => setPayUserId(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username} ({emp.role})
                    </option>
                  ))}
                </select>
                <input
                  className="form-input"
                  placeholder="Amount (₹)"
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
                <button className="btn-primary">Record Advance</button>
              </form>
            </div>
          )}
        </div>
      )}

      {user.role === "cutting_man" && (
        <div>
          <WageCard userId={user.id} />
          <div className="section-card">
            <h3 className="section-title">My Cutting Tasks</h3>
            {myJobs.map(
              (job) =>
                job.status === "pending" && (
                  <div
                    key={job.id}
                    style={{
                      padding: "15px",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {job.GarmentType?.image_url && (
                      <img
                        src={`${API_URL}${job.GarmentType.image_url}`}
                        alt="Design"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          marginRight: "15px",
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <span className="sku-badge">
                        {job.GarmentType?.name || job.Fabric?.sku}
                      </span>
                      <span style={{ marginLeft: "10px" }}>
                        Size: {job.size} | Qty: {job.planned_pieces}
                      </span>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Fabric: {job.Fabric?.sku}
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => handleFinishCut(job.id, job.meters_used)}
                    >
                      Complete
                    </button>
                  </div>
                ),
            )}
          </div>
          <CreateJobSection />
          <StitchingManager user={user} />
        </div>
      )}

      {user.role === "employee" && (
        <div>
          <WageCard userId={user.id} />
          <div className="section-card">
            <h3 className="section-title">My Stitching Tasks</h3>
            {myTasks.length === 0 ? (
              <p>No work assigned yet.</p>
            ) : (
              <ul className="inventory-list">
                {myTasks.map((task) => (
                  <li
                    key={task.id}
                    className="inventory-item"
                    style={{
                      background:
                        task.status === "pending_verification"
                          ? "#f0f0f0"
                          : "white",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {task.CuttingJob?.GarmentType?.image_url ? (
                        <img
                          src={`${API_URL}${task.CuttingJob.GarmentType.image_url}`}
                          alt="Design"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            marginRight: "15px",
                            border: "1px solid #eee",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            background: "#eee",
                            borderRadius: "6px",
                            marginRight: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          No Img
                        </div>
                      )}
                      <div>
                        <span className="sku-badge">
                          {task.CuttingJob?.GarmentType?.name ||
                            task.CuttingJob?.Fabric?.sku}
                        </span>
                        <strong
                          style={{ marginLeft: "10px", fontSize: "18px" }}
                        >
                          {task.pieces_assigned} Pieces
                        </strong>
                        <div style={{ color: "#666" }}>
                          Size: {task.CuttingJob?.size}
                        </div>
                        <div
                          style={{
                            color: "green",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          Rate: ₹{task.CuttingJob?.GarmentType?.stitching_price}
                          /pc
                        </div>
                      </div>
                    </div>
                    {task.status === "in_progress" ? (
                      <button
                        className="btn-primary"
                        onClick={() => handleMarkWorkDone(task.id)}
                      >
                        Mark Done
                      </button>
                    ) : (
                      <span
                        style={{
                          color: "#27ae60",
                          fontWeight: "bold",
                          border: "1px solid #27ae60",
                          padding: "5px",
                          borderRadius: "4px",
                        }}
                      >
                        Waiting Check
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
