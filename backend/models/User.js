// server/models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("owner", "cutting_man", "employee"),
    allowNull: false,
  },
  // --- NEW: Fixed Salary (Only for Cutting Man mostly) ---
  fixed_salary: { type: DataTypes.FLOAT, defaultValue: 0 },
});

module.exports = User;
