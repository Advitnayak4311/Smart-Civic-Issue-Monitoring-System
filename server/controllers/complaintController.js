import Complaint from "../models/Complaint.js";
import ServiceConfig from "../models/ServiceConfig.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import {
  complaintRegistrationCitizenEmail,
  complaintRegistrationAdminAlertEmail,
  acceptedEmail,
  inProgressEmail,
  completedEmail,
  citizenVerificationReceiptEmail,
  citizenVerificationAdminNoticeEmail,
} from "../utils/emailTemplates.js";
import { v4 as uuidv4 } from "uuid";
import {
  calculateHaversineDistance,
  calculateConfidenceScore,
  calculateImpactScore,
} from "../utils/scoreCalculator.js";

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

    let safeVideoUrl = videoUrl || null;
    let safeImageUrl = imageUrl || primaryImage || "";
    let safeImageList = Array.isArray(imageList) && imageList.length > 0 ? imageList : [safeImageUrl].filter(Boolean);

    let complaintUser = req.user?._id || null;
    const authHeader = req.headers.token || req.headers.authorization;
    if (!complaintUser && authHeader) {
      try {
        const tokenStr = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET || "defaultsecret");
        if (decoded && decoded.id) {
          complaintUser = decoded.id;
        }
      } catch (e) {
        console.log("Token decode note in createComplaint:", e.message);
      }
    }
    if (!complaintUser && email) {
      const existingUser = await User.findOne({ email: new RegExp("^" + email.trim() + "$", "i") });
      if (existingUser) {
        complaintUser = existingUser._id;
      }
    }

    let parentId = req.body.parentComplaintId || null;
    let isDuplicate = Boolean(parentId);

    const tempComplaintData = {
      imageUrl: safeImageUrl,
      imageList: safeImageList,
      location: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
      },
      address,
      remarks,
      user: complaintUser,
      supportCount: 1,
      isDuplicate,
      category,
      issue,
      createdAt: new Date(),
    };

    const confidence = calculateConfidenceScore(tempComplaintData);
    const impact = calculateImpactScore(tempComplaintData);

    const complaint = await Complaint.create({
      complaintId,

      user: complaintUser,

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

      // Phase 1 Scores & Duplicate Metadata
      confidenceScore: confidence.score,
      confidenceLevel: confidence.level,
      impactScore: impact.score,
      impactLevel: impact.level,
      isDuplicate,
      parentComplaint: parentId,
      supportCount: 1,
    });

    // If submitted as duplicate anyway, link to parent complaint
    if (parentId) {
      setImmediate(async () => {
        try {
          await Complaint.findByIdAndUpdate(parentId, {
            $push: { duplicateComplaints: complaint._id },
            $inc: { supportCount: 1 },
          });
        } catch (linkErr) {
          console.log("Parent Duplicate Link Note:", linkErr.message);
        }
      });
    }

    // 📩 Asynchronous Non-blocking Email Dispatch in Background (Sub-50ms Response Speed!)
    setImmediate(async () => {
      try {
        const citizenMail = complaintRegistrationCitizenEmail(complaint);
        sendEmail({
          to: email,
          subject: citizenMail.subject,
          html: citizenMail.html,
        }).catch((e) => console.log("Citizen Email Dispatch Note:", e.message));

        const adminMail = complaintRegistrationAdminAlertEmail(complaint);
        const officerEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
        sendEmail({
          to: officerEmail,
          subject: adminMail.subject,
          html: adminMail.html,
        }).catch((e) => console.log("Officer Email Dispatch Note:", e.message));
      } catch (bgErr) {
        console.log("Background Email Dispatch Note:", bgErr.message);
      }
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
    const userEmail = req.user?.email ? req.user.email.toLowerCase().trim() : "";
    const userPhone = req.user?.phone ? req.user.phone.trim() : "";
    const escapeRegex = (str) => (str ? str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "");
    const safeEmail = escapeRegex(userEmail);

    // Automatically link any past complaints matching citizen's email or phone
    if (userEmail || userPhone) {
      await Complaint.updateMany(
        {
          $or: [
            ...(safeEmail ? [{ email: { $regex: new RegExp("^" + safeEmail + "$", "i") } }] : []),
            ...(userPhone ? [{ phone: userPhone }] : []),
          ],
        },
        { $set: { user: req.user._id } }
      );
    }

    const complaints = await Complaint.find({
      $or: [
        { user: req.user._id },
        ...(safeEmail ? [{ email: { $regex: new RegExp("^" + safeEmail + "$", "i") } }] : []),
        ...(userPhone ? [{ phone: userPhone }] : []),
      ],
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

    // 📩 Send Status Update Email Notification to Citizen Asynchronously in Background (< 20ms response time)
    let emailData = null;
    if (status === "Accepted") emailData = acceptedEmail(complaint);
    else if (status === "In Progress") emailData = inProgressEmail(complaint);
    else if (status === "Completed") emailData = completedEmail(complaint);

    if (emailData) {
      setImmediate(async () => {
        try {
          await sendEmail({
            to: complaint.email,
            subject: emailData.subject,
            html: emailData.html,
          });
        } catch (mailErr) {
          console.log("Status Update Email Note:", mailErr.message);
        }
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
      return res.status(200).json({
        success: true,
        alreadyProcessed: true,
        decision: complaint.citizenVerified === "Yes" ? "yes" : "no",
        message: `Verification feedback already recorded as ${complaint.citizenVerified === "Yes" ? "Resolved" : "Reopened"}.`,
        complaint,
      });
    }

    if (decision === "yes") {
      complaint.citizenVerified = "Yes";
      complaint.status = "Completed";
      complaint.closedAt = new Date();
    } else {
      complaint.citizenVerified = "No";
      complaint.status = "Reopened";
      complaint.priority = "High"; // Escalate SLA priority to High on citizen reopening!
      complaint.reopenedAt = new Date();
    }
    complaint.verificationDate = new Date();

    await complaint.save();

    // 📩 Send Verification Feedback Email to Citizen & Control Room in Background (< 20ms response speed)
    setImmediate(async () => {
      try {
        // 1. Citizen receives clean receipt (NO ADMIN ACCESS BUTTON)
        const citizenMail = citizenVerificationReceiptEmail(complaint, decision);
        await sendEmail({
          to: complaint.email,
          subject: citizenMail.subject,
          html: citizenMail.html,
        });

        // 2. Municipal Officer receives command center alert notice
        const officerMail = citizenVerificationAdminNoticeEmail(complaint, decision);
        const officerEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
        await sendEmail({
          to: officerEmail,
          subject: officerMail.subject,
          html: officerMail.html,
        });
      } catch (mailErr) {
        console.log("Verification Email Note:", mailErr.message);
      }
    });

    return res.status(200).json({
      success: true,
      decision,
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
      $or: [
        { status: "Closed" },
        { citizenVerified: "Yes" },
      ],
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

// =========================================
// PHASE 1: SMART DUPLICATE CHECK (<300ms SLA)
// =========================================
export const checkDuplicateComplaint = async (req, res) => {
  const startTime = Date.now();
  try {
    const { category, issue, latitude, longitude, radius = 100 } = req.body;

    if (!category || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      return res.status(200).json({ duplicate: false, reason: "Missing category or GPS coordinates" });
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(200).json({ duplicate: false, reason: "Invalid GPS coordinates" });
    }

    // High performance lookup: search non-closed complaints in same category
    const activeComplaints = await Complaint.find({
      status: { $ne: "Closed" },
      category: category,
    })
      .select("_id complaintId category issue department status supportCount location address createdAt citizenName")
      .lean();

    let matchedComplaint = null;
    let minDistance = Infinity;

    for (const c of activeComplaints) {
      const cLat = c.location?.latitude;
      const cLon = c.location?.longitude;

      if (cLat !== null && cLat !== undefined && cLon !== null && cLon !== undefined) {
        const dist = calculateHaversineDistance(latNum, lonNum, cLat, cLon);
        if (dist <= radius && dist < minDistance) {
          minDistance = dist;
          matchedComplaint = c;
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    if (matchedComplaint) {
      return res.status(200).json({
        duplicate: true,
        complaintId: matchedComplaint.complaintId,
        id: matchedComplaint._id,
        category: matchedComplaint.category,
        issue: matchedComplaint.issue,
        department: matchedComplaint.department,
        status: matchedComplaint.status,
        supportCount: matchedComplaint.supportCount || 1,
        distance: minDistance,
        address: matchedComplaint.address || matchedComplaint.location?.address || "Recorded GPS Location",
        reportedBy: matchedComplaint.citizenName || "Concerned Citizen",
        executionTimeMs,
      });
    }

    return res.status(200).json({
      duplicate: false,
      executionTimeMs,
    });
  } catch (error) {
    console.error("Duplicate Check Error:", error);
    return res.status(500).json({
      duplicate: false,
      message: error.message,
    });
  }
};

// =========================================
// PHASE 1: SUPPORT EXISTING COMPLAINT
// =========================================
export const supportComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, email, phone } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Existing complaint not found." });
    }

    const supporterEmail = (email || req.user?.email || "anonymous@citizen.gov.in").toLowerCase().trim();
    
    // Check if user already supported
    const alreadySupported = complaint.supportedBy.some(
      (s) => (s.email && s.email.toLowerCase().trim() === supporterEmail) ||
             (userId && s.userId && s.userId.toString() === userId.toString())
    );

    if (!alreadySupported) {
      complaint.supportedBy.push({
        userId: userId || req.user?._id || null,
        name: name || req.user?.name || "Concerned Citizen",
        email: supporterEmail,
        phone: phone || req.user?.phone || "",
        supportedAt: new Date(),
      });
    }

    complaint.supportCount = (complaint.supportedBy.length || 0) + 1;

    // Recalculate Confidence and Impact Scores
    const confidence = calculateConfidenceScore(complaint);
    complaint.confidenceScore = confidence.score;
    complaint.confidenceLevel = confidence.level;

    const impact = calculateImpactScore(complaint);
    complaint.impactScore = impact.score;
    complaint.impactLevel = impact.level;

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Your support has been successfully recorded for this grievance!",
      complaintId: complaint.complaintId,
      supportCount: complaint.supportCount,
      impactScore: complaint.impactScore,
      impactLevel: complaint.impactLevel,
      confidenceScore: complaint.confidenceScore,
      confidenceLevel: complaint.confidenceLevel,
    });
  } catch (error) {
    console.error("Support Complaint Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};