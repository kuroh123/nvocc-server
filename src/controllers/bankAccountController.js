const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all bank accounts
const getAllBankAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, agentId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { accountName: { contains: search, mode: "insensitive" } },
        { bankName: { contains: search, mode: "insensitive" } },
        { accountNum: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    const [bankAccounts, total] = await Promise.all([
      prisma.bankAccount.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          currency: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          state: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          country: {
            select: {
              id: true,
              name: true,
              codeChar2: true,
              codeChar3: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.bankAccount.count({ where }),
    ]);

    res.json({
      success: true,
      data: bankAccounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch bank accounts",
    });
  }
};

// Get bank account by ID
const getBankAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            codeChar2: true,
            codeChar3: true,
          },
        },
      },
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Bank account not found",
      });
    }

    res.json({
      success: true,
      data: bankAccount,
    });
  } catch (error) {
    console.error("Error fetching bank account:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch bank account",
    });
  }
};

// Get bank accounts by agent ID
const getBankAccountsByAgentId = async (req, res) => {
  try {
    const { agentId } = req.params;
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { agentId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            codeChar2: true,
            codeChar3: true,
          },
        },
      },
      orderBy: { accountName: "asc" },
    });

    res.json({
      success: true,
      data: bankAccounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts by agent:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch bank accounts by agent",
    });
  }
};

// Create bank account
const createBankAccount = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid input data",
        details: errors.array(),
      });
    }

    const {
      agentId,
      accountName,
      bankName,
      bankBranch,
      currencyId,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      ifscCode,
      swiftCode,
      accountNum,
      status,
    } = req.body;

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid agent specified",
      });
    }

    // Check if currency exists
    if (currencyId) {
      const currency = await prisma.currency.findUnique({
        where: { id: currencyId },
      });

      if (!currency) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid currency specified",
        });
      }
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        agentId,
        accountName,
        bankName,
        bankBranch,
        currencyId,
        addressLine1,
        addressLine2,
        city,
        stateId,
        zipCode,
        countryId,
        ifscCode,
        swiftCode,
        accountNum,
        status: status || "ACTIVE",
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            codeChar2: true,
            codeChar3: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: bankAccount,
      message: "Bank account created successfully",
    });
  } catch (error) {
    console.error("Error creating bank account:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A bank account with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create bank account",
    });
  }
};

// Update bank account
const updateBankAccount = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid input data",
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const {
      agentId,
      accountName,
      bankName,
      bankBranch,
      currencyId,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      ifscCode,
      swiftCode,
      accountNum,
      status,
    } = req.body;

    // Check if bank account exists
    const existingBankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingBankAccount) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Bank account not found",
      });
    }

    // Check if agent exists if agentId is being updated
    if (agentId && agentId !== existingBankAccount.agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid agent specified",
        });
      }
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        ...(agentId && { agentId }),
        ...(accountName && { accountName }),
        ...(bankName && { bankName }),
        ...(bankBranch !== undefined && { bankBranch }),
        ...(currencyId && { currencyId }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(city && { city }),
        ...(stateId && { stateId }),
        ...(zipCode !== undefined && { zipCode }),
        ...(countryId && { countryId }),
        ...(ifscCode !== undefined && { ifscCode }),
        ...(swiftCode !== undefined && { swiftCode }),
        ...(accountNum !== undefined && { accountNum }),
        ...(status && { status }),
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            codeChar2: true,
            codeChar3: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: bankAccount,
      message: "Bank account updated successfully",
    });
  } catch (error) {
    console.error("Error updating bank account:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A bank account with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update bank account",
    });
  }
};

// Delete bank account
const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bank account exists
    const existingBankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingBankAccount) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Bank account not found",
      });
    }

    await prisma.bankAccount.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete bank account due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete bank account",
    });
  }
};

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  getBankAccountsByAgentId,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
};
