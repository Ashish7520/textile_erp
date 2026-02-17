// server/models/StitchingTask.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StitchingTask = sequelize.define("StitchingTask", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pieces_assigned: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    // CHANGED TO STRING to prevent "Data Truncated" errors
    // This allows 'in_progress', 'pending_verification', 'completed'
    type: DataTypes.STRING,
    defaultValue: "in_progress",
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Foreign Keys (employeeId, CuttingJobId) are added by index.js automatically
});

module.exports = StitchingTask;
