const express = require("express");
const router = express.Router();
const terminalController = require("../controllers/terminalController");
const uploadController = require("../controllers/uploadController");
const auth = require("../middleware/auth");
const { terminalValidation } = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");
const { upload } = require("../utils/fileUpload");

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

/**
 * @route   POST /api/terminals/:id/upload
 * @desc    Upload file for a terminal
 * @access  Private (Admin, Port, Master Port roles)
 */
router.post(
  "/:id/upload",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  upload.single("file"),
  (req, res) => {
    req.body.entityType = "terminal";
    req.body.entityId = req.params.id;
    uploadController.uploadFile(req, res);
  }
);

/**
 * @route   GET /api/terminals/:id/uploads
 * @desc    Get all uploads for a terminal
 * @access  Private
 */
router.get("/:id/uploads", (req, res) => {
  req.params.entityType = "terminal";
  req.params.entityId = req.params.id;
  uploadController.getEntityUploads(req, res);
});

/**
 * @route   GET /api/terminals/uploads/:uploadId/download
 * @desc    Download a specific upload file
 * @access  Private
 */
router.get("/uploads/:uploadId/download", (req, res) => {
  req.params.id = req.params.uploadId;
  uploadController.downloadFile(req, res);
});

/**
 * @route   DELETE /api/terminals/uploads/:uploadId
 * @desc    Delete a specific upload
 * @access  Private (Admin, Port, Master Port roles)
 */
router.delete(
  "/uploads/:uploadId",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  (req, res) => {
    req.params.id = req.params.uploadId;
    uploadController.deleteUpload(req, res);
  }
);

module.exports = router;
