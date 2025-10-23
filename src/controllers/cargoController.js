const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all cargo
const getAllCargo = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, cargoType } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    if (status) {
      where.status = status;
    }

    if (cargoType) {
      where.cargoType = cargoType;
    }

    const [cargo, total] = await Promise.all([
      prisma.cargo.findMany({
        where,
        include: {
          commodities: {
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
      prisma.cargo.count({ where }),
    ]);

    res.json({
      success: true,
      data: cargo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching cargo:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch cargo",
    });
  }
};

// Get cargo by ID
const getCargoById = async (req, res) => {
  try {
    const { id } = req.params;
    const cargo = await prisma.cargo.findUnique({
      where: { id },
      include: {
        commodities: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!cargo) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Cargo not found",
      });
    }

    res.json({
      success: true,
      data: cargo,
    });
  } catch (error) {
    console.error("Error fetching cargo:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch cargo",
    });
  }
};

// Create cargo
const createCargo = async (req, res) => {
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

    const { name, status, cargoType } = req.body;

    // Check for duplicate cargo name
    const existingCargo = await prisma.cargo.findFirst({
      where: { name },
    });

    if (existingCargo) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Cargo name already exists",
      });
    }

    const cargo = await prisma.cargo.create({
      data: {
        name,
        status: status || "ACTIVE",
        cargoType,
      },
      include: {
        commodities: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: cargo,
      message: "Cargo created successfully",
    });
  } catch (error) {
    console.error("Error creating cargo:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A cargo with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create cargo",
    });
  }
};

// Update cargo
const updateCargo = async (req, res) => {
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
    const { name, status, cargoType } = req.body;

    // Check if cargo exists
    const existingCargo = await prisma.cargo.findUnique({
      where: { id },
    });

    if (!existingCargo) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Cargo not found",
      });
    }

    // Check for duplicate cargo name if provided and different from current
    if (name && name !== existingCargo.name) {
      const duplicateCargo = await prisma.cargo.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (duplicateCargo) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Cargo name already exists",
        });
      }
    }

    const cargo = await prisma.cargo.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(cargoType && { cargoType }),
      },
      include: {
        commodities: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: cargo,
      message: "Cargo updated successfully",
    });
  } catch (error) {
    console.error("Error updating cargo:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A cargo with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update cargo",
    });
  }
};

// Delete cargo
const deleteCargo = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cargo exists
    const existingCargo = await prisma.cargo.findUnique({
      where: { id },
    });

    if (!existingCargo) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Cargo not found",
      });
    }

    await prisma.cargo.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Cargo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting cargo:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete cargo due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete cargo",
    });
  }
};

module.exports = {
  getAllCargo,
  getCargoById,
  createCargo,
  updateCargo,
  deleteCargo,
};
