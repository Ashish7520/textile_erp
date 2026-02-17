// server/controllers/fabricController.js
const { Fabric, GarmentType } = require("../models");

// 1. Get All Fabrics
exports.getAllFabrics = async (req, res) => {
  try {
    const fabrics = await Fabric.findAll();
    res.json(fabrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Add New Fabric (Raw Material)
exports.addFabric = async (req, res) => {
  try {
    const { sku, meters } = req.body;
    // Check if exists
    let fabric = await Fabric.findOne({ where: { sku } });

    if (fabric) {
      // Update existing
      fabric.current_meters =
        parseFloat(fabric.current_meters) + parseFloat(meters);
      await fabric.save();
    } else {
      // Create new
      fabric = await Fabric.create({ sku, current_meters: meters });
    }
    res.json({ message: "Stock Updated", fabric });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Add Garment Rule (Product Definition)
exports.addGarmentType = async (req, res) => {
  try {
    const { fabricId, name, metersPerPiece, stitchingPrice } = req.body;

    // Handle Image Path (if an image was uploaded)
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const garment = await GarmentType.create({
      FabricId: fabricId,
      name: name,
      meters_per_piece: metersPerPiece,
      stitching_price: stitchingPrice || 0, // Default to 0 if empty
      image_url: imagePath,
    });

    res.json({ message: "Rule Added Successfully", garment });
  } catch (err) {
    console.error("Error adding garment:", err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Get Garments for a Fabric
exports.getGarmentsByFabric = async (req, res) => {
  try {
    const { fabricId } = req.params;
    const garments = await GarmentType.findAll({
      where: { FabricId: fabricId },
    });
    res.json(garments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
