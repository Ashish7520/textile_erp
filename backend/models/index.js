// server/models/index.js
const sequelize = require("../config/db");
const User = require("./User");
const Fabric = require("./Fabric");
const CuttingJob = require("./CuttingJob");
const StitchingTask = require("./StitchingTask");
const GarmentType = require("./GarmentType");
const WagePayment = require("./WagePayment");

// --- Define Relationships ---

// 1. Fabric -> Garment Rules (e.g. Crepe has "Kurti", "Top")
Fabric.hasMany(GarmentType);
GarmentType.belongsTo(Fabric);

// 2. Fabric -> Cutting Jobs (Tracking raw material)
Fabric.hasMany(CuttingJob);
CuttingJob.belongsTo(Fabric);

// 3. Garment Type -> Cutting Jobs (Tracking what product was made)
// --- THIS WAS MISSING ---
GarmentType.hasMany(CuttingJob);
CuttingJob.belongsTo(GarmentType);
// ------------------------

// 4. User (Owner/Cutter) -> Creates Job
User.hasMany(CuttingJob, { as: "CreatedJobs", foreignKey: "creatorId" });
CuttingJob.belongsTo(User, { as: "Creator", foreignKey: "creatorId" });

// 5. User (Cutter) -> Assigned Job
User.hasMany(CuttingJob, { as: "AssignedCuts", foreignKey: "assignedToId" });
CuttingJob.belongsTo(User, { as: "Cutter", foreignKey: "assignedToId" });

// 6. Cutting Job -> Stitching Tasks
CuttingJob.hasMany(StitchingTask);
StitchingTask.belongsTo(CuttingJob);

// 7. User (Employee) -> Doing Stitching
User.hasMany(StitchingTask, { as: "SewingTasks", foreignKey: "employeeId" });
StitchingTask.belongsTo(User, { as: "Employee", foreignKey: "employeeId" });

// 8. User (Owner/Cutter) -> Verifies Stitching
User.hasMany(StitchingTask, {
  as: "VerifiedTasks",
  foreignKey: "verifiedById",
});
StitchingTask.belongsTo(User, { as: "Verifier", foreignKey: "verifiedById" });

// Sync Database
const initDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database Synced Successfully");
  } catch (err) {
    console.error("Database Sync Error:", err);
  }
};

User.hasMany(WagePayment);
WagePayment.belongsTo(User);

module.exports = {
  sequelize,
  initDB,
  User,
  Fabric,
  CuttingJob,
  StitchingTask,
  GarmentType,
  WagePayment,
};
