// server/models/GarmentType.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GarmentType = sequelize.define("GarmentType", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  meters_per_piece: { type: DataTypes.FLOAT, allowNull: false },
  // --- NEW FIELDS ---
  image_url: { type: DataTypes.STRING, allowNull: true }, // URL to the image
  stitching_price: { type: DataTypes.FLOAT, defaultValue: 0 }, // Wage per piece
});

module.exports = GarmentType;
