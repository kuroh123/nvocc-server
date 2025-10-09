const prisma = require("../utils/prisma");
const { validationResult } = require("express-validator");

class CountryController {
  async getAllCountries(req, res) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { codeChar2: { contains: search, mode: "insensitive" } },
          { codeChar3: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [countries, total] = await Promise.all([
        prisma.country.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: {
            name: "asc",
          },
        }),
        prisma.country.count({ where }),
      ]);

      res.json({
        success: true,
        data: countries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch countries",
      });
    }
  }

  async getCountryById(req, res) {
    try {
      const { id } = req.params;

      const country = await prisma.country.findUnique({
        where: { id },
        include: {
          Port: {
            include: {
              Terminal: {
                select: {
                  id: true,
                  name: true,
                  status: true,
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
            orderBy: {
              name: "asc",
            },
          },
        },
      });

      if (!country) {
        return res.status(404).json({
          success: false,
          error: "Not Found",
          message: "Country not found",
        });
      }

      res.json({
        success: true,
        data: country,
      });
    } catch (error) {
      console.error("Error fetching country:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch country",
      });
    }
  }
}

module.exports = new CountryController();
