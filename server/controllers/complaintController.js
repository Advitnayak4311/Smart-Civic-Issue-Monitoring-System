import Complaint from "../models/Complaint.js";
import ServiceConfig from "../models/ServiceConfig.js";
import cloudinary from "../config/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  complaintRegistrationCitizenEmail,
  complaintRegistrationAdminAlertEmail,
  acceptedEmail,
  inProgressEmail,
  completedEmail,
  citizenVerificationNoticeEmail,
} from "../utils/emailTemplates.js";
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
      city,
      state,
      district,
      zone,
      ward,
      address,
      image,
      imageList,
      video,
      latitude,
      longitude,
    } = req.body;

    if (
      !category ||
      !issue ||
      !citizenName ||
      !phone ||
      !email ||
      (!image && (!imageList || !imageList.length))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields and provide photo evidence.",
      });
    }

    const primaryImage = image || (imageList && imageList[0]) || "";
    let imageUrl = primaryImage;
    let videoUrl = video || null;

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "demo") {
        const uploadResponse = await cloudinary.uploader.upload(primaryImage, {
          folder: "SmartCivicComplaints",
        });
        if (uploadResponse?.secure_url) {
          imageUrl = uploadResponse.secure_url;
        }

        if (video) {
          const videoResponse = await cloudinary.uploader.upload(video, {
            resource_type: "video",
            folder: "SmartCivicComplaints/Videos",
          });
          if (videoResponse?.secure_url) {
            videoUrl = videoResponse.secure_url;
          }
        }
      }
    } catch (cloudErr) {
      console.log("Cloudinary Upload Note (using direct media data):", cloudErr.message);
    }

    const complaintId = "CIV-" + Date.now().toString().slice(-8);

    const service = await ServiceConfig.findOne({
      category,
      subcategory: issue,
      isActive: true,
    });

    const priority = service?.priority || "Low";
    const department = service?.department || "General Department";

    // Ensure media strings saved into MongoDB document stay under MongoDB's 16MB BSON limit
    let safeVideoUrl = videoUrl;
    if (safeVideoUrl && safeVideoUrl.length > 3000000) {
      // If video base64 exceeds 3MB (which breaches MongoDB 16MB BSON limit), store a clean video reference
      safeVideoUrl = "data:video/mp4;base64,VideoEvidenceRecorded";
    }

    let safeImageUrl = imageUrl;
    if (safeImageUrl && safeImageUrl.length > 2000000) {
      safeImageUrl = safeImageUrl.slice(0, 500000);
    }

    let safeImageList = (imageList || [safeImageUrl]).map((imgStr) => {
      if (imgStr && imgStr.length > 2000000) {
        return imgStr.slice(0, 500000);
      }
      return imgStr;
    });

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
      district,
      zone,
      ward,
      address,

      location: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
      },

      imageUrl: safeImageUrl,
      imageList: safeImageList,
      videoUrl: safeVideoUrl,

      status: "Pending",
    });

    // 📩 1. Send Registration Confirmation Email to Citizen
    try {
      const citizenMail = complaintRegistrationCitizenEmail(complaint);
      await sendEmail({
        to: email,
        subject: citizenMail.subject,
        html: citizenMail.html,
      });
    } catch (mailErr) {
      console.log("Citizen Email Dispatch Note:", mailErr.message);
    }

    // 📩 2. Send Action Alert Email to Municipal Nodal Officer / Control Room
    try {
      const adminMail = complaintRegistrationAdminAlertEmail(complaint);
      const officerEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
      await sendEmail({
        to: officerEmail,
        subject: adminMail.subject,
        html: adminMail.html,
      });
    } catch (adminMailErr) {
      console.log("Officer Alert Email Dispatch Note:", adminMailErr.message);
    }

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

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (complaint.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Closed complaints cannot be modified.",
      });
    }

    complaint.status = status;

    if (status === "Completed") {
      complaint.verificationToken = uuidv4();
      complaint.citizenVerified = "Pending";
      complaint.verificationDate = null;
    }

    await complaint.save();

    // 📩 Send Status Update Email Notification to Citizen
    try {
      let emailData = null;
      if (status === "Accepted") emailData = acceptedEmail(complaint);
      else if (status === "In Progress") emailData = inProgressEmail(complaint);
      else if (status === "Completed") emailData = completedEmail(complaint);

      if (emailData) {
        await sendEmail({
          to: complaint.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    } catch (mailErr) {
      console.log("Status Update Email Note:", mailErr.message);
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
    complaint.verificationToken = null;

    await complaint.save();

    // 📩 Send Verification Feedback Email to Citizen & Control Room
    try {
      const noticeMail = citizenVerificationNoticeEmail(complaint, decision);
      await sendEmail({
        to: complaint.email,
        subject: noticeMail.subject,
        html: noticeMail.html,
      });
      const officerEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
      await sendEmail({
        to: officerEmail,
        subject: noticeMail.subject,
        html: noticeMail.html,
      });
    } catch (mailErr) {
      console.log("Verification Email Note:", mailErr.message);
    }

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

    if (complaint.status !== "Closed") {
      return res.status(400).json({
        success: false,
        message: "Only closed complaints can be deleted.",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    // 📩 Send Deletion Email Notice
    try {
      await sendEmail({
        to: complaint.email,
        subject: `ℹ️ Notice: Grievance Record ${complaint.complaintId} Archived`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;background:#f8fafc;">
            <div style="max-width:550px;margin:auto;background:white;padding:24px;border-radius:12px;">
              <h3 style="color:#0f172a;margin-top:0;">Grievance Archive Notice</h3>
              <p>The closed grievance record <b>${complaint.complaintId}</b> has been archived in the municipal database.</p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.log("Deletion Email Note:", mailErr.message);
    }

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