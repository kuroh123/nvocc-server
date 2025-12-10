const express = require("express");
const router = express.Router();
const {
  getAllVesselSchedules,
  getVesselScheduleById,
  getSchedulesByVesselId,
  createVesselSchedule,
  updateVesselSchedule,
  deleteVesselSchedule,
} = require("../controllers/vesselScheduleController");

// Vessel Schedule routes
router.get("/", getAllVesselSchedules);
router.get("/vessel/:vesselId", getSchedulesByVesselId);
router.get("/:id", getVesselScheduleById);
router.post("/", createVesselSchedule);
router.put("/:id", updateVesselSchedule);
router.delete("/:id", deleteVesselSchedule);

module.exports = router;
