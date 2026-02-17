// client/src/components/owner/CreateJobSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function CreateJobSection() {
  const [fabrics, setFabrics] = useState([]);
  const [cutters, setCutters] = useState([]);

  // Form States
  const [fabricId, setFabricId] = useState("");
  const [garments, setGarments] = useState([]);
  const [garmentId, setGarmentId] = useState("");
  const [cutterId, setCutterId] = useState("");
  const [size, setSize] = useState("");
  const [pieces, setPieces] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/api/fabric`).then((res) => setFabrics(res.data));
    axios
      .get(`${API_URL}/auth/role/cutting_man`)
      .then((res) => setCutters(res.data));
  }, []);

  const handleFabricChange = async (fid) => {
    setFabricId(fid);
    setGarments([]);
    if (fid) {
      const res = await axios.get(`${API_URL}/api/fabric/${fid}/garments`);
      setGarments(res.data);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    const fab = fabrics.find((f) => f.id == fabricId);
    try {
      await axios.post(`${API_URL}/api/cutting/create`, {
        sku: fab.sku,
        garmentId,
        pieces,
        size,
        cutterId,
      });
      alert("Job Started!");
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div className="section-card" style={{ borderLeft: "5px solid #667eea" }}>
      <h3 className="section-title">✂️ Start New Cutting Job</h3>
      <form
        onSubmit={handleStart}
        className="add-fabric-form"
        style={{ flexDirection: "column" }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="form-input"
            value={fabricId}
            onChange={(e) => handleFabricChange(e.target.value)}
            required
          >
            <option value="">1. Select Fabric</option>
            {fabrics.map((f) => (
              <option key={f.id} value={f.id}>
                {f.sku}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            value={garmentId}
            onChange={(e) => setGarmentId(e.target.value)}
            required
            disabled={!fabricId}
          >
            <option value="">2. Select Garment Type</option>
            {garments.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.meters_per_piece}m)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="form-input"
            value={cutterId}
            onChange={(e) => setCutterId(e.target.value)}
            required
          >
            <option value="">Assign To...</option>
            {cutters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.username}
              </option>
            ))}
          </select>
          <input
            className="form-input"
            placeholder="Size (e.g. L)"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Total Pieces"
            type="number"
            value={pieces}
            onChange={(e) => setPieces(e.target.value)}
            required
          />
        </div>

        <button className="btn-primary" style={{ marginTop: "10px" }}>
          Confirm & Assign Job
        </button>
      </form>
    </div>
  );
}

export default CreateJobSection;
