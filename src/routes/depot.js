const express = require("express");
const router = express.Router();
const {
  getAllDepots,
  getDepotById,
  getDepotsByPortId,
  createDepot,
  updateDepot,
  deleteDepot,
} = require("../controllers/depotController");
const uploadController = require("../controllers/uploadController");
const auth = require("../middleware/auth");
const { upload } = require("../utils/fileUpload");

// Apply authentication to all routes
router.use(auth.authenticateToken);

// Depot routes
router.get("/", getAllDepots);
router.get("/port/:portId", getDepotsByPortId);
router.get("/:id", getDepotById);
router.post("/", auth.requireRoles(["ADMIN", "DEPOT"]), createDepot);
router.put("/:id", auth.requireRoles(["ADMIN", "DEPOT"]), updateDepot);
router.delete("/:id", auth.requireRoles(["ADMIN"]), deleteDepot);

/**
 * @route   POST /api/depots/:id/upload
 * @desc    Upload file for a depot
 * @access  Private (Admin, Depot roles)
 */
router.post(
  "/:id/upload",
  auth.requireRoles(["ADMIN", "DEPOT"]),
  upload.single("file"),
  (req, res) => {
    req.body.entityType = "depot";
    req.body.entityId = req.params.id;
    uploadController.uploadFile(req, res);
  }
);

/**
 * @route   GET /api/depots/:id/uploads
 * @desc    Get all uploads for a depot
 * @access  Private
 */
router.get("/:id/uploads", (req, res) => {
  req.params.entityType = "depot";
  req.params.entityId = req.params.id;
  uploadController.getEntityUploads(req, res);
});

/**
 * @route   GET /api/depots/uploads/:uploadId/download
 * @desc    Download a specific upload file
 * @access  Private
 */
router.get("/uploads/:uploadId/download", (req, res) => {
  req.params.id = req.params.uploadId;
  uploadController.downloadFile(req, res);
});

/**
 * @route   DELETE /api/depots/uploads/:uploadId
 * @desc    Delete a specific upload
 * @access  Private (Admin, Depot roles)
 */
router.delete(
  "/uploads/:uploadId",
  auth.requireRoles(["ADMIN", "DEPOT"]),
  (req, res) => {
    req.params.id = req.params.uploadId;
    uploadController.deleteUpload(req, res);
  }
);

module.exports = router;
