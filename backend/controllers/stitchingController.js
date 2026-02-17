// server/controllers/stitchingController.js
const {
  StitchingTask,
  CuttingJob,
  User,
  Fabric,
  GarmentType,
} = require("../models");
const { Op } = require("sequelize");

// 1. Get Aggregated Stock (For Dropdown)
exports.getStitchingStock = async (req, res) => {
  try {
    const cutJobs = await CuttingJob.findAll({
      where: { status: "completed" },
      include: [GarmentType, Fabric],
    });

    const stitchedTasks = await StitchingTask.findAll();

    let stockMap = {};

    cutJobs.forEach((job) => {
      const assignedCount = stitchedTasks
        .filter((t) => t.CuttingJobId === job.id)
        .reduce((sum, t) => sum + t.pieces_assigned, 0);

      const remaining = job.planned_pieces - assignedCount;

      if (remaining > 0) {
        const key = `${job.GarmentTypeId}-${job.size}`;
        if (!stockMap[key]) {
          stockMap[key] = {
            garmentId: job.GarmentTypeId,
            garmentName: job.GarmentType?.name || "Unknown",
            fabricName: job.Fabric?.sku,
            size: job.size,
            totalAvailable: 0,
          };
        }
        stockMap[key].totalAvailable += remaining;
      }
    });

    const stockList = Object.values(stockMap);
    res.json(stockList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Smart Assign
exports.assignTask = async (req, res) => {
  try {
    const { garmentId, size, employeeId, pieces } = req.body;
    let piecesToAssign = parseInt(pieces);

    const eligibleJobs = await CuttingJob.findAll({
      where: { GarmentTypeId: garmentId, size: size, status: "completed" },
      order: [["createdAt", "ASC"]],
    });

    if (eligibleJobs.length === 0)
      return res.status(404).json({ error: "No stock found" });

    const allTasks = await StitchingTask.findAll({
      where: { CuttingJobId: eligibleJobs.map((j) => j.id) },
    });

    const createdTasks = [];

    for (const job of eligibleJobs) {
      if (piecesToAssign <= 0) break;

      const used = allTasks
        .filter((t) => t.CuttingJobId === job.id)
        .reduce((sum, t) => sum + t.pieces_assigned, 0);

      const availableInJob = job.planned_pieces - used;

      if (availableInJob > 0) {
        const take = Math.min(piecesToAssign, availableInJob);

        const newTask = await StitchingTask.create({
          pieces_assigned: take,
          status: "in_progress",
          CuttingJobId: job.id,
          employeeId: employeeId,
        });

        createdTasks.push(newTask);
        piecesToAssign -= take;
      }
    }

    if (piecesToAssign > 0) {
      return res
        .status(400)
        .json({ error: `Shortage of ${piecesToAssign} pcs.` });
    }

    res.json({
      message: "Stitching Assigned Successfully",
      tasks: createdTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Tasks for Employee (Shows 'in_progress' AND 'pending_verification')
exports.getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const tasks = await StitchingTask.findAll({
      where: {
        employeeId,
        // Show both Active and Waiting for Check
        status: { [Op.or]: ["in_progress", "pending_verification"] },
      },
      include: [{ model: CuttingJob, include: [Fabric, GarmentType] }],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Mark Work Done (Employee Action)
exports.markWorkDone = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await StitchingTask.findByPk(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = "pending_verification"; // <--- NEW STATUS
    await task.save();

    res.json({ message: "Marked as Done. Waiting for verification." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Complete/Verify Task (Owner Action)
exports.completeTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    const task = await StitchingTask.findByPk(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.status = "completed";
    task.verifiedById = userId;
    task.completed_at = new Date();
    await task.save();

    res.json({ message: "Verified & Completed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Get All Active Stitching (For Owner Overview)
exports.getAllStitching = async (req, res) => {
  try {
    const tasks = await StitchingTask.findAll({
      where: { status: { [Op.or]: ["in_progress", "pending_verification"] } },
      include: [
        { model: User, as: "Employee", attributes: ["username"] },
        { model: CuttingJob, include: [Fabric, GarmentType] },
      ],
      order: [["status", "DESC"]], // Show 'pending_verification' first usually
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
