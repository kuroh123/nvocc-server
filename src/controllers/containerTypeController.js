const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all container types
const getAllContainerTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { isoCode: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [containerTypes, total] = await Promise.all([
      prisma.containerType.findMany({
        where,
        include: {
          tariffs: {
            select: {
              id: true,
              rate: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.containerType.count({ where }),
    ]);

    res.json({
      success: true,
      data: containerTypes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching container types:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch container types",
    });
  }
};

// Get container type by ID
const getContainerTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const containerType = await prisma.containerType.findUnique({
      where: { id },
      include: {
        tariffs: {
          include: {
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
        },
      },
    });

    if (!containerType) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Container type not found",
      });
    }

    res.json({
      success: true,
      data: containerType,
    });
  } catch (error) {
    console.error("Error fetching container type:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch container type",
    });
  }
};

// Create container type
const createContainerType = async (req, res) => {
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

    const { name, isoCode, code, type, status, notes } = req.body;

    // Check for duplicate container type code or isoCode
    if (code) {
      const existingContainerType = await prisma.containerType.findFirst({
        where: { code },
      });

      if (existingContainerType) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Container type code already exists",
        });
      }
    }

    if (isoCode) {
      const existingIsoCode = await prisma.containerType.findFirst({
        where: { isoCode },
      });

      if (existingIsoCode) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "ISO code already exists",
        });
      }
    }

    const containerType = await prisma.containerType.create({
      data: {
        name,
        isoCode,
        code,
        type,
        status: status || "ACTIVE",
        notes,
      },
    });

    res.status(201).json({
      success: true,
      data: containerType,
      message: "Container type created successfully",
    });
  } catch (error) {
    console.error("Error creating container type:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A container type with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create container type",
    });
  }
};

// Update container type
const updateContainerType = async (req, res) => {
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
    const { name, isoCode, code, type, status, notes } = req.body;

    // Check if container type exists
    const existingContainerType = await prisma.containerType.findUnique({
      where: { id },
    });

    if (!existingContainerType) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Container type not found",
      });
    }

    // Check for duplicate code if provided and different from current
    if (code && code !== existingContainerType.code) {
      const duplicateCode = await prisma.containerType.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (duplicateCode) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Container type code already exists",
        });
      }
    }

    // Check for duplicate isoCode if provided and different from current
    if (isoCode && isoCode !== existingContainerType.isoCode) {
      const duplicateIsoCode = await prisma.containerType.findFirst({
        where: {
          isoCode,
          NOT: { id },
        },
      });

      if (duplicateIsoCode) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "ISO code already exists",
        });
      }
    }

    const containerType = await prisma.containerType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(isoCode !== undefined && { isoCode }),
        ...(code !== undefined && { code }),
        ...(type && { type }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({
      success: true,
      data: containerType,
      message: "Container type updated successfully",
    });
  } catch (error) {
    console.error("Error updating container type:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A container type with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update container type",
    });
  }
};

// Delete container type
const deleteContainerType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if container type exists
    const existingContainerType = await prisma.containerType.findUnique({
      where: { id },
    });

    if (!existingContainerType) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Container type not found",
      });
    }

    await prisma.containerType.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Container type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting container type:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete container type due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete container type",
    });
  }
};

module.exports = {
  getAllContainerTypes,
  getContainerTypeById,
  createContainerType,
  updateContainerType,
  deleteContainerType,
};
