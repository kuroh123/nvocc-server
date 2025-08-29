const bcrypt = require("bcrypt");

class PasswordUtils {
  constructor() {
    this.saltRounds = 12;
  }

  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    if (!password || typeof password !== "string") {
      throw new Error("Password must be a non-empty string");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error("Error hashing password");
    }
  }

  /**
   * Compare a password with its hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches hash
   */
  async comparePassword(password, hash) {
    if (!password || !hash) {
      return false;
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with errors
   */
  validatePasswordStrength(password) {
    const errors = [];

    if (!password || typeof password !== "string") {
      errors.push("Password is required");
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters long");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Password is too common, please choose a stronger password");
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password),
    };
  }

  /**
   * Calculate password strength score
   * @param {string} password - Password to analyze
   * @returns {Object} Strength score and level
   */
  calculatePasswordStrength(password) {
    let score = 0;
    let level = "weak";

    if (!password) {
      return { score: 0, level: "weak" };
    }

    // Length bonus
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    // Complexity bonus
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 1;
    if (
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(
        password
      )
    )
      score += 1;

    // Determine strength level
    if (score >= 7) level = "very-strong";
    else if (score >= 5) level = "strong";
    else if (score >= 3) level = "medium";
    else if (score >= 1) level = "weak";
    else level = "very-weak";

    return { score, level };
  }

  /**
   * Generate a random password
   * @param {number} length - Password length (default: 12)
   * @returns {string} Generated password
   */
  generateRandomPassword(length = 12) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = "";

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }
}

module.exports = new PasswordUtils();
