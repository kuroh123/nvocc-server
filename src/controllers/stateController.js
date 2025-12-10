const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all states
const getAllStates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, countryId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { codeChar2: { contains: search, mode: "insensitive" } },
        { codeChar3: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (countryId) {
      where.countryId = countryId;
    }

    const [states, total] = await Promise.all([
      prisma.state.findMany({
        where,
        include: {
          country: {
            select: {
              id: true,
              name: true,
              codeChar2: true,
              codeChar3: true,
            },
          },
          agents: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          bankAccounts: {
            select: {
              id: true,
              accountName: true,
            },
          },
          operators: {
            select: {
              id: true,
              name: true,
              companyName: true,
            },
          },
          depots: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: "asc" },
      }),
      prisma.state.count({ where }),
    ]);

    res.json({
      success: true,
      data: states,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch states",
    });
  }
};

// Get state by ID
const getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await prisma.state.findUnique({
      where: { id },
      include: {
        country: {
          select: {
            id: true,
            name: true,
            codeChar2: true,
            codeChar3: true,
          },
        },
        agents: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        bankAccounts: {
          select: {
            id: true,
            accountName: true,
          },
        },
        operators: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        depots: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "State not found",
      });
    }

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error("Error fetching state:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch state",
    });
  }
};

// Get states by country ID
const getStatesByCountryId = async (req, res) => {
  try {
    const { countryId } = req.params;
    const states = await prisma.state.findMany({
      where: {
        countryId,
        status: "ACTIVE",
      },
      include: {
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
      data: states,
    });
  } catch (error) {
    console.error("Error fetching states by country:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch states by country",
    });
  }
};

// Create state
const createState = async (req, res) => {
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

    const { name, countryId, codeChar2, codeChar3, status } = req.body;

    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid country specified",
      });
    }

    // Check for duplicate state code
    if (codeChar2) {
      const existingState = await prisma.state.findFirst({
        where: { codeChar2 },
      });

      if (existingState) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "State code already exists",
        });
      }
    }

    const state = await prisma.state.create({
      data: {
        name,
        countryId,
        codeChar2,
        codeChar3,
        status: status || "ACTIVE",
      },
      include: {
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
      data: state,
      message: "State created successfully",
    });
  } catch (error) {
    console.error("Error creating state:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A state with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create state",
    });
  }
};

// Update state
const updateState = async (req, res) => {
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
    const { name, countryId, codeChar2, codeChar3, status } = req.body;

    // Check if state exists
    const existingState = await prisma.state.findUnique({
      where: { id },
    });

    if (!existingState) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "State not found",
      });
    }

    // Check if country exists if countryId is being updated
    if (countryId && countryId !== existingState.countryId) {
      const country = await prisma.country.findUnique({
        where: { id: countryId },
      });

      if (!country) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid country specified",
        });
      }
    }

    // Check for duplicate state code if provided and different from current
    if (codeChar2 && codeChar2 !== existingState.codeChar2) {
      const duplicateState = await prisma.state.findFirst({
        where: {
          codeChar2,
          NOT: { id },
        },
      });

      if (duplicateState) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "State code already exists",
        });
      }
    }

    const state = await prisma.state.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(countryId && { countryId }),
        ...(codeChar2 !== undefined && { codeChar2 }),
        ...(codeChar3 !== undefined && { codeChar3 }),
        ...(status && { status }),
      },
      include: {
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
      data: state,
      message: "State updated successfully",
    });
  } catch (error) {
    console.error("Error updating state:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A state with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update state",
    });
  }
};

// Delete state
const deleteState = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if state exists
    const existingState = await prisma.state.findUnique({
      where: { id },
    });

    if (!existingState) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "State not found",
      });
    }

    await prisma.state.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "State deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting state:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete state due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete state",
    });
  }
};

module.exports = {
  getAllStates,
  getStateById,
  getStatesByCountryId,
  createState,
  updateState,
  deleteState,
};