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

const portValidation = {
  // Validation for port creation
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Port name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Port name must be between 2 and 100 characters"),

    body("portType")
      .notEmpty()
      .withMessage("Port type is required")
      .isIn(["DRY_PORT", "SEA_PORT"])
      .withMessage("Port type must be either DRY_PORT or SEA_PORT"),

    body("countryId")
      .notEmpty()
      .withMessage("Country ID is required")
      .isString()
      .withMessage("Country ID must be a valid string"),

    body("itaCode")
      .optional()
      .trim()
      .isLength({ max: 10 })
      .withMessage("ITA code must not exceed 10 characters"),

    body("portCode")
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage("Port code must not exceed 20 characters")
      .matches(/^[A-Z0-9]+$/)
      .withMessage("Port code must contain only uppercase letters and numbers"),

    body("customsDetails")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Customs details must not exceed 500 characters"),

    body("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
  ],

  // Validation for port update
  update: [
    param("id")
      .notEmpty()
      .withMessage("Port ID is required")
      .isString()
      .withMessage("Port ID must be a valid string"),

    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Port name cannot be empty")
      .isLength({ min: 2, max: 100 })
      .withMessage("Port name must be between 2 and 100 characters"),

    body("portType")
      .optional()
      .isIn(["DRY_PORT", "SEA_PORT"])
      .withMessage("Port type must be either DRY_PORT or SEA_PORT"),

    body("countryId")
      .optional()
      .isString()
      .withMessage("Country ID must be a valid string"),

    body("itaCode")
      .optional()
      .trim()
      .isLength({ max: 10 })
      .withMessage("ITA code must not exceed 10 characters"),

    body("portCode")
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage("Port code must not exceed 20 characters")
      .matches(/^[A-Z0-9]*$/)
      .withMessage("Port code must contain only uppercase letters and numbers"),

    body("customsDetails")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Customs details must not exceed 500 characters"),

    body("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
  ],

  // Validation for getting port by ID
  getById: [
    param("id")
      .notEmpty()
      .withMessage("Port ID is required")
      .isString()
      .withMessage("Port ID must be a valid string"),
  ],

  // Validation for delete port
  delete: [
    param("id")
      .notEmpty()
      .withMessage("Port ID is required")
      .isString()
      .withMessage("Port ID must be a valid string"),
  ],

  // Validation for get ports by country
  getByCountry: [
    param("countryId")
      .notEmpty()
      .withMessage("Country ID is required")
      .isString()
      .withMessage("Country ID must be a valid string"),
  ],

  // Validation for query parameters in getAllPorts
  getAll: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term must not exceed 100 characters"),

    query("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),

    query("portType")
      .optional()
      .isIn(["DRY_PORT", "SEA_PORT"])
      .withMessage("Port type must be either DRY_PORT or SEA_PORT"),

    query("countryId")
      .optional()
      .isString()
      .withMessage("Country ID must be a valid string"),
  ],
};

const countryValidation = {
  // Validation for getting country by ID
  getById: [
    param("id")
      .notEmpty()
      .withMessage("Country ID is required")
      .isString()
      .withMessage("Country ID must be a valid string"),
  ],

  // Validation for query parameters in getAllCountries
  getAll: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term must not exceed 100 characters"),

    query("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
  ],
};

const terminalValidation = {
  // Validation for terminal creation
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Terminal name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Terminal name must be between 2 and 100 characters"),

    body("portId")
      .notEmpty()
      .withMessage("Port ID is required")
      .isString()
      .withMessage("Port ID must be a valid string"),

    body("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
  ],

  // Validation for terminal update
  update: [
    param("id")
      .notEmpty()
      .withMessage("Terminal ID is required")
      .isString()
      .withMessage("Terminal ID must be a valid string"),

    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Terminal name cannot be empty")
      .isLength({ min: 2, max: 100 })
      .withMessage("Terminal name must be between 2 and 100 characters"),

    body("portId")
      .optional()
      .isString()
      .withMessage("Port ID must be a valid string"),

    body("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),
  ],

  // Validation for getting terminal by ID
  getById: [
    param("id")
      .notEmpty()
      .withMessage("Terminal ID is required")
      .isString()
      .withMessage("Terminal ID must be a valid string"),
  ],

  // Validation for delete terminal
  delete: [
    param("id")
      .notEmpty()
      .withMessage("Terminal ID is required")
      .isString()
      .withMessage("Terminal ID must be a valid string"),
  ],

  // Validation for get terminals by port
  getByPort: [
    param("portId")
      .notEmpty()
      .withMessage("Port ID is required")
      .isString()
      .withMessage("Port ID must be a valid string"),
  ],

  // Validation for query parameters in getAllTerminals
  getAll: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term must not exceed 100 characters"),

    query("status")
      .optional()
      .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .withMessage("Status must be ACTIVE, INACTIVE, or SUSPENDED"),

    query("portId")
      .optional()
      .isString()
      .withMessage("Port ID must be a valid string"),
  ],
};

module.exports = {
  authValidation,
  portValidation,
  countryValidation,
  terminalValidation,
};
