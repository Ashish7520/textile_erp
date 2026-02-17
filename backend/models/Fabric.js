const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Fabric = sequelize.define("Fabric", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sku: {
    type: DataTypes.STRING, // e.g., "COTTON-001"
    allowNull: false,
    unique: true,
  },
  current_meters: {
    type: DataTypes.FLOAT, // Float allows decimals like 10.5 meters
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Fabric;
