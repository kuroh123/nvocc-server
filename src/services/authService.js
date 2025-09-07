const prisma = require("../utils/prisma");
const passwordUtils = require("../utils/password");
const jwtUtils = require("../utils/jwt");
const crypto = require("crypto");

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      roles = [],
    } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate password strength
    const passwordValidation = passwordUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`
      );
    }

    // Hash password
    const hashedPassword = await passwordUtils.hashPassword(password);

    // Create user with roles
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        roles: {
          connect: roles.map((roleName) => ({ name: roleName })),
        },
      },
      include: {
        roles: true,
      },
    });

    // Log registration activity
    await this.logActivity(user.id, "REGISTER", "User", user.id, {
      email: user.email,
      roles: roles,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((role) => role.name),
    };
  }

  /**
   * Authenticate user login
   */
  async login(email, password, ipAddress, userAgent) {
    // Find user with roles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      await this.logActivity(
        null,
        "LOGIN_FAILED",
        "User",
        null,
        {
          email,
          reason: "User not found",
          ipAddress,
        },
        ipAddress,
        userAgent
      );
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      await this.logActivity(
        user.id,
        "LOGIN_FAILED",
        "User",
        user.id,
        {
          reason: "Account not active",
          status: user.status,
          ipAddress,
        },
        ipAddress,
        userAgent
      );
      throw new Error("Account is not active");
    }

    // Verify password
    const isPasswordValid = await passwordUtils.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      await this.logActivity(
        user.id,
        "LOGIN_FAILED",
        "User",
        user.id,
        {
          reason: "Invalid password",
          ipAddress,
        },
        ipAddress,
        userAgent
      );
      throw new Error("Invalid email or password");
    }

    // Get default active role (first role if multiple)
    const defaultRole = user.roles.length > 0 ? user.roles[0].name : null;

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = jwtUtils.generateTokenPair(
      user,
      defaultRole
    );

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        activeRole: defaultRole,
        ipAddress,
        userAgent,
        expiresAt: jwtUtils.getExpirationDate(expiresIn),
      },
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: jwtUtils.getExpirationDate(jwtUtils.JWT_REFRESH_EXPIRES_IN),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await this.logActivity(
      user.id,
      "LOGIN_SUCCESS",
      "User",
      user.id,
      {
        activeRole: defaultRole,
        ipAddress,
        sessionId: session.id,
      },
      ipAddress,
      userAgent
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: user.roles.map((role) => role.name),
        activeRole: defaultRole,
        permissions: this.getPermissionsForRoles(user.roles),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * Switch user's active role
   */
  async switchRole(userId, newRole, sessionId) {
    // Get user with all roles for verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has access to the requested role
    const hasRole = user.roles.some((role) => role.name === newRole);

    if (!hasRole) {
      throw new Error("User does not have access to this role");
    }

    // Get the specific role data
    const roleData = user.roles.find((role) => role.name === newRole);

    // Log role switch
    await this.logActivity(userId, "ROLE_SWITCH", "UserSession", sessionId, {
      newRole,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.name),
        activeRole: newRole,
        permissions: this.getPermissionsForRole(roleData),
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenValue) {
    // Verify refresh token
    let decoded;
    try {
      decoded = await jwtUtils.verifyRefreshToken(refreshTokenValue);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }

    // Check if refresh token exists and is not revoked
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!refreshTokenRecord || refreshTokenRecord.isRevoked) {
      throw new Error("Refresh token is invalid or revoked");
    }

    if (refreshTokenRecord.expiresAt < new Date()) {
      throw new Error("Refresh token has expired");
    }

    const user = refreshTokenRecord.user;

    // Get current session to maintain active role
    const currentSession = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { lastActivityAt: "desc" },
    });

    const activeRole =
      currentSession?.activeRole ||
      (user.roles.length > 0 ? user.roles[0].name : null);

    // Generate new access token
    const { accessToken, expiresIn } = jwtUtils.generateTokenPair(
      user,
      activeRole
    );

    // Update session if exists
    if (currentSession) {
      await prisma.userSession.update({
        where: { id: currentSession.id },
        data: {
          token: accessToken,
          expiresAt: jwtUtils.getExpirationDate(expiresIn),
          lastActivityAt: new Date(),
        },
      });
    }

    return {
      accessToken,
      expiresIn,
    };
  }

  /**
   * Logout user
   */
  async logout(userId, sessionId) {
    // Deactivate session
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    // Revoke all refresh tokens for this user (optional - for complete logout)
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    // Log logout activity
    await this.logActivity(userId, "LOGOUT", "User", userId, {
      sessionId,
    });

    return true;
  }

  /**
   * Get user profile with current role info
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      profileImageUrl: user.profileImageUrl,
      roles: user.roles.map((role) => ({
        id: role.id,
        name: role.name,
        displayName: role.displayName,
      })),
      permissions: this.getPermissionsForRoles(user.roles),
    };
  }

  /**
   * Helper method to extract permissions for multiple roles
   */
  getPermissionsForRoles(roles) {
    const permissionSet = new Set();

    roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        if (permission.isActive) {
          permissionSet.add(permission.name);
        }
      });
    });

    return Array.from(permissionSet).sort();
  }

  /**
   * Helper method to extract permissions for a single role
   */
  getPermissionsForRole(role) {
    return role.permissions
      .filter((permission) => permission.isActive)
      .map((permission) => permission.name)
      .sort();
  }

  /**
   * Log user activity
   */
  async logActivity(
    userId,
    action,
    entity,
    entityId,
    details,
    ipAddress,
    userAgent
  ) {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          details,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Don't throw error for logging failures
    }
  }
}

module.exports = new AuthService();
