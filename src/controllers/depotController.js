const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all depots
const getAllDepots = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, portId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("Query Params:", req.query);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (portId) {
      where.portId = portId;
    }

    const [depots, total] = await Promise.all([
      prisma.depot.findMany({
        where,
        include: {
          port: {
            select: {
              id: true,
              name: true,
              portCode: true,
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
      prisma.depot.count({ where }),
    ]);

    res.json({
      success: true,
      data: depots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching depots:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch depots",
    });
  }
};

// Get depot by ID
const getDepotById = async (req, res) => {
  try {
    const { id } = req.params;
    const depot = await prisma.depot.findUnique({
      where: { id },
      include: {
        port: {
          select: {
            id: true,
            name: true,
            portCode: true,
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

    if (!depot) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Depot not found",
      });
    }

    res.json({
      success: true,
      data: depot,
    });
  } catch (error) {
    console.error("Error fetching depot:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch depot",
    });
  }
};

// Get depots by port ID
const getDepotsByPortId = async (req, res) => {
  try {
    const { portId } = req.params;
    const depots = await prisma.depot.findMany({
      where: { portId },
      include: {
        port: {
          select: {
            id: true,
            name: true,
            portCode: true,
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
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: depots,
    });
  } catch (error) {
    console.error("Error fetching depots by port:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch depots by port",
    });
  }
};

// Create depot
const createDepot = async (req, res) => {
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
      name,
      company,
      portId,
      status,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      gstNum,
      panNum,
    } = req.body;

    // Check if port exists
    if (portId) {
      const port = await prisma.port.findUnique({
        where: { id: portId },
      });

      if (!port) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid port specified",
        });
      }
    }

    const depot = await prisma.depot.create({
      data: {
        name,
        company,
        portId,
        status: status || "ACTIVE",
        addressLine1,
        addressLine2,
        city,
        stateId,
        zipCode,
        countryId,
        gstNum,
        panNum,
      },
      include: {
        port: {
          select: {
            id: true,
            name: true,
            portCode: true,
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
      data: depot,
      message: "Depot created successfully",
    });
  } catch (error) {
    console.error("Error creating depot:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A depot with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create depot",
    });
  }
};

// Update depot
const updateDepot = async (req, res) => {
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
      name,
      company,
      portId,
      status,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      gstNum,
      panNum,
    } = req.body;

    // Check if depot exists
    const existingDepot = await prisma.depot.findUnique({
      where: { id },
    });

    if (!existingDepot) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Depot not found",
      });
    }

    const depot = await prisma.depot.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(company && { company }),
        ...(portId && { portId }),
        ...(status && { status }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(city && { city }),
        ...(stateId && { stateId }),
        ...(zipCode !== undefined && { zipCode }),
        ...(countryId && { countryId }),
        ...(gstNum !== undefined && { gstNum }),
        ...(panNum !== undefined && { panNum }),
      },
      include: {
        port: {
          select: {
            id: true,
            name: true,
            portCode: true,
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
      data: depot,
      message: "Depot updated successfully",
    });
  } catch (error) {
    console.error("Error updating depot:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A depot with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update depot",
    });
  }
};

// Delete depot
const deleteDepot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if depot exists
    const existingDepot = await prisma.depot.findUnique({
      where: { id },
    });

    if (!existingDepot) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Depot not found",
      });
    }

    await prisma.depot.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Depot deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting depot:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete depot due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete depot",
    });
  }
};

module.exports = {
  getAllDepots,
  getDepotById,
  getDepotsByPortId,
  createDepot,
  updateDepot,
  deleteDepot,
};
