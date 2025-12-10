const express = require("express");
const router = express.Router();
const portController = require("../controllers/portController");
const uploadController = require("../controllers/uploadController");
const auth = require("../middleware/auth");
const { portValidation } = require("../middleware/validation");
const rateLimiter = require("../middleware/rateLimiter");
const { upload } = require("../utils/fileUpload");

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

/**
 * @route   POST /api/ports/:id/upload
 * @desc    Upload file for a port
 * @access  Private (Admin, Port, Master Port roles)
 */
router.post(
  "/:id/upload",
  auth.requireRoles(["ADMIN", "PORT", "MASTER_PORT"]),
  upload.single("file"),
  (req, res) => {
    console.log(req.body);
    req.body.entityType = "port";
    req.body.entityId = req.params.id;
    uploadController.uploadFile(req, res);
  }
);

/**
 * @route   GET /api/ports/:id/uploads
 * @desc    Get all uploads for a port
 * @access  Private
 */
router.get("/:id/uploads", (req, res) => {
  req.params.entityType = "port";
  req.params.entityId = req.params.id;
  uploadController.getEntityUploads(req, res);
});

/**
 * @route   GET /api/ports/uploads/:uploadId/download
 * @desc    Download a specific upload file
 * @access  Private
 */
router.get("/uploads/:uploadId/download", (req, res) => {
  req.params.id = req.params.uploadId;
  uploadController.downloadFile(req, res);
});

/**
 * @route   DELETE /api/ports/uploads/:uploadId
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
