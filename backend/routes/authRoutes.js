// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/role/:role", authController.getUsersByRole);

module.exports = router;
