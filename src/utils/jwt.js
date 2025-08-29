const jwt = require("jsonwebtoken");
const { promisify } = require("util");

class JWTUtils {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets must be defined in environment variables");
    }
  }

  /**
   * Generate access token
   * @param {Object} payload - User data to encode
   * @returns {string} JWT token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: "nvocc-platform",
      audience: "nvocc-client",
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to encode
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: "nvocc-platform",
      audience: "nvocc-client",
    });
  }

  /**
   * Verify access token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded payload
   */
  async verifyAccessToken(token) {
    try {
      const verify = promisify(jwt.verify);
      return await verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {Object} Decoded payload
   */
  async verifyRefreshToken(token) {
    try {
      const verify = promisify(jwt.verify);
      return await verify(token, this.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @param {string} activeRole - Current active role
   * @returns {Object} Object containing both tokens
   */
  generateTokenPair(user, activeRole = null) {
    const payload = {
      userId: user.id,
      email: user.email,
      activeRole: activeRole,
      roles: user.userRoles?.map((ur) => ur.role.name) || [],
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.JWT_EXPIRES_IN,
    };
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiration date
   * @param {string} expiresIn - Expiration string (e.g., '15m', '7d')
   * @returns {Date} Expiration date
   */
  getExpirationDate(expiresIn = this.JWT_EXPIRES_IN) {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([mhd])$/);

    if (!match) {
      throw new Error("Invalid expiration format");
    }

    const [, amount, unit] = match;
    const amountNum = parseInt(amount, 10);

    switch (unit) {
      case "m":
        return new Date(now.getTime() + amountNum * 60 * 1000);
      case "h":
        return new Date(now.getTime() + amountNum * 60 * 60 * 1000);
      case "d":
        return new Date(now.getTime() + amountNum * 24 * 60 * 60 * 1000);
      default:
        throw new Error("Invalid time unit");
    }
  }
}

module.exports = new JWTUtils();
