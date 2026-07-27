import Complaint from "../models/Complaint.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  acceptedEmail,
  inProgressEmail,
  completedEmail,
} from "../utils/emailTemplates.js";
import { v4 as uuidv4 } from "uuid";

// =========================
// Get All Complaints
// =========================
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $ne: "Closed" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Update Complaint
// =========================
export const updateComplaint = async (req, res) => {
  try {
    console.log("========== UPDATE API HIT ==========");

    const { id } = req.params;
    const { status } = req.body;

    console.log("Complaint ID:", id);
    console.log("New Status:", status);

    // Get complaint first
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Update status
    complaint.status = status;

    // Store timestamps only once
    if (status === "Accepted" && !complaint.acceptedAt) {
      complaint.acceptedAt = new Date();
    }

    if (status === "In Progress" && !complaint.inProgressAt) {
      complaint.inProgressAt = new Date();
    }

    if (status === "Completed") {

  if (!complaint.completedAt) {
    complaint.completedAt = new Date();
  }

  // Always generate a fresh verification token
  complaint.verificationToken = uuidv4();
  complaint.citizenVerified = "Pending";
  complaint.verificationDate = null;

  console.log("Generated Token:", complaint.verificationToken);
}

    if (status === "Closed" && !complaint.closedAt) {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    console.log("Complaint Updated Successfully");

    // --------------------
    // Send Email
    // --------------------

    let emailData = null;

    if (status === "Accepted") {
      emailData = acceptedEmail(complaint);
    } else if (status === "In Progress") {
      emailData = inProgressEmail(complaint);
    } else if (status === "Completed") {
      emailData = completedEmail(complaint);
    }

    if (emailData) {
      await sendEmail({
        to: complaint.email,
        subject: emailData.subject,
        html: emailData.html,
      });

      console.log("Email Sent Successfully");
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Track Complaint
// =========================
export const trackComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({
      complaintId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Get Closed Complaints
// =========================
export const getClosedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: "Closed",
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      complaints,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// Delete Closed Complaint
// =========================
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

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