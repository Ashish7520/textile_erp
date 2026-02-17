// server/controllers/cuttingController.js
const { CuttingJob, Fabric, User, GarmentType } = require("../models");

// 1. Create a SMART Job (Auto-Calculate Meters)
exports.createJob = async (req, res) => {
  try {
    console.log("--- STARTING CREATE JOB ---");
    console.log("Received Body:", req.body); // DEBUG 1

    const { sku, garmentId, pieces, cutterId, size } = req.body;

    // Validation
    if (!garmentId) {
      console.log("ERROR: garmentId is missing!");
      return res.status(400).json({ error: "Please select a Garment Type" });
    }

    // 1. Get the Garment Rule
    const garment = await GarmentType.findByPk(garmentId);
    if (!garment)
      return res.status(404).json({ error: "Garment Type not found in DB" });

    console.log("Found Garment:", garment.name, "ID:", garment.id); // DEBUG 2

    // 2. Find the Fabric
    const fabric = await Fabric.findOne({ where: { sku } });
    if (!fabric) return res.status(404).json({ error: "Fabric SKU not found" });

    // 3. Auto-Calculate
    const calculatedMeters = garment.meters_per_piece * pieces;

    // 4. Create Job
    const job = await CuttingJob.create({
      size: size,
      planned_pieces: pieces,
      meters_used: calculatedMeters,
      status: "pending",
      FabricId: fabric.id,
      // --- CRITICAL FIX: Ensure this exact spelling matches your DB Column ---
      GarmentTypeId: garment.id,
      assignedToId: cutterId,
    });

    console.log(
      "Job Created Successfully with GarmentTypeId:",
      job.GarmentTypeId,
    ); // DEBUG 3

    res.json({
      message: "Job Started",
      job,
      estimatedMeters: calculatedMeters,
    });
  } catch (err) {
    console.error("CREATE JOB ERROR:", err); // DEBUG 4
    res.status(500).json({ error: err.message });
  }
};

// 2. Finish Job (Deduct Stock)
exports.finishJob = async (req, res) => {
  try {
    const { jobId, metersUsed } = req.body;
    const job = await CuttingJob.findByPk(jobId, { include: Fabric });

    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.status === "completed")
      return res.status(400).json({ error: "Job already completed" });

    const fabric = job.Fabric;
    fabric.current_meters -= parseFloat(metersUsed);
    await fabric.save();

    job.meters_used = metersUsed;
    job.status = "completed";
    await job.save();

    res.json({
      message: "Cutting Completed",
      remaining_stock: fabric.current_meters,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Jobs for a specific Cutter
exports.getMyJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    const jobs = await CuttingJob.findAll({
      where: { assignedToId: userId },
      include: [Fabric, GarmentType],
      order: [["createdAt", "DESC"]], // Newest first
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Get ALL pending jobs (For Owner Overview)
exports.getAllPendingJobs = async (req, res) => {
  try {
    const jobs = await CuttingJob.findAll({
      where: { status: "pending" },
      include: [
        Fabric,
        GarmentType,
        { model: User, as: "Cutter", attributes: ["username"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Get Completed Jobs (For Stitching Dropdown)
exports.getCompletedJobs = async (req, res) => {
  try {
    const jobs = await CuttingJob.findAll({
      where: { status: "completed" },
      include: [Fabric, GarmentType],
      order: [["updatedAt", "DESC"]],
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
