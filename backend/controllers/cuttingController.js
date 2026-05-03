// server/controllers/cuttingController.js
const { CuttingJob, Fabric, GarmentType, User } = require("../models");

// 1. Create a new Cutting Job
exports.createJob = async (req, res) => {
  try {
    const { sku, garmentId, pieces, size, cutterId } = req.body;
    const fabric = await Fabric.findOne({ where: { sku } });
    const garment = await GarmentType.findByPk(garmentId);

    if (!fabric || !garment) {
      return res
        .status(404)
        .json({ error: "Fabric or Garment Rule not found" });
    }

    const job = await CuttingJob.create({
      FabricId: fabric.id,
      GarmentTypeId: garmentId,

      // Save the ID to assignedToId (as per your SQL DB)
      assignedToId: cutterId,

      planned_pieces: pieces,
      size: size,
      status: "pending",
    });

    res.json({ message: "Cutting Job Assigned", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get Pending Jobs
exports.getPendingJobs = async (req, res) => {
  try {
    const jobs = await CuttingJob.findAll({
      where: { status: "pending" },
      include: [Fabric, GarmentType, { model: User, as: "Cutter" }],
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Active Jobs for a specific Cutter
exports.getMyJobs = async (req, res) => {
  try {
    const { cutterId } = req.params;
    const jobs = await CuttingJob.findAll({
      // FIX: Search specifically in the 'assignedToId' column!
      where: { assignedToId: cutterId, status: "pending" },
      include: [Fabric, GarmentType],
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Finish a Cutting Job
exports.finishJob = async (req, res) => {
  try {
    const { jobId, metersUsed } = req.body;
    const job = await CuttingJob.findByPk(jobId, { include: [Fabric] });

    if (!job) return res.status(404).json({ error: "Job not found" });

    job.status = "completed";
    job.meters_used = metersUsed ? parseFloat(metersUsed) : 0;
    await job.save();

    if (job.Fabric) {
      const fabric = job.Fabric;
      fabric.current_meters =
        Number(fabric.current_meters) - Number(job.meters_used);
      await fabric.save();
    }

    res.json({ message: "Job Completed and Inventory Deducted", job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Get Completed Work History
exports.getCuttingHistory = async (req, res) => {
  try {
    const { cutterId } = req.params;
    const history = await CuttingJob.findAll({
      // FIX: Search specifically in the 'assignedToId' column!
      where: { assignedToId: cutterId, status: "completed" },
      include: [GarmentType, Fabric],
      order: [["updatedAt", "DESC"]],
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
