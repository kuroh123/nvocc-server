const express = require("express");
const router = express.Router();
const terminalController = require("../controllers/terminalController");
const auth = require("../middleware/auth");
const { terminalValidation } = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");

// Apply authentication to all routes
router.use(auth.authenticateToken);

/**
 * @route   GET /api/terminals
 * @desc    Get all terminals with pagination and filtering
 * @access  Private
 * @params  ?page=1&limit=10&search=term&status=ACTIVE&portId=123
 */
router.get("/", terminalValidation.getAll, terminalController.getAllTerminals);

/**
 * @route   GET /api/terminals/:id
 * @desc    Get a single terminal by ID
 * @access  Private
 */
router.get(
  "/:id",
  terminalValidation.getById,
  terminalController.getTerminalById
);

/**
 * @route   GET /api/terminals/port/:portId
 * @desc    Get all active terminals by port
 * @access  Private
 */
router.get(
  "/port/:portId",
  terminalValidation.getByPort,
  terminalController.getTerminalsByPort
);

/**
 * @route   POST /api/terminals
 * @desc    Create a new terminal
 * @access  Private (Admin, Port, Master Port roles)
 */
router.post(
  "/",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  terminalValidation.create,
  terminalController.createTerminal
);

/**
 * @route   PUT /api/terminals/:id
 * @desc    Update an existing terminal
 * @access  Private (Admin, Port, Master Port roles)
 */
router.put(
  "/:id",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  terminalValidation.update,
  terminalController.updateTerminal
);

/**
 * @route   DELETE /api/terminals/:id
 * @desc    Delete a terminal
 * @access  Private (Admin, Master Port roles only)
 */
router.delete(
  "/:id",
  auth.requireRoles(["ADMIN", "MASTER_PORT"]),
  terminalValidation.delete,
  terminalController.deleteTerminal
);

module.exports = router;
