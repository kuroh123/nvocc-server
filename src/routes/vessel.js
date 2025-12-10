const express = require("express");
const router = express.Router();
const {
  getAllVessels,
  getVesselById,
  createVessel,
  updateVessel,
  deleteVessel,
} = require("../controllers/vesselController");

// Vessel routes
router.get("/", getAllVessels);
router.get("/:id", getVesselById);
router.post("/", createVessel);
router.put("/:id", updateVessel);
router.delete("/:id", deleteVessel);

module.exports = router;
