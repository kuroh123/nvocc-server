const prisma = require("../utils/prisma");
const { deleteFile, uploadsDir } = require("../utils/fileUpload");
const path = require("path");

/**
 * Upload file for an entity (port, terminal, agent, depot)
 */
const uploadFile = async (req, res) => {
  try {
    const { entityType, entityId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!entityType || !entityId) {
      // Delete the uploaded file if entity info is missing
      await deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Entity type and entity ID are required",
      });
    }

    // Validate entity type
    const validEntityTypes = ["port", "terminal", "agent", "depot"];
    if (!validEntityTypes.includes(entityType.toLowerCase())) {
      await deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message:
          "Invalid entity type. Must be one of: port, terminal, agent, depot",
      });
    }

    // Verify entity exists
    const entityMap = {
      port: "port",
      terminal: "terminal",
      agent: "agent",
      depot: "depot",
    };

    const entity = await prisma[entityMap[entityType.toLowerCase()]].findUnique(
      {
        where: { id: entityId },
      }
    );

    if (!entity) {
      await deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: `${entityType} not found`,
      });
    }

    // Create upload record
    const uploadData = {
      name: req.file.originalname,
      size: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
    };

    // Add entity reference
    if (entityType.toLowerCase() === "port") {
      uploadData.portId = entityId;
    } else if (entityType.toLowerCase() === "terminal") {
      uploadData.terminalId = entityId;
    } else if (entityType.toLowerCase() === "agent") {
      uploadData.agentId = entityId;
    } else if (entityType.toLowerCase() === "depot") {
      uploadData.depotId = entityId;
    }

    const upload = await prisma.upload.create({
      data: uploadData,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: upload,
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file) {
      await deleteFile(req.file.path).catch(() => {});
    }
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
};

/**
 * Get all uploads for an entity
 */
const getEntityUploads = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: "Entity type and entity ID are required",
      });
    }

    // Build where clause based on entity type
    const whereClause = {};
    if (entityType.toLowerCase() === "port") {
      whereClause.portId = entityId;
    } else if (entityType.toLowerCase() === "terminal") {
      whereClause.terminalId = entityId;
    } else if (entityType.toLowerCase() === "agent") {
      whereClause.agentId = entityId;
    } else if (entityType.toLowerCase() === "depot") {
      whereClause.depotId = entityId;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
    }

    const uploads = await prisma.upload.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: uploads.length,
      data: uploads,
    });
  } catch (error) {
    console.error("Get uploads error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching uploads",
      error: error.message,
    });
  }
};

/**
 * Get single upload by ID
 */
const getUploadById = async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await prisma.upload.findUnique({
      where: { id },
      include: {
        port: { select: { id: true, name: true } },
        terminal: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
        depot: { select: { id: true, name: true } },
      },
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    res.status(200).json({
      success: true,
      data: upload,
    });
  } catch (error) {
    console.error("Get upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching upload",
      error: error.message,
    });
  }
};

/**
 * Download file
 */
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    const filename = path.basename(upload.fileUrl);
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    const fs = require("fs");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    res.download(filePath, upload.name);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading file",
      error: error.message,
    });
  }
};

/**
 * Delete upload
 */
const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    // Delete file from filesystem
    const filename = path.basename(upload.fileUrl);
    const filePath = path.join(uploadsDir, filename);

    try {
      await deleteFile(filePath);
    } catch (fileError) {
      console.error("File deletion error:", fileError);
      // Continue even if file deletion fails
    }

    // Delete record from database
    await prisma.upload.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Upload deleted successfully",
    });
  } catch (error) {
    console.error("Delete upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting upload",
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  getEntityUploads,
  getUploadById,
  downloadFile,
  deleteUpload,
};
