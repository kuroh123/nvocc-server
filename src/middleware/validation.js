const { body, param, query } = require("express-validator");

const authValidation = {
  // Validation for user registration
  register: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be between 1 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),

    body("phoneNumber")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),

    body("roles")
      .optional()
      .isArray()
      .withMessage("Roles must be an array")
      .custom((roles) => {
        const validRoles = [
          "ADMIN",
          "CUSTOMER",
          "PORT",
          "DEPOT",
          "SALES",
          "MASTER_PORT",
          "HR",
        ];
        const invalidRoles = roles.filter((role) => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
          throw new Error(`Invalid roles: ${invalidRoles.join(", ")}`);
        }
        return true;
      }),
  ],

  // Validation for user login
  login: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  // Validation for role switching
  switchRole: [
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn([
        "ADMIN",
        "CUSTOMER",
        "PORT",
        "DEPOT",
        "SALES",
        "MASTER_PORT",
        "HR",
      ])
      .withMessage("Invalid role specified"),
  ],

  // Validation for refresh token
  refreshToken: [
    body("refreshToken")
      .optional()
      .notEmpty()
      .withMessage("Refresh token cannot be empty"),
  ],

  // Validation for password reset request
  forgotPassword: [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
  ],

  // Validation for password reset
  resetPassword: [
    body("token").notEmpty().withMessage("Reset token is required"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],

  // Validation for password change
  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error(
            "New password must be different from current password"
          );
        }
        return true;
      }),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
  ],

  // Validation for profile update
  updateProfile: [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("First name must be between 1 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Last name must be between 1 and 50 characters"),

    body("phoneNumber")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),

    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
  ],
};

module.exports = authValidation;
