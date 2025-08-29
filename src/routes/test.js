const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");

/**
 * @route   GET /api/test/health
 * @desc    Test database connection and system health
 * @access  Public
 */
router.get("/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get basic stats
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const menuCount = await prisma.menu.count();

    res.json({
      success: true,
      message: "System is healthy",
      data: {
        timestamp: new Date().toISOString(),
        database: "connected",
        stats: {
          users: userCount,
          roles: roleCount,
          menus: menuCount,
        },
        environment: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      success: false,
      message: "System health check failed",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/test/roles
 * @desc    Get all available roles (for testing)
 * @access  Public
 */
router.get("/roles", async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      success: true,
      message: "Roles retrieved successfully",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve roles",
      error: error.message,
    });
  }
});

module.exports = router;
