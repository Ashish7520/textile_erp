import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";
import CuttingOverview from "../components/owner/CuttingOverview";
import InventorySection from "../components/owner/InventorySection";
import UserSection from "../components/owner/UserSection";
import RuleSection from "../components/owner/RuleSection";
import CreateJobSection from "../components/owner/CreateJobSection";
import StitchingManager from "../components/owner/StitchingManager";
import WageCard from "../components/WageCard";

function OwnerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Ledger States
  const [reportUserId, setReportUserId] = useState("");
  const [reportUserRole, setReportUserRole] = useState("");
  const [reportHistory, setReportHistory] = useState([]);
  const [reportPayments, setReportPayments] = useState([]);
  const [payAmount, setPayAmount] = useState("");
  const [ownerMonth, setOwnerMonth] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (reportUserId) loadOwnerReportData(reportUserId, reportUserRole);
  }, [reportUserId, refreshKey]);

  const loadEmployees = async () => {
    try {
      const cutters = await axios.get(`${API_URL}/auth/role/cutting_man`);
      const stitchers = await axios.get(`${API_URL}/auth/role/employee`);
      setEmployees([...cutters.data, ...stitchers.data]);
    } catch (e) {}
  };

  const loadOwnerReportData = async (uid, role) => {
    try {
      const payRes = await axios.get(
        `${API_URL}/api/wages/user-history/${uid}`,
      );
      setReportPayments(payRes.data);

      if (role === "cutting_man") {
        const cutRes = await axios.get(`${API_URL}/api/cutting/history/${uid}`);
        setReportHistory(cutRes.data);
      } else if (role === "employee") {
        const stRes = await axios.get(
          `${API_URL}/api/stitching/history/${uid}`,
        );
        setReportHistory(stRes.data);
      }
    } catch (e) {}
  };

  const handleGiveAdvance = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/wages/pay`, {
        userId: reportUserId,
        amount: payAmount,
        type: "advance",
      });
      alert("Payment Recorded!");
      setPayAmount("");
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
          "staff_reports",
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

      {activeTab === "staff_reports" && (
        <div className="section-card">
          <h3 className="section-title">📊 Staff Ledger & Reports</h3>
          <div style={{ marginBottom: "20px" }}>
            <select
              className="form-input"
              value={reportUserId}
              onChange={(e) => {
                const selected = employees.find(
                  (emp) => emp.id == e.target.value,
                );
                if (selected) {
                  setReportUserId(selected.id);
                  setReportUserRole(selected.role);
                } else {
                  setReportUserId("");
                  setReportUserRole("");
                }
              }}
            >
              <option value="">-- Select an Employee to view details --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.username}{" "}
                  {emp.role ? `(${emp.role.replace("_", " ")})` : ""}
                </option>
              ))}
            </select>
          </div>

          {reportUserId && (
            <div style={{ borderTop: "2px dashed #ccc", paddingTop: "20px" }}>
              <WageCard userId={reportUserId} key={reportUserId + refreshKey} />
              <form
                onSubmit={handleGiveAdvance}
                style={{
                  background: "#fdfdfd",
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <strong>Give Advance:</strong>
                <input
                  className="form-input"
                  placeholder="Amount (₹)"
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  style={{ width: "150px", margin: 0 }}
                />
                <button className="btn-primary" style={{ margin: 0 }}>
                  Record
                </button>
              </form>
              {renderMonthFilter(ownerMonth, setOwnerMonth)}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: "300px",
                    background: "#fff",
                    padding: "15px",
                    borderRadius: "6px",
                    border: "1px solid #eee",
                  }}
                >
                  <h4 style={{ marginBottom: "10px", color: "#e74c3c" }}>
                    Payment History
                  </h4>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f9f9f9",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        <th style={{ padding: "8px" }}>Date</th>
                        <th style={{ padding: "8px" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterByMonth(reportPayments, "createdAt", ownerMonth)
                        .length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ padding: "8px" }}>
                            No payments.
                          </td>
                        </tr>
                      ) : (
                        filterByMonth(
                          reportPayments,
                          "createdAt",
                          ownerMonth,
                        ).map((pay) => (
                          <tr
                            key={pay.id}
                            style={{ borderBottom: "1px solid #eee" }}
                          >
                            <td style={{ padding: "8px" }}>
                              {new Date(pay.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "8px", fontWeight: "bold" }}>
                              - ₹{pay.amount}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: "350px",
                    background: "#fff",
                    padding: "15px",
                    borderRadius: "6px",
                    border: "1px solid #eee",
                  }}
                >
                  <h4 style={{ marginBottom: "10px", color: "#27ae60" }}>
                    Work History
                  </h4>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#f9f9f9",
                          borderBottom: "2px solid #ddd",
                        }}
                      >
                        <th style={{ padding: "8px" }}>Date</th>
                        <th style={{ padding: "8px" }}>Item</th>
                        <th style={{ padding: "8px" }}>Qty</th>
                        {reportUserRole === "employee" && (
                          <th style={{ padding: "8px" }}>Wage</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filterByMonth(
                        reportHistory,
                        reportUserRole === "cutting_man"
                          ? "updatedAt"
                          : "completed_at",
                        ownerMonth,
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: "8px" }}>
                            No work found.
                          </td>
                        </tr>
                      ) : (
                        filterByMonth(
                          reportHistory,
                          reportUserRole === "cutting_man"
                            ? "updatedAt"
                            : "completed_at",
                          ownerMonth,
                        ).map((task) => {
                          const dateStr = new Date(
                            task.updatedAt || task.completed_at,
                          ).toLocaleDateString();
                          const itemName =
                            reportUserRole === "cutting_man"
                              ? task.GarmentType?.name
                              : task.CuttingJob?.GarmentType?.name;
                          const qty =
                            reportUserRole === "cutting_man"
                              ? task.planned_pieces
                              : task.pieces_assigned;
                          const wage =
                            reportUserRole === "employee"
                              ? task.pieces_assigned *
                                (task.CuttingJob?.GarmentType
                                  ?.stitching_price || 0)
                              : 0;
                          return (
                            <tr
                              key={task.id}
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              <td style={{ padding: "8px", fontSize: "12px" }}>
                                {dateStr}
                              </td>
                              <td
                                style={{ padding: "8px", fontWeight: "bold" }}
                              >
                                {itemName}
                              </td>
                              <td style={{ padding: "8px" }}>{qty} pcs</td>
                              {reportUserRole === "employee" && (
                                <td style={{ padding: "8px", color: "green" }}>
                                  ₹{wage}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
