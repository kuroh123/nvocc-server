const express = require("express");
const router = express.Router();
const {
  getAllContainerTypes,
  getContainerTypeById,
  createContainerType,
  updateContainerType,
  deleteContainerType,
} = require("../controllers/containerTypeController");

// Container Type routes
router.get("/", getAllContainerTypes);
router.get("/:id", getContainerTypeById);
router.post("/", createContainerType);
router.put("/:id", updateContainerType);
router.delete("/:id", deleteContainerType);

module.exports = router;
