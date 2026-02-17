// client/src/components/owner/InventorySection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function InventorySection() {
  const [fabrics, setFabrics] = useState([]);
  const [sku, setSku] = useState("");
  const [meters, setMeters] = useState("");
  const [isNew, setIsNew] = useState(false);

  const loadFabrics = () => {
    axios.get(`${API_URL}/api/fabric`).then((res) => setFabrics(res.data));
  };

  useEffect(() => {
    loadFabrics();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/fabric/add`, { sku, meters });
      alert("Stock Updated");
      setSku("");
      setMeters("");
      loadFabrics();
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div className="section-card">
      <h3 className="section-title">📦 Fabric Inventory</h3>

      {/* Add Form */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          background: "#fdfdfd",
          border: "1px solid #eee",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => {
              setIsNew(false);
              setSku("");
            }}
            style={{
              marginRight: "5px",
              fontWeight: !isNew ? "bold" : "normal",
            }}
          >
            Existing
          </button>
          <button
            onClick={() => {
              setIsNew(true);
              setSku("");
            }}
            style={{ fontWeight: isNew ? "bold" : "normal" }}
          >
            + New SKU
          </button>
        </div>
        <form onSubmit={handleAdd} className="add-fabric-form">
          {!isNew ? (
            <select
              className="form-input"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            >
              <option value="">Select Fabric</option>
              {fabrics.map((f) => (
                <option key={f.id} value={f.sku}>
                  {f.sku}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="form-input"
              placeholder="New SKU Name"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          )}
          <input
            className="form-input"
            placeholder="Meters"
            type="number"
            value={meters}
            onChange={(e) => setMeters(e.target.value)}
            required
          />
          <button className="btn-primary">Update</button>
        </form>
      </div>

      {/* List */}
      <ul className="inventory-list">
        {fabrics.map((f) => (
          <li key={f.id} className="inventory-item">
            <span className="sku-badge">{f.sku}</span>
            <span
              className={f.current_meters < 0 ? "error-msg" : "meters-text"}
            >
              {f.current_meters} Meters
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InventorySection;
