const express = require("express");
const router = express.Router();
const {
  getAllCharges,
  getChargeById,
  createCharge,
  updateCharge,
  deleteCharge,
} = require("../controllers/chargeController");

// Charge routes
router.get("/", getAllCharges);
router.get("/:id", getChargeById);
router.post("/", createCharge);
router.put("/:id", updateCharge);
router.delete("/:id", deleteCharge);

module.exports = router;
