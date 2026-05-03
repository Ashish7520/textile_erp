// server/routes/cuttingRoutes.js
const express = require("express");
const router = express.Router();
const cuttingController = require("../controllers/cuttingController");

// These MUST match the 5 "exports.____" names in the controller exactly!
router.post("/create", cuttingController.createJob);
router.get("/pending", cuttingController.getPendingJobs);
router.get("/my-jobs/:cutterId", cuttingController.getMyJobs);
router.post("/finish", cuttingController.finishJob);
router.get("/history/:cutterId", cuttingController.getCuttingHistory);

module.exports = router;
