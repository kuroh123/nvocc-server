const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all commodities
const getAllCommodities = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, cargoId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { hsCode: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (cargoId) {
      where.cargoId = cargoId;
    }

    const [commodities, total] = await Promise.all([
      prisma.commodity.findMany({
        where,
        include: {
          cargo: {
            select: {
              id: true,
              name: true,
              cargoType: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.commodity.count({ where }),
    ]);

    res.json({
      success: true,
      data: commodities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching commodities:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch commodities",
    });
  }
};

// Get commodity by ID
const getCommodityById = async (req, res) => {
  try {
    const { id } = req.params;
    const commodity = await prisma.commodity.findUnique({
      where: { id },
      include: {
        cargo: {
          select: {
            id: true,
            name: true,
            cargoType: true,
          },
        },
      },
    });

    if (!commodity) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Commodity not found",
      });
    }

    res.json({
      success: true,
      data: commodity,
    });
  } catch (error) {
    console.error("Error fetching commodity:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch commodity",
    });
  }
};

// Get commodities by cargo ID
const getCommoditiesByCargoId = async (req, res) => {
  try {
    const { cargoId } = req.params;
    const commodities = await prisma.commodity.findMany({
      where: { cargoId },
      include: {
        cargo: {
          select: {
            id: true,
            name: true,
            cargoType: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: commodities,
    });
  } catch (error) {
    console.error("Error fetching commodities by cargo:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch commodities by cargo",
    });
  }
};

// Create commodity
const createCommodity = async (req, res) => {
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

    const { name, cargoId, description, status, code, hsCode } = req.body;

    // Check if cargo exists
    if (cargoId) {
      const cargo = await prisma.cargo.findUnique({
        where: { id: cargoId },
      });

      if (!cargo) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid cargo specified",
        });
      }
    }

    // Check for duplicate commodity code if provided
    if (code) {
      const existingCommodity = await prisma.commodity.findFirst({
        where: { code },
      });

      if (existingCommodity) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Commodity code already exists",
        });
      }
    }

    const commodity = await prisma.commodity.create({
      data: {
        name,
        cargoId,
        description,
        status: status || "ACTIVE",
        code,
        hsCode,
      },
      include: {
        cargo: {
          select: {
            id: true,
            name: true,
            cargoType: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: commodity,
      message: "Commodity created successfully",
    });
  } catch (error) {
    console.error("Error creating commodity:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A commodity with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create commodity",
    });
  }
};

// Update commodity
const updateCommodity = async (req, res) => {
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
    const { name, cargoId, description, status, code, hsCode } = req.body;

    // Check if commodity exists
    const existingCommodity = await prisma.commodity.findUnique({
      where: { id },
    });

    if (!existingCommodity) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Commodity not found",
      });
    }

    // Check if cargo exists if cargoId is being updated
    if (cargoId && cargoId !== existingCommodity.cargoId) {
      const cargo = await prisma.cargo.findUnique({
        where: { id: cargoId },
      });

      if (!cargo) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid cargo specified",
        });
      }
    }

    // Check for duplicate commodity code if provided and different from current
    if (code && code !== existingCommodity.code) {
      const duplicateCommodity = await prisma.commodity.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (duplicateCommodity) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Commodity code already exists",
        });
      }
    }

    const commodity = await prisma.commodity.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(cargoId && { cargoId }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(code !== undefined && { code }),
        ...(hsCode !== undefined && { hsCode }),
      },
      include: {
        cargo: {
          select: {
            id: true,
            name: true,
            cargoType: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: commodity,
      message: "Commodity updated successfully",
    });
  } catch (error) {
    console.error("Error updating commodity:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A commodity with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update commodity",
    });
  }
};

// Delete commodity
const deleteCommodity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if commodity exists
    const existingCommodity = await prisma.commodity.findUnique({
      where: { id },
    });

    if (!existingCommodity) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Commodity not found",
      });
    }

    await prisma.commodity.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Commodity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting commodity:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete commodity due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete commodity",
    });
  }
};

module.exports = {
  getAllCommodities,
  getCommodityById,
  getCommoditiesByCargoId,
  createCommodity,
  updateCommodity,
  deleteCommodity,
};