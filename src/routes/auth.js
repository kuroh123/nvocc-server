const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authValidation = require("../middleware/validation");
const { authenticate } = require("../middleware/auth");
const {
  authLimiter,
  registrationLimiter,
  roleSwitchLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @rate_limit 3 requests per hour per IP
 */
router.post(
  "/register",
  registrationLimiter,
  authValidation.register,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 * @rate_limit 5 attempts per 15 minutes per IP
 */
router.post("/login", authLimiter, authValidation.login, authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  "/refresh-token",
  authValidation.refreshToken,
  authController.refreshToken
);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate session
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   POST /api/auth/switch-role
 * @desc    Switch user's active role
 * @access  Private
 * @rate_limit 10 switches per 5 minutes per IP
 */
router.post(
  "/switch-role",
  authenticate,
  roleSwitchLimiter,
  authValidation.switchRole,
  authController.switchRole
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * @route   GET /api/auth/roles
 * @desc    Get user's available roles
 * @access  Private
 */
router.get("/roles", authenticate, authController.getAvailableRoles);

/**
 * @route   GET /api/auth/permissions
 * @desc    Get user's permissions based on active role
 * @access  Private
 */
router.get("/permissions", authenticate, authController.getPermissions);

/**
 * @route   GET /api/auth/check
 * @desc    Check authentication status
 * @access  Private
 */
router.get("/check", authenticate, authController.checkAuth);

module.exports = router;
