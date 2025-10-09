const express = require("express");
const router = express.Router();
const countryController = require("../controllers/countryController");
const auth = require("../middleware/auth");
const { countryValidation } = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");

// Apply authentication to all routes
router.use(auth.authenticateToken);

/**
 * @route   GET /api/countries
 * @desc    Get all countries with pagination and filtering
 * @access  Private
 * @params  ?page=1&limit=10&search=term&status=ACTIVE
 */
router.get("/", countryValidation.getAll, countryController.getAllCountries);

/**
 * @route   GET /api/countries/:id
 * @desc    Get a single country by ID with its ports and terminals
 * @access  Private
 */
router.get("/:id", countryValidation.getById, countryController.getCountryById);

module.exports = router;
