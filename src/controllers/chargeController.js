const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all charges
const getAllCharges = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [charges, total] = await Promise.all([
      prisma.charge.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.charge.count({ where }),
    ]);

    res.json({
      success: true,
      data: charges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching charges:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch charges",
    });
  }
};

// Get charge by ID
const getChargeById = async (req, res) => {
  try {
    const { id } = req.params;
    const charge = await prisma.charge.findUnique({
      where: { id },
    });

    if (!charge) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Charge not found",
      });
    }

    res.json({
      success: true,
      data: charge,
    });
  } catch (error) {
    console.error("Error fetching charge:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch charge",
    });
  }
};

// Create charge
const createCharge = async (req, res) => {
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

    const { name, code, status, description } = req.body;

    // Check for duplicate charge code
    if (code) {
      const existingCharge = await prisma.charge.findFirst({
        where: { code },
      });

      if (existingCharge) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Charge code already exists",
        });
      }
    }

    const charge = await prisma.charge.create({
      data: {
        name,
        code,
        status: status || "ACTIVE",
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: charge,
      message: "Charge created successfully",
    });
  } catch (error) {
    console.error("Error creating charge:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A charge with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create charge",
    });
  }
};

// Update charge
const updateCharge = async (req, res) => {
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
    const { name, code, status, description } = req.body;

    // Check if charge exists
    const existingCharge = await prisma.charge.findUnique({
      where: { id },
    });

    if (!existingCharge) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Charge not found",
      });
    }

    // Check for duplicate charge code if provided and different from current
    if (code && code !== existingCharge.code) {
      const duplicateCharge = await prisma.charge.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (duplicateCharge) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Charge code already exists",
        });
      }
    }

    const charge = await prisma.charge.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code !== undefined && { code }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({
      success: true,
      data: charge,
      message: "Charge updated successfully",
    });
  } catch (error) {
    console.error("Error updating charge:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A charge with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update charge",
    });
  }
};

// Delete charge
const deleteCharge = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if charge exists
    const existingCharge = await prisma.charge.findUnique({
      where: { id },
    });

    if (!existingCharge) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Charge not found",
      });
    }

    await prisma.charge.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Charge deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting charge:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete charge due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete charge",
    });
  }
};

module.exports = {
  getAllCharges,
  getChargeById,
  createCharge,
  updateCharge,
  deleteCharge,
};