// server/routes/fabricRoutes.js
const express = require("express");
const router = express.Router();
const fabricController = require("../controllers/fabricController");
const multer = require("multer");
const path = require("path");

// --- 1. CONFIGURE IMAGE UPLOAD (Multer) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Name file: fieldname-timestamp.jpg
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

// --- 2. DEFINE ROUTES ---

// Get all fabrics
router.get("/", fabricController.getAllFabrics);

// Add new fabric (Raw Material)
router.post("/add", fabricController.addFabric);

// Add new Garment Rule (Product) + IMAGE UPLOAD
// Note: We add 'upload.single('image')' middleware here
router.post(
  "/garment",
  upload.single("image"),
  fabricController.addGarmentType,
);

// Get Garment Rules for a specific fabric
router.get("/:fabricId/garments", fabricController.getGarmentsByFabric);

module.exports = router;
