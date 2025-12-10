const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all operators
const getAllOperators = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, portId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (portId) {
      where.portId = portId;
    }

    const [operators, total] = await Promise.all([
      prisma.operator.findMany({
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
      prisma.operator.count({ where }),
    ]);

    res.json({
      success: true,
      data: operators,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching operators:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch operators",
    });
  }
};

// Get operator by ID
const getOperatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await prisma.operator.findUnique({
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

    if (!operator) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Operator not found",
      });
    }

    res.json({
      success: true,
      data: operator,
    });
  } catch (error) {
    console.error("Error fetching operator:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch operator",
    });
  }
};

// Get operators by port ID
const getOperatorsByPortId = async (req, res) => {
  try {
    const { portId } = req.params;
    const operators = await prisma.operator.findMany({
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
      data: operators,
    });
  } catch (error) {
    console.error("Error fetching operators by port:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch operators by port",
    });
  }
};

// Create operator
const createOperator = async (req, res) => {
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
      companyName,
      portId,
      status,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      address,
      mobNum,
      telNum,
      email,
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

    // Check if state exists
    if (stateId) {
      const state = await prisma.state.findUnique({
        where: { id: stateId },
      });

      if (!state) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid state specified",
        });
      }
    }

    // Check if country exists
    if (countryId) {
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

    const operator = await prisma.operator.create({
      data: {
        name,
        companyName,
        portId,
        status: status || "ACTIVE",
        addressLine1,
        addressLine2,
        city,
        stateId,
        zipCode,
        countryId,
        address,
        mobNum,
        telNum,
        email,
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
      data: operator,
      message: "Operator created successfully",
    });
  } catch (error) {
    console.error("Error creating operator:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "An operator with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create operator",
    });
  }
};

// Update operator
const updateOperator = async (req, res) => {
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
      companyName,
      portId,
      status,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      address,
      mobNum,
      telNum,
      email,
    } = req.body;

    // Check if operator exists
    const existingOperator = await prisma.operator.findUnique({
      where: { id },
    });

    if (!existingOperator) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Operator not found",
      });
    }

    // Check if port exists if portId is being updated
    if (portId && portId !== existingOperator.portId) {
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

    // Check if state exists if stateId is being updated
    if (stateId && stateId !== existingOperator.stateId) {
      const state = await prisma.state.findUnique({
        where: { id: stateId },
      });

      if (!state) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid state specified",
        });
      }
    }

    // Check if country exists if countryId is being updated
    if (countryId && countryId !== existingOperator.countryId) {
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

    const operator = await prisma.operator.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(portId && { portId }),
        ...(status && { status }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(city && { city }),
        ...(stateId && { stateId }),
        ...(zipCode !== undefined && { zipCode }),
        ...(countryId && { countryId }),
        ...(address !== undefined && { address }),
        ...(mobNum !== undefined && { mobNum }),
        ...(telNum !== undefined && { telNum }),
        ...(email !== undefined && { email }),
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
      data: operator,
      message: "Operator updated successfully",
    });
  } catch (error) {
    console.error("Error updating operator:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "An operator with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update operator",
    });
  }
};

// Delete operator
const deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if operator exists
    const existingOperator = await prisma.operator.findUnique({
      where: { id },
    });

    if (!existingOperator) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Operator not found",
      });
    }

    await prisma.operator.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Operator deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting operator:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete operator due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete operator",
    });
  }
};

module.exports = {
  getAllOperators,
  getOperatorById,
  getOperatorsByPortId,
  createOperator,
  updateOperator,
  deleteOperator,
};
