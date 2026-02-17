// client/src/components/owner/StitchingManager.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function StitchingManager({ user }) {
  const [employees, setEmployees] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [stockList, setStockList] = useState([]);

  const [selectedStockKey, setSelectedStockKey] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [piecesToAssign, setPiecesToAssign] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const empRes = await axios.get(`${API_URL}/auth/role/employee`);
      setEmployees(empRes.data);

      const taskRes = await axios.get(`${API_URL}/api/stitching/all`);
      setActiveTasks(taskRes.data);

      const stockRes = await axios.get(`${API_URL}/api/stitching/stock`);
      setStockList(stockRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStockKey) return;
    const [gId, size] = selectedStockKey.split("-");

    try {
      await axios.post(`${API_URL}/api/stitching/assign`, {
        garmentId: gId,
        size: size,
        employeeId: selectedEmpId,
        pieces: piecesToAssign,
      });
      alert("Task Assigned Successfully!");
      setPiecesToAssign("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  const handleVerify = async (taskId) => {
    if (
      !confirm(
        "Confirm you have physically checked and received these clothes?",
      )
    )
      return;
    try {
      await axios.post(`${API_URL}/api/stitching/complete`, {
        taskId,
        userId: user.id,
      });
      loadData();
    } catch (err) {
      alert("Error");
    }
  };

  const getSelectedDetails = () => {
    const item = stockList.find(
      (s) => `${s.garmentId}-${s.size}` === selectedStockKey,
    );
    return item ? `(Available: ${item.totalAvailable})` : "";
  };

  return (
    <div className="section-card">
      <h3 className="section-title">🧵 Stitching Department Manager</h3>

      {/* ASSIGN FORM */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4>Assign New Task</h4>
        <form
          onSubmit={handleAssign}
          className="add-fabric-form"
          style={{ marginTop: "10px", flexDirection: "column" }}
        >
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <select
              className="form-input"
              value={selectedStockKey}
              onChange={(e) => setSelectedStockKey(e.target.value)}
              required
              style={{ flex: 2 }}
            >
              <option value="">-- Select Product (Ready to Stitch) --</option>
              {stockList.map((item, index) => (
                <option key={index} value={`${item.garmentId}-${item.size}`}>
                  {item.garmentName} ({item.size}) - {item.totalAvailable} pcs
                  Available
                </option>
              ))}
            </select>
            <select
              className="form-input"
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              required
              style={{ flex: 1 }}
            >
              <option value="">Assign To...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.username}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              className="form-input"
              placeholder={`Pieces to Sew ${getSelectedDetails()}`}
              type="number"
              value={piecesToAssign}
              onChange={(e) => setPiecesToAssign(e.target.value)}
              required
              style={{ maxWidth: "200px" }}
            />
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "0 20px" }}
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>

      {/* VERIFY TABLE */}
      <h4>Ongoing Stitching Tasks</h4>
      {activeTasks.length === 0 ? (
        <p style={{ color: "#888" }}>No active tasks.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", background: "#eee" }}>
              <th style={{ padding: "8px" }}>Employee</th>
              <th>Item</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeTasks.map((task) => (
              <tr
                key={task.id}
                style={{
                  borderBottom: "1px solid #eee",
                  background:
                    task.status === "pending_verification"
                      ? "#e8f8f5"
                      : "white",
                }}
              >
                <td style={{ padding: "10px" }}>{task.Employee?.username}</td>
                <td>
                  <b>{task.CuttingJob?.GarmentType?.name}</b> <br />
                  <small>
                    {task.CuttingJob?.Fabric?.sku} ({task.CuttingJob?.size}) -{" "}
                    {task.pieces_assigned} pcs
                  </small>
                </td>
                <td>
                  {task.status === "pending_verification" ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Ready for Check
                    </span>
                  ) : (
                    <span style={{ color: "orange" }}>In Progress</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-primary"
                    style={{
                      backgroundColor:
                        task.status === "pending_verification"
                          ? "#27ae60"
                          : "#95a5a6",
                      fontSize: "12px",
                      padding: "5px 10px",
                    }}
                    onClick={() => handleVerify(task.id)}
                  >
                    Verify & Finish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StitchingManager;
