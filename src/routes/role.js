const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/roles
 * @desc    Get all roles with pagination and filtering
 * @access  Private (requires authentication)
 * @query   page, limit, search, isActive
 */
router.get("/", roleController.getAllRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID with permissions and users
 * @access  Private
 */
router.get("/:id", roleController.getRoleById);

/**
 * @route   POST /api/roles
 * @desc    Create new role
 * @access  Private (Admin only recommended)
 * @body    name, displayName, description, isActive, permissionIds
 */
router.post("/", roleController.createRole);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role
 * @access  Private (Admin only recommended)
 * @body    displayName, description, isActive, permissionIds
 */
router.put("/:id", roleController.updateRole);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role
 * @access  Private (Admin only recommended)
 */
router.delete("/:id", roleController.deleteRole);

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    Assign permissions to role
 * @access  Private (Admin only recommended)
 * @body    permissionIds (array)
 */
router.post("/:id/permissions", roleController.assignPermissionsToRole);

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions with pagination and filtering
 * @access  Private
 * @query   page, limit, search, module, isActive
 */
router.get("/permissions/all", roleController.getAllPermissions);

/**
 * @route   POST /api/permissions
 * @desc    Create new permission
 * @access  Private (Admin only recommended)
 * @body    name, displayName, description, module, category, isActive
 */
router.post("/permissions", roleController.createPermission);

/**
 * @route   PUT /api/permissions/:id
 * @desc    Update permission
 * @access  Private (Admin only recommended)
 * @body    displayName, description, module, category, isActive
 */
router.put("/permissions/:id", roleController.updatePermission);

/**
 * @route   DELETE /api/permissions/:id
 * @desc    Delete permission
 * @access  Private (Admin only recommended)
 */
router.delete("/permissions/:id", roleController.deletePermission);

module.exports = router;
