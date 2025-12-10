const express = require("express");
const router = express.Router();
const {
  getAllTariffs,
  getTariffById,
  getTariffsByEventType,
  getTariffsByProductType,
  searchTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
} = require("../controllers/tariffController");

// Tariff routes
router.get("/", getAllTariffs);
router.get("/search", searchTariffs);
router.get("/event/:eventType", getTariffsByEventType);
router.get("/product/:productType", getTariffsByProductType);
router.get("/:id", getTariffById);
router.post("/", createTariff);
router.put("/:id", updateTariff);
router.delete("/:id", deleteTariff);

module.exports = router;
