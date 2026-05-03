// server/routes/stitchingRoutes.js
const express = require("express");
const router = express.Router();
const stitchingController = require("../controllers/stitchingController");

router.post("/assign", stitchingController.assignTask);
router.post("/complete", stitchingController.completeTask); // Manager Verify
router.post("/work-done", stitchingController.markWorkDone); // Employee Done <--- NEW
router.get("/employee/:employeeId", stitchingController.getEmployeeTasks);
router.get("/all", stitchingController.getAllStitching);
router.get("/stock", stitchingController.getStitchingStock);
router.get("/history/:employeeId", stitchingController.getEmployeeHistory);

module.exports = router;
