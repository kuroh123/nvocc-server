const prisma = require("../utils/prisma");
const passwordUtils = require("../utils/password");

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      roleId,
      tenantId,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleId) {
      where.roles = {
        some: {
          id: roleId,
        },
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              app_abbr: true,
            },
          },
          roles: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          tenantId: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          status: true,
          isEmailVerified: true,
          emailVerifiedAt: true,
          lastLoginAt: true,
          profileImageUrl: true,
          createdAt: true,
          updatedAt: true,
          tenant: true,
          roles: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            app_abbr: true,
            email: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
          },
        },
        userSessions: {
          where: { isActive: true },
          select: {
            id: true,
            activeRole: true,
            ipAddress: true,
            createdAt: true,
            lastActivityAt: true,
          },
        },
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        status: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        tenant: true,
        roles: true,
        userSessions: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const {
      tenantId,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      status,
      roleIds,
      isEmailVerified,
      profileImageUrl,
    } = req.body;

    // Validation
    if (!tenantId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "tenantId, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await passwordUtils.hashPassword(password);

    // Create user with roles
    const userData = {
      tenantId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      status: status || "ACTIVE",
      isEmailVerified: isEmailVerified || false,
      profileImageUrl,
    };

    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      userData.roles = {
        connect: roleIds.map((id) => ({ id })),
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            app_abbr: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        status: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        tenant: true,
        roles: true,
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "USER_CREATED",
          entity: "User",
          entityId: user.id,
          details: {
            email: user.email,
            createdBy: req.user?.email,
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });
    } catch (logError) {
      console.error("Activity log error:", logError);
    }

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phoneNumber,
      status,
      roleIds,
      isEmailVerified,
      profileImageUrl,
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      status,
      isEmailVerified,
      profileImageUrl,
    };

    // Handle role updates
    if (roleIds && Array.isArray(roleIds)) {
      updateData.roles = {
        set: roleIds.map((id) => ({ id })),
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            app_abbr: true,
          },
        },
        roles: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        status: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        tenant: true,
        roles: true,
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "USER_UPDATED",
          entity: "User",
          entityId: user.id,
          details: {
            email: user.email,
            updatedBy: req.user?.email,
            changes: req.body,
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
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Update user password
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await passwordUtils.hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "PASSWORD_RESET",
          entity: "User",
          entityId: id,
          details: {
            email: existingUser.email,
            resetBy: req.user?.email,
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
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating password",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "USER_DELETED",
          entity: "User",
          entityId: id,
          details: {
            email: existingUser.email,
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
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Assign roles to user
const assignRolesToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleIds } = req.body;

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "roleIds array is required",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        roles: {
          set: roleIds.map((roleId) => ({ id: roleId })),
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "ROLES_ASSIGNED",
          entity: "User",
          entityId: user.id,
          details: {
            email: user.email,
            assignedBy: req.user?.email,
            roleIds,
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
      data: user,
      message: "Roles assigned successfully",
    });
  } catch (error) {
    console.error("Assign roles error:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning roles",
      error: error.message,
    });
  }
};

// Get user activity logs
const getUserActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.activityLog.count({ where: { userId: id } }),
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
    console.error("Get user activity logs error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activity logs",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  assignRolesToUser,
  getUserActivityLogs,
};
