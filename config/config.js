// config.js
const dotenv = require("dotenv");
dotenv.config();

const config = {
  app: {
    abbr: process.env.APP_ABBR || "",
    websiteUrl: process.env.WEBSITE_URL || "",
    email: process.env.EMAIL || "",
    activation: process.env.ACTIVATION === "true",
    resendActivationThreshold:
      parseInt(process.env.RESEND_ACTIVATION_THRESHOLD) || 0,
    language: process.env.LANGUAGE || "models/languages/en.php",
    template: process.env.TEMPLATE || "models/site-templates/default.css",
    version: process.env.APP_VERSION || "",
    status: process.env.APP_STATUS || "",
    msg: process.env.APP_MSG || "",
  },
  booking: {
    prefixBooking: process.env.PREFIX_BOOKING || "",
    prefixBL: process.env.PREFIX_BL || "",
    confirmationText: process.env.BOOKING_CONFIRMATION_TEXT || "",
  },
  auth: {
    passwordExpiryDays: parseInt(process.env.PASSWORD_EXPIRY_DAYS) || 90,
    maxUserSessions: parseInt(process.env.MAX_USER_SESSIONS) || 4,
  },
  api: {
    currencyConverterKey: process.env.CURRENCY_CONVERTER_API_KEY || "",
    currencyConverterUrl:
      process.env.CURRENCY_CONVERTER_URL || "currencyconverterapi.com",
  },
  audit: {
    trailAnyOperation: process.env.AUDIT_TRAIL_ANYOPERATION === "Y",
  },
};

module.exports = config;
