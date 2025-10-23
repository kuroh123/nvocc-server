const express = require("express");
const router = express.Router();
const {
  getAllStates,
  getStateById,
  getStatesByCountryId,
  createState,
  updateState,
  deleteState,
} = require("../controllers/stateController");

// State routes
router.get("/", getAllStates);
router.get("/country/:countryId", getStatesByCountryId);
router.get("/:id", getStateById);
router.post("/", createState);
router.put("/:id", updateState);
router.delete("/:id", deleteState);

module.exports = router;
