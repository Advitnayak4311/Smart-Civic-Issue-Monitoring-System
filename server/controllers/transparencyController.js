import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { calculateCitizenTrustAndBadges } from "../utils/trustCalculator.js";

// ==========================================
// 1. PUBLIC CIVIC TRANSPARENCY DASHBOARD API (PRIVACY ENFORCED)
// ==========================================
export const getPublicTransparencyStats = async (req, res) => {
  try {
    const allComplaints = await Complaint.find().lean();
    const totalComplaints = allComplaints.length;

    let pendingCount = 0;
    let resolvedCount = 0;

    allComplaints.forEach((c) => {
      if (c.status === "Closed" || c.status === "Completed" || c.citizenVerified === "Yes") {
        resolvedCount++;
      } else {
        pendingCount++;
      }
    });

    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 100;

    // Recent Resolved Complaints with Privacy Masking
    const recentResolvedRaw = await Complaint.find({
      status: { $in: ["Completed", "Closed"] },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const recentResolutions = recentResolvedRaw.map((c) => ({
      complaintId: c.complaintId,
      category: c.category,
      issue: c.issue,
      department: c.department,
      status: c.status,
      completedAt: c.completedAt || c.updatedAt,
      // PRIVACY REDACTION RULES
      citizenName: (c.citizenName || "Citizen").split(" ")[0] + " ***",
      ward: c.ward || "Central Division",
      beforeImage: c.beforeImage || c.image || "",
      afterImage: c.afterImage || c.image || "",
      resolutionNotes: c.resolutionNotes || "Work inspected and verified by municipal team.",
      citizenRating: c.citizenRating || null,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        resolvedCount,
        pendingCount,
        resolutionRate,
        recentResolutions,
      },
    });
  } catch (error) {
    console.error("Transparency Stats Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. CITIZEN LEADERBOARD API
// ==========================================
export const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .select("fullName trustScore trustBadge badges contributionCount resolvedCount")
      .sort({ trustScore: -1, contributionCount: -1 })
      .limit(15)
      .lean();

    const leaderboard = topUsers.map((u, idx) => ({
      rank: idx + 1,
      name: u.fullName ? u.fullName.split(" ")[0] + " " + (u.fullName.split(" ")[1]?.[0] || "") + "." : "Active Citizen",
      trustScore: u.trustScore || 75,
      trustBadge: u.trustBadge || "Active Citizen",
      badges: u.badges || ["First Complaint"],
      contributions: u.contributionCount || 1,
      resolved: u.resolvedCount || 1,
    }));

    return res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. CITIZEN SATISFACTION FEEDBACK SUBMISSION
// ==========================================
export const submitComplaintFeedback = async (req, res) => {
  try {
    const { complaintId, citizenRating, departmentRating, responseRating, workQuality, feedbackComments, afterImage } = req.body;

    const complaint = await Complaint.findOne({
      $or: [{ _id: complaintId }, { complaintId: complaintId }],
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Grievance ticket not found." });
    }

    if (citizenRating) complaint.citizenRating = citizenRating;
    if (departmentRating) complaint.departmentRating = departmentRating;
    if (responseRating) complaint.responseRating = responseRating;
    if (workQuality) complaint.workQuality = workQuality;
    if (feedbackComments) complaint.feedbackComments = feedbackComments;
    if (afterImage) complaint.afterImage = afterImage;

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Thank you! Your feedback & rating have been saved cleanly.",
      complaint,
    });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. BEFORE & AFTER RESOLUTION GALLERY API
// ==========================================
export const getResolutionGallery = async (req, res) => {
  try {
    const galleryItems = await Complaint.find({
      status: { $in: ["Completed", "Closed", "In Progress", "Accepted"] },
    })
      .select("complaintId category issue department status beforeImage afterImage imageUrl imageList image resolutionProof resolutionNotes completedAt citizenName ward address")
      .sort({ updatedAt: -1, completedAt: -1, createdAt: -1 })
      .limit(20)
      .lean();

    const gallery = galleryItems.map((item) => {
      const primaryPhoto = item.imageUrl || (item.imageList && item.imageList.length > 0 ? item.imageList[0] : "") || item.image || "";
      const secondaryPhoto = (item.imageList && item.imageList.length > 1 ? item.imageList[1] : "") || item.resolutionProof || item.afterImage || primaryPhoto;

      return {
        _id: item._id,
        complaintId: item.complaintId,
        category: item.category,
        issue: item.issue,
        department: item.department || "Municipal Division",
        beforeImage: item.beforeImage || primaryPhoto,
        afterImage: item.afterImage || item.resolutionProof || secondaryPhoto || primaryPhoto,
        resolutionNotes: item.resolutionNotes || "Remediation verified by field inspection team.",
        completedAt: item.completedAt || item.updatedAt || item.createdAt || new Date(),
        ward: item.ward || "Central Division",
      };
    });

    return res.status(200).json({
      success: true,
      gallery,
    });
  } catch (error) {
    console.error("Resolution Gallery Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
