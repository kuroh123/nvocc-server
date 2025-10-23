const express = require("express");
const router = express.Router();
const {
  getAllCommodities,
  getCommodityById,
  getCommoditiesByCargoId,
  createCommodity,
  updateCommodity,
  deleteCommodity,
} = require("../controllers/commodityController");

// Commodity routes
router.get("/", getAllCommodities);
router.get("/cargo/:cargoId", getCommoditiesByCargoId);
router.get("/:id", getCommodityById);
router.post("/", createCommodity);
router.put("/:id", updateCommodity);
router.delete("/:id", deleteCommodity);

module.exports = router;
