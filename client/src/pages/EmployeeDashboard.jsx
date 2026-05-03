import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import WageCard from "../components/WageCard";

function EmployeeDashboard({ user }) {
  const [workerTab, setWorkerTab] = useState("tasks");
  const [workerMonth, setWorkerMonth] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [myTasks, setMyTasks] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [myPayments, setMyPayments] = useState([]);

  useEffect(() => {
    loadMyTasks(user.id);
    loadMyHistory(user.id);
    loadMyPayments(user.id);
  }, [user.id, refreshKey]);

  const loadMyTasks = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/stitching/employee/${uid}`);
      setMyTasks(res.data);
    } catch (e) {}
  };
  const loadMyHistory = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/stitching/history/${uid}`);
      setMyHistory(res.data);
    } catch (e) {}
  };
  const loadMyPayments = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/wages/user-history/${uid}`);
      setMyPayments(res.data);
    } catch (e) {}
  };

  const handleMarkWorkDone = async (taskId) => {
    if (!confirm("Are you sure you finished this stitching task?")) return;
    try {
      await axios.post(`${API_URL}/api/stitching/work-done`, { taskId });
      alert("Great! Manager will verify it now.");
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert("Error");
    }
  };

  const filterByMonth = (list, dateField, monthStr) => {
    if (!list) return [];
    if (!monthStr) return list;
    return list.filter((item) => {
      if (!item[dateField]) return false;
      const d = new Date(item[dateField]);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}` === monthStr;
    });
  };

  const renderMonthFilter = (stateVal, setStateFunc) => (
    <div
      style={{
        marginBottom: "15px",
        background: "#fff",
        padding: "10px",
        borderRadius: "6px",
        display: "inline-block",
        border: "1px solid #ddd",
      }}
    >
      <label
        style={{ fontWeight: "bold", marginRight: "10px", fontSize: "14px" }}
      >
        🗓️ Select Month:
      </label>
      <input
        type="month"
        value={stateVal}
        onChange={(e) => setStateFunc(e.target.value)}
        className="form-input"
        style={{ width: "auto", padding: "5px" }}
      />
      <button
        onClick={() => setStateFunc("")}
        style={{
          marginLeft: "10px",
          padding: "6px 12px",
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Show All
      </button>
    </div>
  );

  return (
    <div>
      <WageCard userId={user.id} key={refreshKey} />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className={workerTab === "tasks" ? "btn-primary" : "form-input"}
          onClick={() => setWorkerTab("tasks")}
        >
          Active Tasks
        </button>
        <button
          className={workerTab === "history" ? "btn-primary" : "form-input"}
          onClick={() => setWorkerTab("history")}
        >
          Work History
        </button>
        <button
          className={workerTab === "payments" ? "btn-primary" : "form-input"}
          onClick={() => setWorkerTab("payments")}
        >
          Payment History
        </button>
      </div>

      {workerTab === "tasks" && (
        <div className="section-card">
          <h3 className="section-title">My Active Tasks</h3>
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
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          marginRight: "15px",
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
                        }}
                      ></div>
                    )}
                    <div>
                      <span className="sku-badge">
                        {task.CuttingJob?.GarmentType?.name}
                      </span>
                      <strong style={{ marginLeft: "10px", fontSize: "18px" }}>
                        {task.pieces_assigned} Pieces
                      </strong>
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
                    <span style={{ color: "#27ae60", fontWeight: "bold" }}>
                      Waiting Check
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {workerTab === "history" && (
        <div className="section-card">
          <h3 className="section-title">📜 My Verified Work History</h3>
          {renderMonthFilter(workerMonth, setWorkerMonth)}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{ background: "#eee", borderBottom: "2px solid #ddd" }}
                >
                  <th style={{ padding: "10px" }}>Date</th>
                  <th style={{ padding: "10px" }}>Photo</th>
                  <th style={{ padding: "10px" }}>Product</th>
                  <th style={{ padding: "10px" }}>Qty</th>
                  <th style={{ padding: "10px" }}>Total Wage</th>
                </tr>
              </thead>
              <tbody>
                {filterByMonth(myHistory, "updatedAt", workerMonth).length ===
                0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "10px" }}>
                      No work found.
                    </td>
                  </tr>
                ) : (
                  filterByMonth(myHistory, "updatedAt", workerMonth).map(
                    (task) => {
                      const rate =
                        task.CuttingJob?.GarmentType?.stitching_price || 0;
                      const totalWork = rate * task.pieces_assigned;
                      return (
                        <tr
                          key={task.id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ padding: "10px", fontSize: "12px" }}>
                            {new Date(task.updatedAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {task.CuttingJob?.GarmentType?.image_url ? (
                              <img
                                src={`${API_URL}${task.CuttingJob.GarmentType.image_url}`}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            ) : (
                              "No Img"
                            )}
                          </td>
                          <td style={{ padding: "10px", fontWeight: "bold" }}>
                            {task.CuttingJob?.GarmentType?.name}
                          </td>
                          <td style={{ padding: "10px", fontWeight: "bold" }}>
                            {task.pieces_assigned} pcs
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              fontWeight: "bold",
                              color: "#27ae60",
                            }}
                          >
                            ₹{totalWork}
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {workerTab === "payments" && (
        <div className="section-card">
          <h3 className="section-title">💸 My Payment History</h3>
          {renderMonthFilter(workerMonth, setWorkerMonth)}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{ background: "#eee", borderBottom: "2px solid #ddd" }}
              >
                <th style={{ padding: "10px" }}>Date</th>
                <th style={{ padding: "10px" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filterByMonth(myPayments, "createdAt", workerMonth).length ===
              0 ? (
                <tr>
                  <td colSpan="2" style={{ padding: "10px" }}>
                    No payments.
                  </td>
                </tr>
              ) : (
                filterByMonth(myPayments, "createdAt", workerMonth).map(
                  (pay) => (
                    <tr key={pay.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          fontWeight: "bold",
                          color: "#e74c3c",
                        }}
                      >
                        - ₹{pay.amount}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeDashboard;
