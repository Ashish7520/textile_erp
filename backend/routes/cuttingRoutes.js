// server/routes/cuttingRoutes.js
const express = require("express");
const router = express.Router();
const cuttingController = require("../controllers/cuttingController");

// Create a job (Start work)
router.post("/create", cuttingController.createJob);

// Finish a job (Enter meters used)
router.post("/finish", cuttingController.finishJob);

// Get my jobs
router.get("/my-jobs/:userId", cuttingController.getMyJobs);
router.get("/all-pending", cuttingController.getAllPendingJobs);
router.get("/completed", cuttingController.getCompletedJobs);

module.exports = router;
