const prisma = require("../utils/prisma");

class PortController {
  async getAllPorts(req, res) {
    try {
      const ports = await prisma.port.findMany({
        include: {
          country: true,
          createdBy: true,
        },
      });
      res.json(ports);
    } catch (error) {
      console.error("Error fetching ports:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createPort(req, res) {
    try {
      const portData = req.body;
      const newPort = await prisma.port.create({
        data: portData,
      });
      res.status(201).json(newPort);
    } catch (error) {
      console.error("Error creating port:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new PortController();
