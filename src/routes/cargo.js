const express = require("express");
const router = express.Router();
const {
  getAllCargo,
  getCargoById,
  createCargo,
  updateCargo,
  deleteCargo,
} = require("../controllers/cargoController");

// Cargo routes
router.get("/", getAllCargo);
router.get("/:id", getCargoById);
router.post("/", createCargo);
router.put("/:id", updateCargo);
router.delete("/:id", deleteCargo);

module.exports = router;
