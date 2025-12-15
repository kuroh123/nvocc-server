const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (requires authentication)
 * @query   page, limit, search, status, roleId, tenantId
 */
router.get("/", userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get("/:id", userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only recommended)
 * @body    tenantId, email, password, firstName, lastName, phoneNumber, status, roleIds
 */
router.post("/", userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin only recommended)
 * @body    firstName, lastName, phoneNumber, status, roleIds, isEmailVerified, profileImageUrl
 */
router.put("/:id", userController.updateUser);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Private (Admin only recommended)
 * @body    newPassword
 */
router.put("/:id/password", userController.updateUserPassword);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only recommended)
 */
router.delete("/:id", userController.deleteUser);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Assign roles to user
 * @access  Private (Admin only recommended)
 * @body    roleIds (array)
 */
router.post("/:id/roles", userController.assignRolesToUser);

/**
 * @route   GET /api/users/:id/activity-logs
 * @desc    Get activity logs for a specific user
 * @access  Private
 * @query   page, limit
 */
router.get("/:id/activity-logs", userController.getUserActivityLogs);

module.exports = router;
