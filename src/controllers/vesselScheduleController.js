const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

// Get all vessel schedules
const getAllVesselSchedules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      vesselId,
      pickupTerminalId,
      nextPortTerminalId,
      fromDate,
      toDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { voyage: { contains: search, mode: "insensitive" } },
        { serviceName: { contains: search, mode: "insensitive" } },
        { pickupLocation: { contains: search, mode: "insensitive" } },
        { nextPortLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    if (vesselId) {
      where.vesselId = vesselId;
    }

    if (pickupTerminalId) {
      where.pickupTerminalId = pickupTerminalId;
    }

    if (nextPortTerminalId) {
      where.nextPortTerminalId = nextPortTerminalId;
    }

    // Date range filter
    if (fromDate || toDate) {
      where.etaDt = {};
      if (fromDate) {
        where.etaDt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.etaDt.lte = new Date(toDate);
      }
    }

    const [schedules, total] = await Promise.all([
      prisma.vesselSchedule.findMany({
        where,
        include: {
          vessel: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
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
        skip,
        take: parseInt(limit),
        orderBy: { etaDt: "asc" },
      }),
      prisma.vesselSchedule.count({ where }),
    ]);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching vessel schedules:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch vessel schedules",
    });
  }
};

// Get vessel schedule by ID
const getVesselScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await prisma.vesselSchedule.findUnique({
      where: { id },
      include: {
        vessel: {
          select: {
            id: true,
            name: true,
            type: true,
            capacity: true,
            flag: true,
          },
        },
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
                    codeChar3: true,
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
                    codeChar3: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vessel schedule not found",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error fetching vessel schedule:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch vessel schedule",
    });
  }
};

// Get schedules by vessel ID
const getSchedulesByVesselId = async (req, res) => {
  try {
    const { vesselId } = req.params;
    const { upcoming } = req.query;

    const where = { vesselId };

    // Filter for upcoming schedules if requested
    if (upcoming === "true") {
      where.etaDt = {
        gte: new Date(),
      };
    }

    const schedules = await prisma.vesselSchedule.findMany({
      where,
      include: {
        vessel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
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
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error("Error fetching schedules by vessel:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to fetch schedules by vessel",
    });
  }
};

// Create vessel schedule
const createVesselSchedule = async (req, res) => {
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
      vesselId,
      voyage,
      serviceName,
      gateOpen,
      cutOff,
      pickupLocation,
      pickupTerminalId,
      etaDt,
      etdDt,
      nextPortLocation,
      nextPortTerminalId,
      nextPortArrivalDt,
      pcNum,
      pcDt,
      sobDt,
      ataDt,
      sobDescription,
      ataDescription,
      imNum,
      imDt,
      imoCode,
      callSign,
      lineCode,
      lineIgmNum,
      lineIgmDt,
      space20ft,
      space40ft,
      tba,
    } = req.body;

    // Validate that vessel exists
    const vessel = await prisma.vessel.findUnique({
      where: { id: vesselId },
    });

    if (!vessel) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Invalid vessel specified",
      });
    }

    // Validate pickup terminal if provided
    if (pickupTerminalId) {
      const pickupTerminal = await prisma.terminal.findUnique({
        where: { id: pickupTerminalId },
      });

      if (!pickupTerminal) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid pickup terminal specified",
        });
      }
    }

    // Validate next port terminal if provided
    if (nextPortTerminalId) {
      const nextPortTerminal = await prisma.terminal.findUnique({
        where: { id: nextPortTerminalId },
      });

      if (!nextPortTerminal) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid next port terminal specified",
        });
      }
    }

    const schedule = await prisma.vesselSchedule.create({
      data: {
        vesselId,
        voyage,
        serviceName,
        gateOpen: gateOpen ? new Date(gateOpen) : null,
        cutOff: cutOff ? new Date(cutOff) : null,
        pickupLocation,
        pickupTerminalId,
        etaDt: etaDt ? new Date(etaDt) : null,
        etdDt: etdDt ? new Date(etdDt) : null,
        nextPortLocation,
        nextPortTerminalId,
        nextPortArrivalDt: nextPortArrivalDt
          ? new Date(nextPortArrivalDt)
          : null,
        pcNum,
        pcDt: pcDt ? new Date(pcDt) : null,
        sobDt: sobDt ? new Date(sobDt) : null,
        ataDt: ataDt ? new Date(ataDt) : null,
        sobDescription,
        ataDescription,
        imNum,
        imDt: imDt ? new Date(imDt) : null,
        imoCode,
        callSign,
        lineCode,
        lineIgmNum,
        lineIgmDt: lineIgmDt ? new Date(lineIgmDt) : null,
        space20ft,
        space40ft,
        tba,
      },
      include: {
        vessel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
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
    });

    res.status(201).json({
      success: true,
      data: schedule,
      message: "Vessel schedule created successfully",
    });
  } catch (error) {
    console.error("Error creating vessel schedule:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A vessel schedule with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to create vessel schedule",
    });
  }
};

