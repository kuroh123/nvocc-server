const express = require("express");
const router = express.Router();
const {
  getAllBankAccounts,
  getBankAccountById,
  getBankAccountsByAgentId,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} = require("../controllers/bankAccountController");

// Bank Account routes
router.get("/", getAllBankAccounts);
router.get("/agent/:agentId", getBankAccountsByAgentId);
router.get("/:id", getBankAccountById);
router.post("/", createBankAccount);
router.put("/:id", updateBankAccount);
router.delete("/:id", deleteBankAccount);

module.exports = router;
