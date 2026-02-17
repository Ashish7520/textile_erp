// server/routes/wageRoutes.js
const express = require("express");
const router = express.Router();
const wageController = require("../controllers/wageController");

// Route to get a specific user's wage summary
router.get("/summary/:userId", wageController.getUserSummary);

// Route to record a payment (Advance)
router.post("/pay", wageController.addPayment);

// Route to get payment history
router.get("/history", wageController.getAllPayments);

module.exports = router;
