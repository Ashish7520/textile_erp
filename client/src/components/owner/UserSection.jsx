// client/src/components/owner/UserSection.jsx
import { useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function UserSection() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cutting_man");
  const [salary, setSalary] = useState(""); // <--- NEW STATE

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        password,
        role,
        fixedSalary: role === "cutting_man" ? salary : 0, // Send salary only for cutter
      });
      alert("User Created Successfully!");
      setUsername("");
      setPassword("");
      setSalary("");
    } catch (err) {
      alert("Error creating user");
    }
  };

  return (
    <div className="section-card">
      <h3 className="section-title">👥 Staff Management</h3>
      <form
        onSubmit={handleCreate}
        style={{ display: "grid", gap: "15px", maxWidth: "400px" }}
      >
        <label>Create New Account</label>

        <input
          className="form-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="form-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="form-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="cutting_man">Cutting Man (Fixed Salary)</option>
          <option value="employee">Stitching Employee (Piece Rate)</option>
          <option value="owner">Owner</option>
        </select>

        {/* CONDITIONALLY SHOW SALARY INPUT */}
        {role === "cutting_man" && (
          <div
            style={{
              background: "#fdfdfd",
              padding: "10px",
              border: "1px dashed #ccc",
            }}
          >
            <label
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Monthly Fixed Salary (₹):
            </label>
            <input
              className="form-input"
              placeholder="e.g. 15000"
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>
        )}

        <button className="btn-primary">Create User</button>
      </form>
    </div>
  );
}

export default UserSection;
