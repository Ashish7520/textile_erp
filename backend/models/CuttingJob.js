const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CuttingJob = sequelize.define("CuttingJob", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  size: {
    type: DataTypes.STRING, // e.g., "M", "L", "XL"
    allowNull: false,
  },
  planned_pieces: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  meters_used: {
    type: DataTypes.FLOAT,
    allowNull: true, // It is null when job starts, filled when job ends
  },
  status: {
    type: DataTypes.ENUM("pending", "completed"),
    defaultValue: "pending",
  },
  // Note: Foreign keys (fabricId, creatorId) are added automatically by index.js
});

module.exports = CuttingJob;
