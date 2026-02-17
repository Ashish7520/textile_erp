// client/src/components/WageCard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../config";

function WageCard({ userId }) {
  const [data, setData] = useState({
    totalEarned: 0,
    totalAdvance: 0,
    outstanding: 0,
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/api/wages/summary/${userId}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        background: "#2c3e50",
        color: "white",
        borderRadius: "8px",
        marginBottom: "20px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase" }}
        >
          Total Earnings (Verified)
        </div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f1c40f" }}>
          ₹{data.totalEarned.toLocaleString()}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          borderLeft: "1px solid #ffffff30",
          paddingLeft: "20px",
        }}
      >
        <div
          style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase" }}
        >
          Advance Taken
        </div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#e74c3c" }}>
          - ₹{data.totalAdvance.toLocaleString()}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          borderLeft: "1px solid #ffffff30",
          paddingLeft: "20px",
        }}
      >
        <div
          style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase" }}
        >
          Outstanding Balance
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: data.outstanding >= 0 ? "#2ecc71" : "#e74c3c",
          }}
        >
          ₹{data.outstanding.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default WageCard;
