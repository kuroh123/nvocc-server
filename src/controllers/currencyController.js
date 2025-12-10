const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all currencies
const getAllCurrencies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { symbol: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [currencies, total] = await Promise.all([
      prisma.currency.findMany({
        where,
        include: {
          countries: {
            select: {
              id: true,
              name: true,
              codeChar2: true,
              codeChar3: true,
            },
          },
          bankAccounts: {
            select: {
              id: true,
              accountName: true,
              agent: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.currency.count({ where }),
    ]);

    res.json({
      success: true,
      data: currencies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch currencies",
    });
  }
};

// Get currency by ID
const getCurrencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const currency = await prisma.currency.findUnique({
      where: { id },
      include: {
        countries: {
          select: {
            id: true,
            name: true,
            codeChar2: true,
            codeChar3: true,
          },
        },
        bankAccounts: {
          select: {
            id: true,
            accountName: true,
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        exchangeRatesFrom: {
          include: {
            toCurrency: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        exchangeRatesTo: {
          include: {
            fromCurrency: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!currency) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Currency not found",
      });
    }

    res.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    console.error("Error fetching currency:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch currency",
    });
  }
};

// Create currency
const createCurrency = async (req, res) => {
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

    const { name, code, symbol, status } = req.body;

    // Check for duplicate currency code
    if (code) {
      const existingCurrency = await prisma.currency.findFirst({
        where: { code },
      });

      if (existingCurrency) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Currency code already exists",
        });
      }
    }

    const currency = await prisma.currency.create({
      data: {
        name,
        code,
        symbol,
        status: status || "ACTIVE",
      },
    });

    res.status(201).json({
      success: true,
      data: currency,
      message: "Currency created successfully",
    });
  } catch (error) {
    console.error("Error creating currency:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A currency with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create currency",
    });
  }
};

// Update currency
const updateCurrency = async (req, res) => {
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
    const { name, code, symbol, status } = req.body;

    // Check if currency exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { id },
    });

    if (!existingCurrency) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Currency not found",
      });
    }

    // Check for duplicate currency code if provided and different from current
    if (code && code !== existingCurrency.code) {
      const duplicateCurrency = await prisma.currency.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (duplicateCurrency) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Currency code already exists",
        });
      }
    }

    const currency = await prisma.currency.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code !== undefined && { code }),
        ...(symbol !== undefined && { symbol }),
        ...(status && { status }),
      },
    });

    res.json({
      success: true,
      data: currency,
      message: "Currency updated successfully",
    });
  } catch (error) {
    console.error("Error updating currency:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A currency with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update currency",
    });
  }
};

// Delete currency
const deleteCurrency = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if currency exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { id },
    });

    if (!existingCurrency) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Currency not found",
      });
    }

    await prisma.currency.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Currency deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting currency:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete currency due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete currency",
    });
  }
};

module.exports = {
  getAllCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
};