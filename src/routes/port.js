const express = require("express");
const router = express.Router();
const portController = require("../controllers/portController");
const auth = require("../middleware/auth");
const { portValidation } = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");

// Apply authentication to all routes
router.use(auth.authenticateToken);

/**
 * @route   GET /api/ports
 * @desc    Get all ports with pagination and filtering
 * @access  Private
 * @params  ?page=1&limit=10&search=term&status=ACTIVE&portType=SEA_PORT&countryId=123
 */
router.get("/", portValidation.getAll, portController.getAllPorts);

/**
 * @route   GET /api/ports/:id
 * @desc    Get a single port by ID
 * @access  Private
 */
router.get("/:id", portValidation.getById, portController.getPortById);

/**
 * @route   GET /api/ports/country/:countryId
 * @desc    Get all active ports by country
 * @access  Private
 */
router.get(
  "/country/:countryId",
  portValidation.getByCountry,
  portController.getPortsByCountry
);

/**
 * @route   POST /api/ports
 * @desc    Create a new port
 * @access  Private (Admin, Port, Master Port roles)
 */
router.post(
  "/",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  portValidation.create,
  portController.createPort
);

/**
 * @route   PUT /api/ports/:id
 * @desc    Update an existing port
 * @access  Private (Admin, Port, Master Port roles)
 */
router.put(
  "/:id",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  portValidation.update,
  portController.updatePort
);

/**
 * @route   DELETE /api/ports/:id
 * @desc    Delete a port
 * @access  Private (Admin, Master Port roles only)
 */
router.delete(
  "/:id",
  auth.requireRoles(["ADMIN", "MASTER_PORT"]),
  portValidation.delete,
  portController.deletePort
);

module.exports = router;
