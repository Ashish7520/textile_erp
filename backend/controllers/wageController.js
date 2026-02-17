// server/controllers/wageController.js
const {
  User,
  WagePayment,
  StitchingTask,
  CuttingJob,
  GarmentType,
} = require("../models");
const { Op } = require("sequelize");

// 1. Give Advance Payment (Owner Action)
exports.addPayment = async (req, res) => {
  try {
    const { userId, amount, type } = req.body;

    // Note: We use 'userId' (lowercase) here because Sequelize aliases it automatically during creation
    const payment = await WagePayment.create({
      UserId: userId, // Explicitly map to UserId to be safe
      amount,
      type,
    });

    res.json({ message: "Payment Recorded", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get Financial Summary for a User (Wage Card)
exports.getUserSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // --- THE FIX IS HERE ---
    // We must look for 'UserId' (Capital U) to match the database column
    const payments = await WagePayment.findAll({ where: { UserId: userId } });

    const totalAdvance = payments.reduce((sum, p) => sum + p.amount, 0);

    let totalEarned = 0;

    // B. Calculate Earnings based on Role
    if (user.role === "cutting_man") {
      totalEarned = user.fixed_salary || 0;
    } else if (user.role === "employee") {
      // Only count COMPLETED tasks (verified by manager)
      const tasks = await StitchingTask.findAll({
        where: {
          employeeId: userId,
          status: "completed",
        },
        include: [{ model: CuttingJob, include: [GarmentType] }],
      });

      totalEarned = tasks.reduce((sum, task) => {
        const price = task.CuttingJob?.GarmentType?.stitching_price || 0;
        return sum + task.pieces_assigned * price;
      }, 0);
    }

    const outstanding = totalEarned - totalAdvance;

    res.json({
      username: user.username,
      role: user.role,
      totalEarned,
      totalAdvance,
      outstanding,
    });
  } catch (err) {
    console.error("Wage Summary Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Get All Payments (History)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await WagePayment.findAll({
      include: [{ model: User, attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
