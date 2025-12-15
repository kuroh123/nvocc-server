const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/activity-logs
 * @desc    Get all activity logs with pagination and filtering
 * @access  Private (requires authentication)
 * @query   page, limit, userId, action, entity, entityId, startDate, endDate, search
 */
router.get("/", activityLogController.getAllActivityLogs);

/**
 * @route   GET /api/activity-logs/stats
 * @desc    Get activity log statistics
 * @access  Private
 * @query   startDate, endDate, userId
 */
router.get("/stats", activityLogController.getActivityLogStats);

/**
 * @route   GET /api/activity-logs/:id
 * @desc    Get activity log by ID
 * @access  Private
 */
router.get("/:id", activityLogController.getActivityLogById);

/**
 * @route   GET /api/activity-logs/user/:userId
 * @desc    Get activity logs for a specific user
 * @access  Private
 * @query   page, limit, action, entity, startDate, endDate
 */
router.get("/user/:userId", activityLogController.getActivityLogsByUserId);

/**
 * @route   GET /api/activity-logs/entity/:entity
 * @desc    Get activity logs for a specific entity type
 * @access  Private
 * @query   page, limit, action, startDate, endDate
 */
router.get("/entity/:entity", activityLogController.getActivityLogsByEntity);

/**
 * @route   GET /api/activity-logs/entity/:entity/:entityId
 * @desc    Get activity logs for a specific entity and entity ID
 * @access  Private
 * @query   page, limit, action, startDate, endDate
 */
router.get(
  "/entity/:entity/:entityId",
  activityLogController.getActivityLogsByEntity
);

/**
 * @route   DELETE /api/activity-logs/cleanup
 * @desc    Delete old activity logs (cleanup)
 * @access  Private (Admin only recommended)
 * @body    beforeDate
 */
router.delete("/cleanup", activityLogController.deleteOldActivityLogs);

module.exports = router;
