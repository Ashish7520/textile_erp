import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";

function CuttingOverview() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/cutting/pending`);
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs", err);
      }
    };
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="section-card">
      <h3 className="section-title">✂️ Cutting Department Overview</h3>
      {jobs.length === 0 ? (
        <p>No pending cutting jobs.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>ID</th>
              <th>Product</th>
              <th>Fabric</th>
              <th>Size</th>
              <th>Pieces</th>
              <th>Assigned To</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>#{job.id}</td>
                <td style={{ fontWeight: "bold" }}>
                  {job.GarmentType?.name || "-"}
                </td>
                <td>{job.Fabric?.sku}</td>
                <td>{job.size}</td>
                <td>{job.planned_pieces}</td>
                <td>{job.Cutter?.username || "Unassigned"}</td>
                <td style={{ color: "orange" }}>Pending</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default CuttingOverview;
