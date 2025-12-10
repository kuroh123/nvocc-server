const express = require("express");
const router = express.Router();
const {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
} = require("../controllers/agentController");
const uploadController = require("../controllers/uploadController");
const auth = require("../middleware/auth");
const { upload } = require("../utils/fileUpload");

// Apply authentication to all routes
router.use(auth.authenticateToken);

// Agent routes
router.get("/", getAllAgents);
router.get("/:id", getAgentById);
router.post("/", auth.requireRoles(["ADMIN"]), createAgent);
router.put("/:id", auth.requireRoles(["ADMIN"]), updateAgent);
router.delete("/:id", auth.requireRoles(["ADMIN"]), deleteAgent);

/**
 * @route   POST /api/agents/:id/upload
 * @desc    Upload file for an agent
 * @access  Private (Admin roles)
 */
router.post(
  "/:id/upload",
  auth.requireRoles(["ADMIN"]),
  upload.single("file"),
  (req, res) => {
    req.body.entityType = "agent";
    req.body.entityId = req.params.id;
    uploadController.uploadFile(req, res);
  }
);

/**
 * @route   GET /api/agents/:id/uploads
 * @desc    Get all uploads for an agent
 * @access  Private
 */
router.get("/:id/uploads", (req, res) => {
  req.params.entityType = "agent";
  req.params.entityId = req.params.id;
  uploadController.getEntityUploads(req, res);
});

/**
 * @route   GET /api/agents/uploads/:uploadId/download
 * @desc    Download a specific upload file
 * @access  Private
 */
router.get("/uploads/:uploadId/download", (req, res) => {
  req.params.id = req.params.uploadId;
  uploadController.downloadFile(req, res);
});

/**
 * @route   DELETE /api/agents/uploads/:uploadId
 * @desc    Delete a specific upload
 * @access  Private (Admin roles)
 */
router.delete(
  "/uploads/:uploadId",
  auth.requireRoles(["ADMIN"]),
  (req, res) => {
    req.params.id = req.params.uploadId;
    uploadController.deleteUpload(req, res);
  }
);

module.exports = router;
