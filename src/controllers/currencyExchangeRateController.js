const prisma = require("../utils/prisma");

// Get all currency exchange rates
const getAllCurrencyExchangeRates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      fromCurrencyId,
      toCurrencyId,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (fromCurrencyId) {
      where.fromCurrencyId = fromCurrencyId;
    }

    if (toCurrencyId) {
      where.toCurrencyId = toCurrencyId;
    }

    if (search) {
      where.OR = [
        {
          fromCurrency: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          toCurrency: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [rates, total] = await Promise.all([
      prisma.currencyExchangeRate.findMany({
        where,
        include: {
          fromCurrency: {
            select: {
              id: true,
              name: true,
              code: true,
              symbol: true,
            },
          },
          toCurrency: {
            select: {
              id: true,
              name: true,
              code: true,
              symbol: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { validFromDt: "desc" },
      }),
      prisma.currencyExchangeRate.count({ where }),
    ]);

    res.json({
      success: true,
      data: rates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all currency exchange rates error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching currency exchange rates",
      error: error.message,
    });
  }
};

// Get currency exchange rate by ID
const getCurrencyExchangeRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const rate = await prisma.currencyExchangeRate.findUnique({
      where: { id },
      include: {
        fromCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        toCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Currency exchange rate not found",
      });
    }

    res.json({
      success: true,
      data: rate,
    });
  } catch (error) {
    console.error("Get currency exchange rate by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching currency exchange rate",
      error: error.message,
    });
  }
};

// Get latest exchange rate between two currencies
const getLatestExchangeRate = async (req, res) => {
  try {
    const { fromCurrencyId, toCurrencyId } = req.query;

    if (!fromCurrencyId || !toCurrencyId) {
      return res.status(400).json({
        success: false,
        message: "fromCurrencyId and toCurrencyId are required",
      });
    }

    const rate = await prisma.currencyExchangeRate.findFirst({
      where: {
        fromCurrencyId,
        toCurrencyId,
        status: "ACTIVE",
        validFromDt: {
          lte: new Date(),
        },
      },
      include: {
        fromCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        toCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
      },
      orderBy: { validFromDt: "desc" },
    });

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Exchange rate not found",
      });
    }

    res.json({
      success: true,
      data: rate,
    });
  } catch (error) {
    console.error("Get latest exchange rate error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest exchange rate",
      error: error.message,
    });
  }
};

// Create currency exchange rate
const createCurrencyExchangeRate = async (req, res) => {
  try {
    const {
      status,
      fromCurrencyId,
      toCurrencyId,
      exchangeRate,
      lowerRate,
      upperRate,
      validFromDt,
    } = req.body;

    // Validation
    if (
      !fromCurrencyId ||
      !toCurrencyId ||
      exchangeRate === undefined ||
      !validFromDt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "fromCurrencyId, toCurrencyId, exchangeRate, and validFromDt are required",
      });
    }

    const rate = await prisma.currencyExchangeRate.create({
      data: {
        status: status || "ACTIVE",
        fromCurrencyId,
        toCurrencyId,
        exchangeRate,
        lowerRate,
        upperRate,
        validFromDt: new Date(validFromDt),
      },
      include: {
        fromCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        toCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: rate,
      message: "Currency exchange rate created successfully",
    });
  } catch (error) {
    console.error("Create currency exchange rate error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating currency exchange rate",
      error: error.message,
    });
  }
};

// Update currency exchange rate
const updateCurrencyExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      fromCurrencyId,
      toCurrencyId,
      exchangeRate,
      lowerRate,
      upperRate,
      validFromDt,
    } = req.body;

    const rate = await prisma.currencyExchangeRate.update({
      where: { id },
      data: {
        status,
        fromCurrencyId,
        toCurrencyId,
        exchangeRate,
        lowerRate,
        upperRate,
        validFromDt: validFromDt ? new Date(validFromDt) : undefined,
      },
      include: {
        fromCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        toCurrency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: rate,
      message: "Currency exchange rate updated successfully",
    });
  } catch (error) {
    console.error("Update currency exchange rate error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Currency exchange rate not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating currency exchange rate",
      error: error.message,
    });
  }
};

// Delete currency exchange rate
const deleteCurrencyExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.currencyExchangeRate.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Currency exchange rate deleted successfully",
    });
  } catch (error) {
    console.error("Delete currency exchange rate error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Currency exchange rate not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error deleting currency exchange rate",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCurrencyExchangeRates,
  getCurrencyExchangeRateById,
  getLatestExchangeRate,
  createCurrencyExchangeRate,
  updateCurrencyExchangeRate,
  deleteCurrencyExchangeRate,
};
