// client/src/components/owner/RuleSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function RuleSection() {
  const [fabrics, setFabrics] = useState([]);

  // Form States
  const [selectedFabric, setSelectedFabric] = useState("");
  const [name, setName] = useState("");
  const [meters, setMeters] = useState("");
  const [price, setPrice] = useState(""); // New: Stitching Price
  const [image, setImage] = useState(null); // New: Image File

  useEffect(() => {
    axios.get(`${API_URL}/api/fabric`).then((res) => setFabrics(res.data));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    // We must use FormData for file uploads
    const formData = new FormData();
    formData.append("fabricId", selectedFabric);
    formData.append("name", name);
    formData.append("metersPerPiece", meters);
    formData.append("stitchingPrice", price);
    if (image) formData.append("image", image);

    try {
      await axios.post(`${API_URL}/api/fabric/garment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Rule & Image Added Successfully!");
      setName("");
      setMeters("");
      setPrice("");
      setImage(null);
    } catch (err) {
      alert("Error uploading rule");
    }
  };

  return (
    <div className="section-card">
      <h3 className="section-title">📏 Product & Wage Rules</h3>
      <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>
        Define product consumption, stitching wage, and upload a design photo.
      </p>

      <form
        onSubmit={handleAdd}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "500px",
        }}
      >
        <select
          className="form-input"
          value={selectedFabric}
          onChange={(e) => setSelectedFabric(e.target.value)}
          required
        >
          <option value="">1. Select Fabric</option>
          {fabrics.map((f) => (
            <option key={f.id} value={f.id}>
              {f.sku}
            </option>
          ))}
        </select>

        <input
          className="form-input"
          placeholder="Product Name (e.g. Nana DT)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            className="form-input"
            placeholder="Meters/Piece"
            type="number"
            step="0.01"
            value={meters}
            onChange={(e) => setMeters(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Stitching Price (₹)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Image Upload Input */}
        <div
          style={{
            border: "1px dashed #ccc",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Upload Design Photo:
          </label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
          />
        </div>

        <button className="btn-primary">Save Rule</button>
      </form>
    </div>
  );
}

export default RuleSection;
