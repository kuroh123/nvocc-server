const prisma = require("../utils/prisma");

// Get all roles with pagination and filtering
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: {
          permissions: {
            select: {
              id: true,
              name: true,
              displayName: true,
              module: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.role.count({ where }),
    ]);

    res.json({
      success: true,
      data: roles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all roles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching roles",
      error: error.message,
    });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            module: true,
            category: true,
          },
        },
        users: {
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

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Get role by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching role",
      error: error.message,
    });
  }
};

// Create new role
const createRole = async (req, res) => {
  try {
    const { name, displayName, description, isActive, permissionIds } =
      req.body;

    // Validation
    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "name and displayName are required",
      });
    }

    // Check if role with same name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists",
      });
    }

    const roleData = {
      name,
      displayName,
      description,
      isActive: isActive !== undefined ? isActive : true,
    };

    if (
      permissionIds &&
      Array.isArray(permissionIds) &&
      permissionIds.length > 0
    ) {
      roleData.permissions = {
        connect: permissionIds.map((id) => ({ id })),
      };
    }

    const role = await prisma.role.create({
      data: roleData,
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            displayName: true,
            module: true,
          },
        },
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "ROLE_CREATED",
          entity: "Role",
          entityId: role.id,
          details: {
            roleName: role.name,
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
      data: role,
      message: "Role created successfully",
    });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating role",
      error: error.message,
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, isActive, permissionIds } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const updateData = {
      displayName,
      description,
      isActive,
    };

    // Handle permission updates
    if (permissionIds && Array.isArray(permissionIds)) {
      updateData.permissions = {
        set: permissionIds.map((id) => ({ id })),
      };
    }

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            displayName: true,
            module: true,
          },
        },
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "ROLE_UPDATED",
          entity: "Role",
          entityId: role.id,
          details: {
            roleName: role.name,
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
      data: role,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Update role error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating role",
      error: error.message,
    });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if role has users assigned
    if (existingRole._count.users > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${existingRole._count.users} user(s) are assigned to this role`,
      });
    }

    await prisma.role.delete({
      where: { id },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "ROLE_DELETED",
          entity: "Role",
          entityId: id,
          details: {
            roleName: existingRole.name,
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
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete role error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting role",
      error: error.message,
    });
  }
};

// Assign permissions to role
const assignPermissionsToRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({
        success: false,
        message: "permissionIds array is required",
      });
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: permissionIds.map((permissionId) => ({ id: permissionId })),
        },
      },
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            displayName: true,
            module: true,
          },
        },
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "PERMISSIONS_ASSIGNED",
          entity: "Role",
          entityId: role.id,
          details: {
            roleName: role.name,
            assignedBy: req.user?.email,
            permissionIds,
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
      data: role,
      message: "Permissions assigned successfully",
    });
  } catch (error) {
    console.error("Assign permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning permissions",
      error: error.message,
    });
  }
};

// Get all permissions
const getAllPermissions = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, module, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (module) {
      where.module = module;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ module: "asc" }, { name: "asc" }],
      }),
      prisma.permission.count({ where }),
    ]);

    res.json({
      success: true,
      data: permissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all permissions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching permissions",
      error: error.message,
    });
  }
};

// Create permission
const createPermission = async (req, res) => {
  try {
    const { name, displayName, description, module, category, isActive } =
      req.body;

    // Validation
    if (!name || !displayName || !module) {
      return res.status(400).json({
        success: false,
        message: "name, displayName, and module are required",
      });
    }

    // Check if permission with same name already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: "Permission with this name already exists",
      });
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        displayName,
        description,
        module,
        category,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "PERMISSION_CREATED",
          entity: "Permission",
          entityId: permission.id,
          details: {
            permissionName: permission.name,
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
      data: permission,
      message: "Permission created successfully",
    });
  } catch (error) {
    console.error("Create permission error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating permission",
      error: error.message,
    });
  }
};

// Update permission
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, module, category, isActive } = req.body;

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        displayName,
        description,
        module,
        category,
        isActive,
      },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "PERMISSION_UPDATED",
          entity: "Permission",
          entityId: permission.id,
          details: {
            permissionName: permission.name,
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
      data: permission,
      message: "Permission updated successfully",
    });
  } catch (error) {
    console.error("Update permission error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating permission",
      error: error.message,
    });
  }
};

// Delete permission
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    await prisma.permission.delete({
      where: { id },
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: "PERMISSION_DELETED",
          entity: "Permission",
          entityId: id,
          details: {
            permissionName: existingPermission.name,
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
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("Delete permission error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting permission",
      error: error.message,
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
};