// Update vessel schedule
const updateVesselSchedule = async (req, res) => {
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
      vesselId,
      voyage,
      serviceName,
      gateOpen,
      cutOff,
      pickupLocation,
      pickupTerminalId,
      etaDt,
      etdDt,
      nextPortLocation,
      nextPortTerminalId,
      nextPortArrivalDt,
      pcNum,
      pcDt,
      sobDt,
      ataDt,
      sobDescription,
      ataDescription,
      imNum,
      imDt,
      imoCode,
      callSign,
      lineCode,
      lineIgmNum,
      lineIgmDt,
      space20ft,
      space40ft,
      tba,
    } = req.body;

    // Check if vessel schedule exists
    const existingSchedule = await prisma.vesselSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vessel schedule not found",
      });
    }

    // Validate vessel if being updated
    if (vesselId && vesselId !== existingSchedule.vesselId) {
      const vessel = await prisma.vessel.findUnique({
        where: { id: vesselId },
      });

      if (!vessel) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Invalid vessel specified",
        });
      }
    }

    const schedule = await prisma.vesselSchedule.update({
      where: { id },
      data: {
        ...(vesselId && { vesselId }),
        ...(voyage !== undefined && { voyage }),
        ...(serviceName !== undefined && { serviceName }),
        ...(gateOpen !== undefined && {
          gateOpen: gateOpen ? new Date(gateOpen) : null,
        }),
        ...(cutOff !== undefined && {
          cutOff: cutOff ? new Date(cutOff) : null,
        }),
        ...(pickupLocation !== undefined && { pickupLocation }),
        ...(pickupTerminalId !== undefined && { pickupTerminalId }),
        ...(etaDt !== undefined && { etaDt: etaDt ? new Date(etaDt) : null }),
        ...(etdDt !== undefined && { etdDt: etdDt ? new Date(etdDt) : null }),
        ...(nextPortLocation !== undefined && { nextPortLocation }),
        ...(nextPortTerminalId !== undefined && { nextPortTerminalId }),
        ...(nextPortArrivalDt !== undefined && {
          nextPortArrivalDt: nextPortArrivalDt
            ? new Date(nextPortArrivalDt)
            : null,
        }),
        ...(pcNum !== undefined && { pcNum }),
        ...(pcDt !== undefined && { pcDt: pcDt ? new Date(pcDt) : null }),
        ...(sobDt !== undefined && { sobDt: sobDt ? new Date(sobDt) : null }),
        ...(ataDt !== undefined && { ataDt: ataDt ? new Date(ataDt) : null }),
        ...(sobDescription !== undefined && { sobDescription }),
        ...(ataDescription !== undefined && { ataDescription }),
        ...(imNum !== undefined && { imNum }),
        ...(imDt !== undefined && { imDt: imDt ? new Date(imDt) : null }),
        ...(imoCode !== undefined && { imoCode }),
        ...(callSign !== undefined && { callSign }),
        ...(lineCode !== undefined && { lineCode }),
        ...(lineIgmNum !== undefined && { lineIgmNum }),
        ...(lineIgmDt !== undefined && {
          lineIgmDt: lineIgmDt ? new Date(lineIgmDt) : null,
        }),
        ...(space20ft !== undefined && { space20ft }),
        ...(space40ft !== undefined && { space40ft }),
        ...(tba !== undefined && { tba }),
      },
      include: {
        vessel: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
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
    });

    res.json({
      success: true,
      data: schedule,
      message: "Vessel schedule updated successfully",
    });
  } catch (error) {
    console.error("Error updating vessel schedule:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A vessel schedule with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to update vessel schedule",
    });
  }
};

// Delete vessel schedule
const deleteVesselSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vessel schedule exists
    const existingSchedule = await prisma.vesselSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Vessel schedule not found",
      });
    }

    await prisma.vesselSchedule.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Vessel schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vessel schedule:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        error: "Constraint Error",
        message: "Cannot delete vessel schedule due to existing relationships",
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to delete vessel schedule",
    });
  }
};

module.exports = {
  getAllVesselSchedules,
  getVesselScheduleById,
  getSchedulesByVesselId,
  createVesselSchedule,
  updateVesselSchedule,
  deleteVesselSchedule,
};
