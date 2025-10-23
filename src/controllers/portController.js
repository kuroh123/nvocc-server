const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

class PortController {
  async getAllPorts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        portType,
        countryId,
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { portCode: { contains: search, mode: "insensitive" } },
          { itaCode: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (portType) {
        where.portType = portType;
      }

      if (countryId) {
        where.countryId = countryId;
      }

      const [ports, total] = await Promise.all([
        prisma.port.findMany({
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
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            terminals: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.port.count({ where }),
      ]);

      res.json({
        success: true,
        data: ports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching ports:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch ports",
      });
    }
  }

  async getPortById(req, res) {
    try {
      const { id } = req.params;

      const port = await prisma.port.findUnique({
        where: { id },
        include: {
          country: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          Terminal: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!port) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Port not found",
        });
      }

      res.json({
        success: true,
        data: port,
      });
    } catch (error) {
      console.error("Error fetching port:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch port",
      });
    }
  }

  async createPort(req, res) {
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
        portType,
        countryId,
        itaCode,
        portCode,
        customsDetails,
        status,
      } = req.body;
      const createdById = req.user?.id; // Assuming user is attached to req by auth middleware

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

      // Check for duplicate port code if provided
      if (portCode) {
        const existingPort = await prisma.port.findFirst({
          where: { portCode },
        });

        if (existingPort) {
          return res.status(409).json({
            success: false,
            error: "Conflict",
            message: "Port code already exists",
          });
        }
      }

      const newPort = await prisma.port.create({
        data: {
          name,
          portType,
          countryId,
          itaCode,
          portCode,
          customsDetails,
          status: status || "ACTIVE",
          createdById,
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
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: newPort,
        message: "Port created successfully",
      });
    } catch (error) {
      console.error("Error creating port:", error);

      // Handle Prisma unique constraint errors
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "A port with this information already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to create port",
      });
    }
  }

  async updatePort(req, res) {
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
        portType,
        countryId,
        itaCode,
        portCode,
        customsDetails,
        status,
      } = req.body;

      // Check if port exists
      const existingPort = await prisma.port.findUnique({
        where: { id },
      });

      if (!existingPort) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Port not found",
        });
      }

      // Check if country exists if countryId is being updated
      if (countryId && countryId !== existingPort.countryId) {
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

      // Check for duplicate port code if provided and different from current
      if (portCode && portCode !== existingPort.portCode) {
        const duplicatePort = await prisma.port.findFirst({
          where: {
            portCode,
            NOT: { id },
          },
        });

        if (duplicatePort) {
          return res.status(409).json({
            success: false,
            error: "Conflict",
            message: "Port code already exists",
          });
        }
      }

      const updatedPort = await prisma.port.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(portType && { portType }),
          ...(countryId && { countryId }),
          ...(itaCode !== undefined && { itaCode }),
          ...(portCode !== undefined && { portCode }),
          ...(customsDetails !== undefined && { customsDetails }),
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
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          Terminal: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: updatedPort,
        message: "Port updated successfully",
      });
    } catch (error) {
      console.error("Error updating port:", error);

      // Handle Prisma unique constraint errors
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "A port with this information already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to update port",
      });
    }
  }

  async deletePort(req, res) {
    try {
      const { id } = req.params;

      // Check if port exists
      const existingPort = await prisma.port.findUnique({
        where: { id },
        include: {
          Terminal: true,
        },
      });

      if (!existingPort) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Port not found",
        });
      }

      // Check if port has associated terminals
      if (existingPort.Terminal.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Validation Error",
          message: "Cannot delete port with associated terminals",
        });
      }

      await prisma.port.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Port deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting port:", error);

      // Handle foreign key constraint errors
      if (error.code === "P2003") {
        return res.status(400).json({
          success: false,
          error: "Constraint Error",
          message: "Cannot delete port due to existing relationships",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to delete port",
      });
    }
  }

  async getPortsByCountry(req, res) {
    try {
      const { countryId } = req.params;

      const ports = await prisma.port.findMany({
        where: {
          countryId,
          status: "ACTIVE",
        },
        include: {
          Terminal: {
            where: {
              status: "ACTIVE",
            },
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      res.json({
        success: true,
        data: ports,
      });
    } catch (error) {
      console.error("Error fetching ports by country:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch ports by country",
      });
    }
  }
}

module.exports = new PortController();
