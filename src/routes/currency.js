const express = require("express");
const router = express.Router();
const {
  getAllCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} = require("../controllers/currencyController");

// Currency routes
router.get("/", getAllCurrencies);
router.get("/:id", getCurrencyById);
router.post("/", createCurrency);
router.put("/:id", updateCurrency);
router.delete("/:id", deleteCurrency);

module.exports = router;
