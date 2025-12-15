const prisma = require("../utils/prisma");

// Get all activity logs with pagination and filtering
const getAllActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (entity) {
      where.entity = { contains: entity, mode: "insensitive" };
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all activity logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity logs",
      error: error.message,
    });
  }
};

// Get activity log by ID
const getActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Activity log not found",
      });
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error("Get activity log by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity log",
      error: error.message,
    });
  }
};

// Get activity logs by user ID
const getActivityLogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      action,
      entity,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { userId };

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (entity) {
      where.entity = { contains: entity, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get activity logs by user ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activity logs",
      error: error.message,
    });
  }
};

// Get activity logs by entity
const getActivityLogsByEntity = async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const { page = 1, limit = 20, action, startDate, endDate } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { entity };

    if (entityId) {
      where.entityId = entityId;
    }

    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get activity logs by entity error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching entity activity logs",
      error: error.message,
    });
  }
};

// Get activity log statistics
const getActivityLogStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Build where clause
    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get total count
    const totalLogs = await prisma.activityLog.count({ where });

    // Get count by action
    const logsByAction = await prisma.activityLog.groupBy({
      by: ["action"],
      where,
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
    });

    // Get count by entity
    const logsByEntity = await prisma.activityLog.groupBy({
      by: ["entity"],
      where,
      _count: {
        entity: true,
      },
      orderBy: {
        _count: {
          entity: "desc",
        },
      },
    });

    // Get most active users
    const activeUsers = await prisma.activityLog.groupBy({
      by: ["userId"],
      where: {
        ...where,
        userId: { not: null },
      },
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: "desc",
        },
      },
      take: 10,
    });

    // Get user details for active users
    const userIds = activeUsers.map((u) => u.userId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const activeUsersWithDetails = activeUsers.map((au) => {
      const user = users.find((u) => u.id === au.userId);
      return {
        userId: au.userId,
        count: au._count.userId,
        user,
      };
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        byAction: logsByAction.map((item) => ({
          action: item.action,
          count: item._count.action,
        })),
        byEntity: logsByEntity.map((item) => ({
          entity: item.entity,
          count: item._count.entity,
        })),
        activeUsers: activeUsersWithDetails,
      },
    });
  } catch (error) {
    console.error("Get activity log stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity log statistics",
      error: error.message,
    });
  }
};

// Delete old activity logs (cleanup)
const deleteOldActivityLogs = async (req, res) => {
  try {
    const { beforeDate } = req.body;

    if (!beforeDate) {
      return res.status(400).json({
        success: false,
        message: "beforeDate is required",
      });
    }

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(beforeDate),
        },
      },
    });

    // Log this cleanup action
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "ACTIVITY_LOGS_CLEANUP",
          entity: "ActivityLog",
          details: {
            beforeDate,
            deletedCount: result.count,
            deletedBy: req.user?.email,
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });
    } catch (logError) {
      console.error("Activity log error:", logError);
    }

    res.json({
      success: true,
      message: `Successfully deleted ${result.count} old activity logs`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Delete old activity logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting old activity logs",
      error: error.message,
    });
  }
};

module.exports = {
  getAllActivityLogs,
  getActivityLogById,
  getActivityLogsByUserId,
  getActivityLogsByEntity,
  getActivityLogStats,
  deleteOldActivityLogs,
};
