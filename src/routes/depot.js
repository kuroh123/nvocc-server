const express = require("express");
const router = express.Router();
const {
  getAllDepots,
  getDepotById,
  getDepotsByPortId,
  createDepot,
  updateDepot,
  deleteDepot,
} = require("../controllers/depotController");

// Depot routes
router.get("/", getAllDepots);
router.get("/port/:portId", getDepotsByPortId);
router.get("/:id", getDepotById);
router.post("/", createDepot);
router.put("/:id", updateDepot);
router.delete("/:id", deleteDepot);

module.exports = router;
