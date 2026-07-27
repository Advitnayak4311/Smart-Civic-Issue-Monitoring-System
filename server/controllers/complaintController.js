import Complaint from "../models/Complaint.js";
import ServiceConfig from "../models/ServiceConfig.js";
import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import { v4 as uuidv4 } from "uuid";

// =========================================
// CREATE COMPLAINT
// =========================================
export const createComplaint = async (req, res) => {
  try {
    const {
      category,
      issue,
      citizenName,
      phone,
      email,
      remarks,
      latitude,
      longitude,
      address,
      city,
      state,
      image,
    } = req.body;

    if (
      !category ||
      !issue ||
      !citizenName ||
      !phone ||
      !email ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "SmartCivicComplaints",
    });

    // Generate Complaint ID
    const complaintId = "CIV-" + Date.now().toString().slice(-8);

    // Get department & priority from Service Configuration
    const service = await ServiceConfig.findOne({
      category,
      subcategory: issue,
      isActive: true,
    });

    const priority = service?.priority || "Low";
    const department = service?.department || "General Department";

    // Save Complaint
    const complaint = await Complaint.create({
      complaintId,

      user: req.user?._id,

      category,
      issue,
      department,
      priority,

      citizenName,
      phone,
      email,
      remarks,

      city,
      state,
      address,

      location: {
        latitude,
        longitude,
        address,
      },

      imageUrl: uploadResponse.secure_url,

      status: "Pending",
    });

    // Send registration email
    await sendEmail({
      to: email,
      subject: "🏛 Complaint Registered Successfully - Smart Civic",
      html: `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:12px;">

          <h2 style="color:#2563eb;">
            Complaint Registered Successfully
          </h2>

          <p>Hello <b>${citizenName}</b>,</p>

          <p>Your complaint has been registered successfully.</p>

          <hr>

          <p><b>Complaint ID:</b> ${complaintId}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Issue:</b> ${issue}</p>
          <p><b>Department:</b> ${department}</p>
          <p><b>Priority:</b> ${priority}</p>
          <p><b>Status:</b> Pending</p>

          <br>

          <a
            href="${process.env.CLIENT_URL}/track/${complaintId}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Track Complaint
          </a>

          <br><br>

          <p>Thank you for helping improve your city.</p>

        </div>
      </div>
      `,
    });

    return res.status(201).json({
      success: true,
      complaintId,
      complaint,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =========================================
// GET ALL COMPLAINTS
// =========================================
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// GET MY COMPLAINTS
// =========================================
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// UPDATE COMPLAINT STATUS
// =========================================
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "Pending",
      "Accepted",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status.",
      });
    }

    // Find complaint
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    // Do not allow editing after closure
    if (complaint.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Closed complaints cannot be modified.",
      });
    }

    // Update status
    complaint.status = status;

    // Generate verification token when completed
    if (status === "Completed") {
      complaint.verificationToken = uuidv4();
      complaint.citizenVerified = "Pending";
      complaint.verificationDate = null;

      console.log(
        "Verification Token:",
        complaint.verificationToken
      );
    }

    await complaint.save();

    return res.status(200).json({
      success: true,
      complaint,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =========================================
// GET COMPLAINT BY VERIFICATION TOKEN
// =========================================
export const getComplaintByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const complaint = await Complaint.findOne({
      verificationToken: token,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Invalid verification link.",
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// VERIFY COMPLAINT RESOLUTION
// =========================================
export const verifyComplaint = async (req, res) => {
  try {
    const { token } = req.params;
    const { decision } = req.body;

    const complaint = await Complaint.findOne({
      verificationToken: token,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    if (complaint.citizenVerified !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This verification link has already been used.",
      });
    }

    if (decision === "yes") {
  complaint.citizenVerified = "Yes";
  complaint.status = "Closed";
  complaint.closedAt = new Date();
} else {
  complaint.citizenVerified = "No";
  complaint.status = "In Progress";
  complaint.inProgressAt = new Date();
}
    complaint.verificationDate = new Date();

    // Invalidate token after first use
    complaint.verificationToken = null;

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Verification submitted successfully.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================
// GET CLOSED COMPLAINTS
// =========================================
export const getClosedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: "Closed",
    })
      .populate("user", "email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch closed complaints.",
    });
  }
};

// =========================================
// DELETE COMPLAINT
// =========================================
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    // Only allow deletion of closed complaints
    if (complaint.status !== "Closed") {
      return res.status(400).json({
        success: false,
        message: "Only closed complaints can be deleted.",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};