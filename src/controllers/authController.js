const authService = require("../services/authService");
const { validationResult } = require("express-validator");

class AuthController {
  /**
   * User registration
   */
  async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userData = req.body;
      const user = await authService.register(userData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
        code: "REGISTRATION_FAILED",
      });
    }
  }

  /**
   * User login
   */
  async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");

      const result = await authService.login(
        email,
        password,
        ipAddress,
        userAgent
      );

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
          session: result.session,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Login failed",
        code: "LOGIN_FAILED",
      });
    }
  }

  /**
   * Switch user role
   */
  async switchRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { role } = req.body;
      const userId = req.user.id;
      const sessionId = req.session.id;

      const result = await authService.switchRole(userId, role, sessionId);

      res.json({
        success: true,
        message: "Role switched successfully",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      });
    } catch (error) {
      console.error("Role switch error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Role switch failed",
        code: "ROLE_SWITCH_FAILED",
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token is required",
          code: "MISSING_REFRESH_TOKEN",
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Token refresh failed",
        code: "TOKEN_REFRESH_FAILED",
      });
    }
  }

  /**
   * User logout
   */
  async logout(req, res) {
    try {
      const userId = req.user.id;
      const sessionId = req.session.id;

      await authService.logout(userId, sessionId);

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
        code: "LOGOUT_FAILED",
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);

      res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve profile",
        code: "PROFILE_FETCH_FAILED",
      });
    }
  }

  /**
   * Get user's available roles
   */
  async getAvailableRoles(req, res) {
    try {
      const userId = req.user.id;

      // Get user's roles from the already authenticated user object
      const roles = req.user.roles.map((roleName) => {
        return {
          name: roleName,
          displayName: roleName
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          isActive: roleName === req.user.activeRole,
        };
      });

      res.json({
        success: true,
        message: "Available roles retrieved successfully",
        data: {
          roles,
          activeRole: req.user.activeRole,
        },
      });
    } catch (error) {
      console.error("Get roles error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve roles",
        code: "ROLES_FETCH_FAILED",
      });
    }
  }

  /**
   * Get user's menus based on active role
   */
  async getMenus(req, res) {
    try {
      const menus = req.user.menus || [];

      res.json({
        success: true,
        message: "Menus retrieved successfully",
        data: {
          menus,
          activeRole: req.user.activeRole,
        },
      });
    } catch (error) {
      console.error("Get menus error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve menus",
        code: "MENUS_FETCH_FAILED",
      });
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth(req, res) {
    try {
      res.json({
        success: true,
        message: "User is authenticated",
        data: {
          user: {
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            roles: req.user.roles,
            activeRole: req.user.activeRole,
            permissions: req.user.permissions,
          },
          session: {
            id: req.session.id,
            expiresAt: req.session.expiresAt,
            lastActivityAt: req.session.lastActivityAt,
          },
        },
      });
    } catch (error) {
      console.error("Check auth error:", error);
      res.status(500).json({
        success: false,
        message: "Authentication check failed",
        code: "AUTH_CHECK_FAILED",
      });
    }
  }
}

module.exports = new AuthController();
