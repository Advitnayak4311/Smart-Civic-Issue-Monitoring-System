import ServiceConfig from "../models/ServiceConfig.js";
import { sendEmail } from "../utils/sendEmail.js";
import { serviceConfigNoticeEmail } from "../utils/emailTemplates.js";

// ==========================
// Create Service Rule
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

    // 📩 Send Service Rule Creation Notification Email
    try {
      const emailContent = serviceConfigNoticeEmail(service);
      const adminEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
      await sendEmail({
        to: adminEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (mailErr) {
      console.log("Service Rule Email Note:", mailErr.message);
    }

    const allServices = await ServiceConfig.find().sort({ category: 1, subcategory: 1 });

    res.status(201).json({
      success: true,
      service,
      services: allServices,
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
// Update Service Rule
// ==========================
export const updateService = async (req, res) => {
  try {
    const service = await ServiceConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // 📩 Send Service Rule Update Notification Email in Background
    setImmediate(async () => {
      try {
        if (service) {
          const emailContent = serviceConfigNoticeEmail(service);
          const adminEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
          await sendEmail({
            to: adminEmail,
            subject: emailContent.subject,
            html: emailContent.html,
          });
        }
      } catch (mailErr) {
        console.log("Service Rule Email Note:", mailErr.message);
      }
    });

    const allServices = await ServiceConfig.find().sort({ category: 1, subcategory: 1 });

    res.status(200).json({
      success: true,
      service,
      services: allServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Service Rule
// ==========================
export const deleteService = async (req, res) => {
  try {
    await ServiceConfig.findByIdAndDelete(req.params.id);
    const allServices = await ServiceConfig.find().sort({ category: 1, subcategory: 1 });

    res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
      services: allServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};