const express = require("express");
const router = express.Router();
const {
  getAllCurrencyExchangeRates,
  getCurrencyExchangeRateById,
  getLatestExchangeRate,
  createCurrencyExchangeRate,
  updateCurrencyExchangeRate,
  deleteCurrencyExchangeRate,
} = require("../controllers/currencyExchangeRateController");

// Currency Exchange Rate routes
router.get("/", getAllCurrencyExchangeRates);
router.get("/latest", getLatestExchangeRate);
router.get("/:id", getCurrencyExchangeRateById);
router.post("/", createCurrencyExchangeRate);
router.put("/:id", updateCurrencyExchangeRate);
router.delete("/:id", deleteCurrencyExchangeRate);

module.exports = router;
