import ServiceConfig from "../models/ServiceConfig.js";

// ==========================
// Create Service
// ==========================
export const createService = async (req, res) => {
  try {
    const { category, subcategory, department, priority } = req.body;

    const exists = await ServiceConfig.findOne({ subcategory });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Subcategory already exists.",
      });
    }

    const service = await ServiceConfig.create({
      category,
      subcategory,
      department,
      priority,
    });

    res.status(201).json({
      success: true,
      service,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Services
// ==========================
export const getServices = async (req, res) => {
  try {
    const services = await ServiceConfig.find().sort({
      category: 1,
      subcategory: 1,
    });

    res.status(200).json({
      success: true,
      services,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Service
// ==========================
export const updateService = async (req, res) => {
  try {
    const service = await ServiceConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      service,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Service
// ==========================
export const deleteService = async (req, res) => {
  try {
    await ServiceConfig.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};