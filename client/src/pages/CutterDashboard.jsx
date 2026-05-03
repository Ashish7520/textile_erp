import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import WageCard from "../components/WageCard";
import CreateJobSection from "../components/owner/CreateJobSection";
import StitchingManager from "../components/owner/StitchingManager";

function CutterDashboard({ user }) {
  const [workerTab, setWorkerTab] = useState("tasks");
  const [workerMonth, setWorkerMonth] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [myJobs, setMyJobs] = useState([]);
  const [myCuttingHistory, setMyCuttingHistory] = useState([]);
  const [myPayments, setMyPayments] = useState([]);

  useEffect(() => {
    loadMyJobs(user.id);
    loadMyCuttingHistory(user.id);
    loadMyPayments(user.id);
  }, [user.id, refreshKey]);

  const loadMyJobs = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/cutting/my-jobs/${uid}`);
      setMyJobs(res.data);
    } catch (e) {}
  };
  const loadMyCuttingHistory = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/cutting/history/${uid}`);
      setMyCuttingHistory(res.data);
    } catch (e) {}
  };
  const loadMyPayments = async (uid) => {
    try {
      const res = await axios.get(`${API_URL}/api/wages/user-history/${uid}`);
      setMyPayments(res.data);
    } catch (e) {}
  };

  const handleFinishCut = async (jobId, metersUsed) => {
    try {
      await axios.post(`${API_URL}/api/cutting/finish`, { jobId, metersUsed });
      alert("Done!");
      setRefreshKey((prev) => prev + 1); // Refresh all data
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
      )}

      {workerTab === "history" && (
        <div className="section-card">
          <h3 className="section-title">📜 My Completed Jobs</h3>
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
                  <th style={{ padding: "10px" }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filterByMonth(myCuttingHistory, "updatedAt", workerMonth)
                  .length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "10px" }}>
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filterByMonth(myCuttingHistory, "updatedAt", workerMonth).map(
                    (job) => (
                      <tr
                        key={job.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: "10px", fontSize: "12px" }}>
                          {new Date(job.updatedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {job.GarmentType?.image_url ? (
                            <img
                              src={`${API_URL}${job.GarmentType.image_url}`}
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
                          {job.GarmentType?.name}
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            fontWeight: "bold",
                            color: "#27ae60",
                          }}
                        >
                          {job.planned_pieces} pcs
                        </td>
                      </tr>
                    ),
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
      <CreateJobSection />
      <StitchingManager user={user} />
    </div>
  );
}

export default CutterDashboard;
