const prisma = require("../utils/prisma");
const jwtUtils = require("../utils/jwt");

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        code: "MISSING_TOKEN",
      });
    }

    // Verify the token
    const decoded = await jwtUtils.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                roleMenus: {
                  include: {
                    menu: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "User account is not active",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Check if the session is still valid (optional)
    const activeSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        token,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: "Session has expired or is invalid",
        code: "INVALID_SESSION",
      });
    }

    // Update last activity
    await prisma.userSession.update({
      where: { id: activeSession.id },
      data: { lastActivityAt: new Date() },
    });

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles: user.userRoles.map((ur) => ur.role.name),
      activeRole:
        decoded.activeRole ||
        (user.userRoles.length > 0 ? user.userRoles[0].role.name : null),
      permissions: user.userRoles.flatMap((ur) => ur.role.permissions || []),
      menus: user.userRoles.flatMap((ur) =>
        ur.role.roleMenus.map((rm) => ({
          ...rm.menu,
          permissions: {
            canView: rm.canView,
            canCreate: rm.canCreate,
            canEdit: rm.canEdit,
            canDelete: rm.canDelete,
          },
        }))
      ),
    };

    req.session = activeSession;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
};

/**
 * Authorization middleware to check if user has required role(s)
 */
const authorize = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    // If no specific roles required, any authenticated user can access
    if (requiredRoles.length === 0) {
      return next();
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles,
        userRoles,
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const userPermissions = req.user.permissions || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
        code: "PERMISSION_DENIED",
        requiredPermission: permission,
        userPermissions,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user can access with their active role
 */
const requireActiveRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const activeRole = req.user.activeRole;

    if (!activeRole || !allowedRoles.includes(activeRole)) {
      return res.status(403).json({
        success: false,
        message: "Active role does not have access to this resource",
        code: "ROLE_ACCESS_DENIED",
        activeRole,
        allowedRoles,
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to authenticate
    await authenticate(req, res, () => {
      // If authentication succeeds, continue
      next();
    });
  } catch (error) {
    // If authentication fails, continue without user
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requirePermission,
  requireActiveRole,
  optionalAuth,
};
