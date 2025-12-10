const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all agents
const getAllAgents = async (req, res) => {
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

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
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
          bankAccounts: {
            select: {
              id: true,
              accountNum: true,
              accountName: true,
              currency: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.agent.count({ where }),
    ]);

    res.json({
      success: true,
      data: agents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch agents",
    });
  }
};

// Get agent by ID
const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await prisma.agent.findUnique({
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
        bankAccounts: {
          include: {
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
        },
        pickupTariffs: {
          include: {
            containerType: {
              select: {
                id: true,
                name: true,
                code: true,
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
          },
        },
        nextTariffs: {
          include: {
            containerType: {
              select: {
                id: true,
                name: true,
                code: true,
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
        },
      },
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Agent not found",
      });
    }

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch agent",
    });
  }
};

// Create agent
const createAgent = async (req, res) => {
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
      ownOffice,
      status,
      portId,
      email,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      address,
      mobNum,
      telNum,
      licenceNum,
      expContactDetails,
      impContactDetails,
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

    const agent = await prisma.agent.create({
      data: {
        name,
        companyName,
        ownOffice,
        status: status || "ACTIVE",
        portId,
        email,
        addressLine1,
        addressLine2,
        city,
        stateId,
        zipCode,
        countryId,
        address,
        mobNum,
        telNum,
        licenceNum,
        expContactDetails,
        impContactDetails,
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
      data: agent,
      message: "Agent created successfully",
    });
  } catch (error) {
    console.error("Error creating agent:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "An agent with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create agent",
    });
  }
};

// Update agent
const updateAgent = async (req, res) => {
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
      ownOffice,
      status,
      portId,
      email,
      addressLine1,
      addressLine2,
      city,
      stateId,
      zipCode,
      countryId,
      address,
      mobNum,
      telNum,
      licenceNum,
      expContactDetails,
      impContactDetails,
      gstNum,
      panNum,
    } = req.body;

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Agent not found",
      });
    }

    // Check if port exists if portId is being updated
    if (portId && portId !== existingAgent.portId) {
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
    if (stateId && stateId !== existingAgent.stateId) {
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
    if (countryId && countryId !== existingAgent.countryId) {
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

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(companyName && { companyName }),
        ...(ownOffice !== undefined && { ownOffice }),
        ...(status && { status }),
        ...(portId && { portId }),
        ...(email !== undefined && { email }),
        ...(addressLine1 !== undefined && { addressLine1 }),
        ...(addressLine2 !== undefined && { addressLine2 }),
        ...(city && { city }),
        ...(stateId && { stateId }),
        ...(zipCode !== undefined && { zipCode }),
        ...(countryId && { countryId }),
        ...(address !== undefined && { address }),
        ...(mobNum !== undefined && { mobNum }),
        ...(telNum !== undefined && { telNum }),
        ...(licenceNum !== undefined && { licenceNum }),
        ...(expContactDetails !== undefined && { expContactDetails }),
        ...(impContactDetails !== undefined && { impContactDetails }),
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
      data: agent,
      message: "Agent updated successfully",
    });
  } catch (error) {
    console.error("Error updating agent:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "An agent with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update agent",
    });
  }
};

// Delete agent
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Agent not found",
      });
    }

    await prisma.agent.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting agent:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete agent due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete agent",
    });
  }
};

module.exports = {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
};
