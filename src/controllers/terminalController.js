const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

class TerminalController {
  async getAllTerminals(req, res) {
    try {
      const { page = 1, limit = 10, search, status, portId } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const where = {};

      if (search) {
        where.OR = [{ name: { contains: search, mode: "insensitive" } }];
      }

      if (status) {
        where.status = status;
      }

      if (portId) {
        where.portId = portId;
      }

      const [terminals, total] = await Promise.all([
        prisma.terminal.findMany({
          where,
          include: {
            port: {
              select: {
                id: true,
                name: true,
                portType: true,
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
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.terminal.count({ where }),
      ]);

      res.json({
        success: true,
        data: terminals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching terminals:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch terminals",
      });
    }
  }

  async getTerminalById(req, res) {
    try {
      const { id } = req.params;

      const terminal = await prisma.terminal.findUnique({
        where: { id },
        include: {
          port: {
            include: {
              country: true,
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

      if (!terminal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Terminal not found",
        });
      }

      res.json({
        success: true,
        data: terminal,
      });
    } catch (error) {
      console.error("Error fetching terminal:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch terminal",
      });
    }
  }

  async createTerminal(req, res) {
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

      const { name, portId, status, description } = req.body;
      const createdById = req.user?.id; // Assuming user is attached to req by auth middleware

      // Check if port exists
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

      // Check for duplicate terminal name
      const existingTerminal = await prisma.terminal.findFirst({
        where: { name },
      });

      if (existingTerminal) {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "Terminal name already exists",
        });
      }

      const newTerminal = await prisma.terminal.create({
        data: {
          name,
          portId,
          status: status || "ACTIVE",
          description,
          createdById,
        },
        include: {
          port: {
            select: {
              id: true,
              name: true,
              portType: true,
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
        data: newTerminal,
        message: "Terminal created successfully",
      });
    } catch (error) {
      console.error("Error creating terminal:", error);

      // Handle Prisma unique constraint errors
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "A terminal with this information already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to create terminal",
      });
    }
  }

  async updateTerminal(req, res) {
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
      const { name, portId, status, description } = req.body;

      // Check if terminal exists
      const existingTerminal = await prisma.terminal.findUnique({
        where: { id },
      });

      if (!existingTerminal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Terminal not found",
        });
      }

      // Check if port exists if portId is being updated
      if (portId && portId !== existingTerminal.portId) {
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

      // Check for duplicate terminal name if provided and different from current
      if (name && name !== existingTerminal.name) {
        const duplicateTerminal = await prisma.terminal.findFirst({
          where: {
            name,
            NOT: { id },
          },
        });

        if (duplicateTerminal) {
          return res.status(409).json({
            success: false,
            error: "Conflict",
            message: "Terminal name already exists",
          });
        }
      }

      const updatedTerminal = await prisma.terminal.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(portId && { portId }),
          ...(status && { status }),
          ...(description && { description }),
        },
        include: {
          port: {
            select: {
              id: true,
              name: true,
              portType: true,
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

      res.json({
        success: true,
        data: updatedTerminal,
        message: "Terminal updated successfully",
      });
    } catch (error) {
      console.error("Error updating terminal:", error);

      // Handle Prisma unique constraint errors
      if (error.code === "P2002") {
        return res.status(409).json({
          success: false,
          error: "Conflict",
          message: "A terminal with this information already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to update terminal",
      });
    }
  }

  async deleteTerminal(req, res) {
    try {
      const { id } = req.params;

      // Check if terminal exists
      const existingTerminal = await prisma.terminal.findUnique({
        where: { id },
      });

      if (!existingTerminal) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Terminal not found",
        });
      }

      await prisma.terminal.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Terminal deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting terminal:", error);

      // Handle foreign key constraint errors
      if (error.code === "P2003") {
        return res.status(400).json({
          success: false,
          error: "Constraint Error",
          message: "Cannot delete terminal due to existing relationships",
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to delete terminal",
      });
    }
  }

  async getTerminalsByPort(req, res) {
    try {
      const { portId } = req.params;

      const terminals = await prisma.terminal.findMany({
        where: {
          portId,
          status: "ACTIVE",
        },
        include: {
          port: {
            select: {
              id: true,
              name: true,
              portType: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      res.json({
        success: true,
        data: terminals,
      });
    } catch (error) {
      console.error("Error fetching terminals by port:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch terminals by port",
      });
    }
  }
}

module.exports = new TerminalController();
