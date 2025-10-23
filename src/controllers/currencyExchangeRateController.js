const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all currency exchange rates
const getAllCurrencyExchangeRates = async (req, res) => {
  try {
    const rates = await prisma.currencyExchangeRate.findMany({
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
      orderBy: { validFromDt: "desc" },
    });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get currency exchange rate by ID
const getCurrencyExchangeRateById = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await prisma.currencyExchangeRate.findUnique({
      where: { id },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    if (!rate) {
      return res
        .status(404)
        .json({ error: "Currency exchange rate not found" });
    }

    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get latest exchange rate between two currencies
const getLatestExchangeRate = async (req, res) => {
  try {
    const { fromCurrencyId, toCurrencyId } = req.query;

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
        fromCurrency: true,
        toCurrency: true,
      },
      orderBy: { validFromDt: "desc" },
    });

    if (!rate) {
      return res.status(404).json({ error: "Exchange rate not found" });
    }

    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const rate = await prisma.currencyExchangeRate.create({
      data: {
        status,
        fromCurrencyId,
        toCurrencyId,
        exchangeRate,
        lowerRate,
        upperRate,
        validFromDt: new Date(validFromDt),
      },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    res.status(201).json(rate);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
        fromCurrency: true,
        toCurrency: true,
      },
    });

    res.json(rate);
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "Currency exchange rate not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete currency exchange rate
const deleteCurrencyExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.currencyExchangeRate.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "Currency exchange rate not found" });
    }
    res.status(500).json({ error: error.message });
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
