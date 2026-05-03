// server/controllers/authController.js
const { User } = require("../models");
const jwt = require("jsonwebtoken");

// 1. REGISTER USER
exports.register = async (req, res) => {
  try {
    const { username, password, role, fixedSalary } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing)
      return res.status(400).json({ error: "Username already taken" });

    const user = await User.create({
      username,
      password: password,
      role,
      fixed_salary: fixedSalary || 0,
    });

    res.json({ message: "User registered successfully", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "YOUR_SECRET_KEY",
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token: token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET USERS BY ROLE (THE FIX IS HERE)
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.findAll({
      where: { role },
      // WE ADDED 'role' HERE SO THE FRONTEND DOES NOT CRASH!
      attributes: ["id", "username", "role", "fixed_salary"],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. SEED ADMIN
exports.seedAdmin = async () => {
  try {
    const admin = await User.findOne({ where: { role: "owner" } });
    if (!admin) {
      console.log("No owner found. Creating default 'admin' user...");
      await User.create({
        username: "admin",
        password: "admin123",
        role: "owner",
      });
      console.log("Admin seeded successfully. Login: admin / admin123");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
};
