const express = require("express");
const router = express.Router();
const {
  getAllOperators,
  getOperatorById,
  getOperatorsByPortId,
  createOperator,
  updateOperator,
  deleteOperator,
} = require("../controllers/operatorController");

// Operator routes
router.get("/", getAllOperators);
router.get("/port/:portId", getOperatorsByPortId);
router.get("/:id", getOperatorById);
router.post("/", createOperator);
router.put("/:id", updateOperator);
router.delete("/:id", deleteOperator);

module.exports = router;
