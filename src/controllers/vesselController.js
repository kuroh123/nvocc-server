const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all vessels
const getAllVessels = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { imoNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [vessels, total] = await Promise.all([
      prisma.vessel.findMany({
        where,
        include: {
          schedules: {
            select: {
              id: true,
              etaDt: true,
              etdDt: true,
              pickupTerminal: {
                select: {
                  id: true,
                  name: true,
                  port: {
                    select: {
                      id: true,
                      name: true,
                      portCode: true,
                    },
                  },
                },
              },
              nextPortTerminal: {
                select: {
                  id: true,
                  name: true,
                  port: {
                    select: {
                      id: true,
                      name: true,
                      portCode: true,
                    },
                  },
                },
              },
            },
            orderBy: { etaDt: "asc" },
            take: 5, // Limit schedules for performance
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.vessel.count({ where }),
    ]);

    res.json({
      success: true,
      data: vessels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching vessels:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch vessels",
    });
  }
};

// Get vessel by ID
const getVesselById = async (req, res) => {
  try {
    const { id } = req.params;
    const vessel = await prisma.vessel.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            pickupTerminal: {
              select: {
                id: true,
                name: true,
                port: {
                  select: {
                    id: true,
                    name: true,
                    portCode: true,
                    country: {
                      select: {
                        id: true,
                        name: true,
                        codeChar2: true,
                      },
                    },
                  },
                },
              },
            },
            nextPortTerminal: {
              select: {
                id: true,
                name: true,
                port: {
                  select: {
                    id: true,
                    name: true,
                    portCode: true,
                    country: {
                      select: {
                        id: true,
                        name: true,
                        codeChar2: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { etaDt: "asc" },
        },
      },
    });

    if (!vessel) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vessel not found",
      });
    }

    res.json({
      success: true,
      data: vessel,
    });
  } catch (error) {
    console.error("Error fetching vessel:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch vessel",
    });
  }
};

// Create vessel
const createVessel = async (req, res) => {
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

    const { name, type, status, imoNumber, capacity, flag } = req.body;

    // Check for duplicate vessel name
    const existingVessel = await prisma.vessel.findFirst({
      where: { name },
    });

    if (existingVessel) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Vessel name already exists",
      });
    }

    // Check for duplicate IMO number if provided
    if (imoNumber) {
      const existingImo = await prisma.vessel.findFirst({
        where: { imoNumber },
      });

      if (existingImo) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "IMO number already exists",
        });
      }
    }

    const vessel = await prisma.vessel.create({
      data: {
        name,
        type,
        status: status || "ACTIVE",
        imoNumber,
        capacity,
        flag,
      },
    });

    res.status(201).json({
      success: true,
      data: vessel,
      message: "Vessel created successfully",
    });
  } catch (error) {
    console.error("Error creating vessel:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A vessel with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create vessel",
    });
  }
};

// Update vessel
const updateVessel = async (req, res) => {
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
    const { name, type, status, imoNumber, capacity, flag } = req.body;

    // Check if vessel exists
    const existingVessel = await prisma.vessel.findUnique({
      where: { id },
    });

    if (!existingVessel) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vessel not found",
      });
    }

    // Check for duplicate vessel name if provided and different from current
    if (name && name !== existingVessel.name) {
      const duplicateVessel = await prisma.vessel.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (duplicateVessel) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Vessel name already exists",
        });
      }
    }

    // Check for duplicate IMO number if provided and different from current
    if (imoNumber && imoNumber !== existingVessel.imoNumber) {
      const duplicateImo = await prisma.vessel.findFirst({
        where: {
          imoNumber,
          NOT: { id },
        },
      });

      if (duplicateImo) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "IMO number already exists",
        });
      }
    }

    const vessel = await prisma.vessel.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(status && { status }),
        ...(imoNumber !== undefined && { imoNumber }),
        ...(capacity !== undefined && { capacity }),
        ...(flag !== undefined && { flag }),
      },
    });

    res.json({
      success: true,
      data: vessel,
      message: "Vessel updated successfully",
    });
  } catch (error) {
    console.error("Error updating vessel:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A vessel with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update vessel",
    });
  }
};

// Delete vessel
const deleteVessel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vessel exists
    const existingVessel = await prisma.vessel.findUnique({
      where: { id },
      include: {
        schedules: true,
      },
    });

    if (!existingVessel) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vessel not found",
      });
    }

    // Check if vessel has associated schedules
    if (existingVessel.schedules.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Cannot delete vessel with associated schedules",
      });
    }

    await prisma.vessel.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Vessel deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vessel:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete vessel due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete vessel",
    });
  }
};

module.exports = {
  getAllVessels,
  getVesselById,
  createVessel,
  updateVessel,
  deleteVessel,
};