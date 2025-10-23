const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all tariffs
const getAllTariffs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      eventType,
      productType,
      containerTypeId,
      pickPortId,
      nextPortId,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { eventType: { contains: search, mode: "insensitive" } },
        { productType: { contains: search, mode: "insensitive" } },
      ];
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (productType) {
      where.productType = productType;
    }

    if (containerTypeId) {
      where.containerTypeId = containerTypeId;
    }

    if (pickPortId) {
      where.pickPortId = pickPortId;
    }

    if (nextPortId) {
      where.nextPortId = nextPortId;
    }

    const [tariffs, total] = await Promise.all([
      prisma.tariff.findMany({
        where,
        include: {
          containerType: {
            select: {
              id: true,
              name: true,
              isoCode: true,
            },
          },
          pickAgent: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          pickPort: {
            select: {
              id: true,
              name: true,
              portCode: true,
            },
          },
          pickTerminal: {
            select: {
              id: true,
              name: true,
            },
          },
          nextAgent: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          nextPort: {
            select: {
              id: true,
              name: true,
              portCode: true,
            },
          },
          nextTerminal: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.tariff.count({ where }),
    ]);

    res.json({
      success: true,
      data: tariffs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching tariffs:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch tariffs",
    });
  }
};

// Get tariff by ID
const getTariffById = async (req, res) => {
  try {
    const { id } = req.params;
    const tariff = await prisma.tariff.findUnique({
      where: { id },
      include: {
        containerType: {
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        pickAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        pickPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        pickTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
        nextAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        nextPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        nextTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tariff) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Tariff not found",
      });
    }

    res.json({
      success: true,
      data: tariff,
    });
  } catch (error) {
    console.error("Error fetching tariff:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch tariff",
    });
  }
};

// Get tariffs by event type
const getTariffsByEventType = async (req, res) => {
  try {
    const { eventType } = req.params;
    const tariffs = await prisma.tariff.findMany({
      where: { eventType },
      include: {
        containerType: {
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        pickAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        pickPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        pickTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
        nextAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        nextPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        nextTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    console.error("Error fetching tariffs by event type:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch tariffs by event type",
    });
  }
};

// Get tariffs by product type
const getTariffsByProductType = async (req, res) => {
  try {
    const { productType } = req.params;
    const tariffs = await prisma.tariff.findMany({
      where: { productType },
      include: {
        containerType: {
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        pickAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        pickPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        pickTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
        nextAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        nextPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        nextTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    console.error("Error fetching tariffs by product type:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch tariffs by product type",
    });
  }
};

// Search tariffs with filters
const searchTariffs = async (req, res) => {
  try {
    const {
      eventType,
      productType,
      containerTypeId,
      pickPortId,
      nextPortId,
      pickAgentId,
      nextAgentId,
    } = req.query;

    const where = {};

    if (eventType) where.eventType = eventType;
    if (productType) where.productType = productType;
    if (containerTypeId) where.containerTypeId = containerTypeId;
    if (pickPortId) where.pickPortId = pickPortId;
    if (nextPortId) where.nextPortId = nextPortId;
    if (pickAgentId) where.pickAgentId = pickAgentId;
    if (nextAgentId) where.nextAgentId = nextAgentId;

    const tariffs = await prisma.tariff.findMany({
      where,
      include: {
        containerType: {
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        pickAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        pickPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        pickTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
        nextAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        nextPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        nextTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: tariffs,
    });
  } catch (error) {
    console.error("Error searching tariffs:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to search tariffs",
    });
  }
};

// Create tariff
const createTariff = async (req, res) => {
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
      eventType,
      productType,
      containerTypeId,
      qty,
      rate,
      pickAgentId,
      pickPortId,
      pickTerminalId,
      nextAgentId,
      nextPortId,
      nextTerminalId,
    } = req.body;

    // Validate related entities exist
    if (containerTypeId) {
      const containerType = await prisma.containerType.findUnique({
        where: { id: containerTypeId },
      });
      if (!containerType) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid container type specified",
        });
      }
    }

    if (pickAgentId) {
      const pickAgent = await prisma.agent.findUnique({
        where: { id: pickAgentId },
      });
      if (!pickAgent) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid pickup agent specified",
        });
      }
    }

    if (pickPortId) {
      const pickPort = await prisma.port.findUnique({
        where: { id: pickPortId },
      });
      if (!pickPort) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid pickup port specified",
        });
      }
    }

    const tariff = await prisma.tariff.create({
      data: {
        eventType,
        productType,
        containerTypeId,
        qty,
        rate,
        pickAgentId,
        pickPortId,
        pickTerminalId,
        nextAgentId,
        nextPortId,
        nextTerminalId,
      },
      include: {
        containerType: {
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        pickAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        pickPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        pickTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
        nextAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        nextPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        nextTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: tariff,
      message: "Tariff created successfully",
    });
  } catch (error) {
    console.error("Error creating tariff:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A tariff with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create tariff",
    });
  }
};

// Update tariff
const updateTariff = async (req, res) => {
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
      eventType,
      productType,
      containerTypeId,
      qty,
      rate,
      pickAgentId,
      pickPortId,
      pickTerminalId,
      nextAgentId,
      nextPortId,
      nextTerminalId,
    } = req.body;

    // Check if tariff exists
    const existingTariff = await prisma.tariff.findUnique({
      where: { id },
    });

    if (!existingTariff) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Tariff not found",
      });
    }

    const tariff = await prisma.tariff.update({
      where: { id },
      data: {
        ...(eventType && { eventType }),
        ...(productType && { productType }),
        ...(containerTypeId && { containerTypeId }),
        ...(qty !== undefined && { qty }),
        ...(rate !== undefined && { rate }),
        ...(pickAgentId && { pickAgentId }),
        ...(pickPortId && { pickPortId }),
        ...(pickTerminalId && { pickTerminalId }),
        ...(nextAgentId && { nextAgentId }),
        ...(nextPortId && { nextPortId }),
        ...(nextTerminalId && { nextTerminalId }),
      },
      include: {
        containerType: {
          select: {
            id: true,
            name: true,
            isoCode: true,
          },
        },
        pickAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        pickPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        pickTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
        nextAgent: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        nextPort: {
          select: {
            id: true,
            name: true,
            portCode: true,
          },
        },
        nextTerminal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: tariff,
      message: "Tariff updated successfully",
    });
  } catch (error) {
    console.error("Error updating tariff:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A tariff with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update tariff",
    });
  }
};

// Delete tariff
const deleteTariff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tariff exists
    const existingTariff = await prisma.tariff.findUnique({
      where: { id },
    });

    if (!existingTariff) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Tariff not found",
      });
    }

    await prisma.tariff.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Tariff deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tariff:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete tariff due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete tariff",
    });
  }
};

module.exports = {
  getAllTariffs,
  getTariffById,
  getTariffsByEventType,
  getTariffsByProductType,
  searchTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
};
