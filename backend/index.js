// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const authController = require("./controllers/authController");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const fabricRoutes = require("./routes/fabricRoutes");
const cuttingRoutes = require("./routes/cuttingRoutes"); // <--- NEW LINE
const stitchingRoutes = require("./routes/stitchingRoutes");

const wageRoutes = require("./routes/wageRoutes"); // New Route
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Use Routes
app.use("/auth", authRoutes);
app.use("/api/fabric", fabricRoutes);
app.use("/api/cutting", cuttingRoutes); // <--- NEW LINE
app.use("/api/stitching", stitchingRoutes);

// Allow access to uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/wages", wageRoutes);

// Ensure 'uploads' folder exists
const fs = require("fs");
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.sync({ alter: true });
    await authController.seedAdmin();
    console.log("Database connected and synced!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
});
