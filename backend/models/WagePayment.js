// server/models/WagePayment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const WagePayment = sequelize.define("WagePayment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  type: { type: DataTypes.ENUM("advance", "salary"), defaultValue: "advance" },
  // Foreign Key 'userId' will link to the employee receiving money
});

module.exports = WagePayment;
