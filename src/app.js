const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimiter");

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy (important for rate limiting and getting real IP addresses)
app.set("trust proxy", 1);

// CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser middleware
app.use(cookieParser());

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/countries", require("./routes/country"));
app.use("/api/ports", require("./routes/port"));
app.use("/api/terminals", require("./routes/terminal"));
app.use("/api/test", require("./routes/test"));

// 404 handler for API routes - Express v5 compatible with proper regex
app.use(/^\/api\/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    code: "ENDPOINT_NOT_FOUND",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Handle different types of errors
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      code: "INVALID_JSON",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      code: "VALIDATION_ERROR",
      details: error.message,
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    code: error.code || "INTERNAL_ERROR",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

module.exports = app;
