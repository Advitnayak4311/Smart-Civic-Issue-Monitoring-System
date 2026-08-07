import Complaint from "../models/Complaint.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  acceptedEmail,
  inProgressEmail,
  completedEmail,
} from "../utils/emailTemplates.js";
import { v4 as uuidv4 } from "uuid";
import {
  calculateConfidenceScore,
  calculateImpactScore,
} from "../utils/scoreCalculator.js";
import {
  getSlaLimitForCategory,
  checkAndTriggerEscalations,
} from "../utils/escalationEngine.js";

// =========================
// Get All Complaints
// =========================
export const getAllComplaints = async (req, res) => {
  try {
    const { sortBy, filterImpact, filterHighlyReported } = req.query;

    let query = {
      status: { $ne: "Closed" },
      citizenVerified: { $ne: "Yes" },
    };

    if (filterImpact === "Critical") {
      query.impactLevel = "Critical";
    }

    if (filterHighlyReported === "true") {
      query.supportCount = { $gte: 2 };
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === "confidence_desc") sortOptions = { confidenceScore: -1, createdAt: -1 };
    if (sortBy === "confidence_asc") sortOptions = { confidenceScore: 1, createdAt: -1 };
    if (sortBy === "impact_desc") sortOptions = { impactScore: -1, createdAt: -1 };
    if (sortBy === "impact_asc") sortOptions = { impactScore: 1, createdAt: -1 };
    if (sortBy === "support_desc") sortOptions = { supportCount: -1, createdAt: -1 };

    let complaints = await Complaint.find(query).sort(sortOptions);

    // Dynamic fallback for legacy records missing score fields
    complaints = complaints.map((c) => {
      const doc = c.toObject();
      if (!doc.confidenceScore || doc.confidenceScore === 0) {
        const conf = calculateConfidenceScore(doc);
        doc.confidenceScore = conf.score;
        doc.confidenceLevel = conf.level;
      }
      if (!doc.impactScore || doc.impactScore === 0) {
        const imp = calculateImpactScore(doc);
        doc.impactScore = imp.score;
        doc.impactLevel = imp.level;
      }
      if (!doc.supportCount) doc.supportCount = 1;
      return doc;
    });

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

    // Update status & timestamps cleanly
    complaint.status = status;

    if (status === "In Progress" && !complaint.inProgressAt) {
      complaint.inProgressAt = new Date();
    }

    if (status === "Completed") {
      if (!complaint.completedAt) complaint.completedAt = new Date();
      complaint.verificationToken = uuidv4();
      complaint.citizenVerified = "Pending";
      complaint.verificationDate = null;
    }

    if (status === "Reopened") {
      complaint.priority = "High";
      complaint.reopenedAt = new Date();
    }

    // Append Journey Timeline Entry (Never Overwrite)
    const officerName = req.user?.name || "Municipal Response Officer";
    let timelineStage = `Officer Updated Status: ${status}`;
    let timelineColor = "blue";

    if (status === "Accepted") {
      timelineStage = "Officer Accepted Grievance";
      timelineColor = "blue";
    } else if (status === "In Progress") {
      timelineStage = "Work Started & Site Inspection";
      timelineColor = "amber";
    } else if (status === "Completed") {
      timelineStage = "Repair Completed & Verification Notice Dispatched";
      timelineColor = "emerald";
    } else if (status === "Reopened") {
      timelineStage = "Grievance Reopened for Re-Inspection";
      timelineColor = "red";
    }

    complaint.timeline.push({
      stage: timelineStage,
      timestamp: new Date(),
      officer: officerName,
      remarks: req.body.remarks || `Status transitioned to ${status}`,
      statusColor: timelineColor,
    });

    await complaint.save();

    console.log("Complaint Updated Successfully:", complaint.status);

    // --------------------
    // Send Email Notification for Selected Step
    // --------------------
    let emailData = null;

    if (status === "In Progress") {
      emailData = inProgressEmail(complaint);
    } else if (status === "Completed") {
      emailData = completedEmail(complaint);
    } else if (status === "Reopened") {
      emailData = {
        subject: `🚨 Grievance Reopened: Ref #${complaint.complaintId} (Escalated High Priority)`,
        html: `<div style="font-family:Arial;padding:24px;background:#f8fafc;"><div style="max-width:550px;margin:auto;background:white;padding:24px;border-radius:12px;border:1px solid #e2e8f0;"><h3 style="color:#dc2626;margin-top:0;">Grievance Reopened Notice</h3><p>Dear <b>${complaint.citizenName}</b>,</p><p>Your grievance <b>${complaint.complaintId}</b> has been reopened and assigned high priority for re-inspection.</p></div></div>`
      };
    }

    if (emailData) {
      setImmediate(async () => {
        try {
          await sendEmail({
            to: complaint.email,
            subject: emailData.subject,
            html: emailData.html,
          });
          console.log("Status Update Email Sent Successfully in Background to:", complaint.email);
        } catch (emailErr) {
          console.log("Email Notification Note:", emailErr.message);
        }
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
// Track Complaint
// =========================
export const trackComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const cleanId = complaintId ? complaintId.trim() : "";

    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Complaint Reference ID.",
      });
    }

    const complaint = await Complaint.findOne({
      $or: [
        { complaintId: cleanId },
        { complaintId: { $regex: new RegExp("^" + cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") } },
        ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }] : [])
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint reference '${cleanId}' was not found in the current active session database. If the server restarted, please submit a fresh complaint at /register to track it live.`,
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

// =========================
// PHASE 1: ANALYTICS & INTELLIGENCE STATS
// =========================
export const getAnalyticsStats = async (req, res) => {
  try {
    const allComplaints = await Complaint.find().lean();

    // 1. Average Confidence & Confidence Distribution
    let totalConfidence = 0;
    const confidenceDist = { High: 0, Medium: 0, Low: 0 };
    const impactDist = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const deptImpactMap = {};

    allComplaints.forEach((c) => {
      // Calculate scores dynamically if missing
      let confScore = c.confidenceScore;
      let confLvl = c.confidenceLevel;
      if (!confScore || confScore === 0) {
        const conf = calculateConfidenceScore(c);
        confScore = conf.score;
        confLvl = conf.level;
      }

      let impScore = c.impactScore;
      let impLvl = c.impactLevel;
      if (!impScore || impScore === 0) {
        const imp = calculateImpactScore(c);
        impScore = imp.score;
        impLvl = imp.level;
      }

      totalConfidence += confScore;
      if (confidenceDist[confLvl] !== undefined) confidenceDist[confLvl]++;

      if (impactDist[impLvl] !== undefined) impactDist[impLvl]++;

      const dept = c.department || "General";
      deptImpactMap[dept] = (deptImpactMap[dept] || 0) + impScore;
    });

    const avgConfidence = allComplaints.length > 0 ? Math.round(totalConfidence / allComplaints.length) : 0;

    // 2. Department Impact Chart Format
    const departmentImpact = Object.keys(deptImpactMap).map((dept) => ({
      department: dept,
      totalImpact: deptImpactMap[dept],
    }));

    // 3. Top 10 Most Supported Complaints
    const topSupportedComplaints = await Complaint.find()
      .sort({ supportCount: -1, impactScore: -1 })
      .limit(10)
      .select("complaintId category issue department status supportCount impactScore impactLevel confidenceScore confidenceLevel location address citizenName createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalComplaints: allComplaints.length,
        averageConfidence: avgConfidence,
        confidenceDistribution: [
          { name: "High Confidence (80%+)", value: confidenceDist.High, color: "#16a34a" },
          { name: "Medium Confidence (50-79%)", value: confidenceDist.Medium, color: "#ea580c" },
          { name: "Low Confidence (<50%)", value: confidenceDist.Low, color: "#dc2626" },
        ],
        impactDistribution: [
          { name: "Critical (151+)", value: impactDist.Critical, color: "#dc2626" },
          { name: "High (101-150)", value: impactDist.High, color: "#9333ea" },
          { name: "Medium (51-100)", value: impactDist.Medium, color: "#2563eb" },
          { name: "Low (0-50)", value: impactDist.Low, color: "#64748b" },
        ],
        departmentImpact,
        topSupportedComplaints,
      },
    });
    return res.status(200).json({
      success: true,
      stats: {
        totalComplaints: allComplaints.length,
        averageConfidence: avgConfidence,
        confidenceDistribution: [
          { name: "High Confidence (80%+)", value: confidenceDist.High, color: "#16a34a" },
          { name: "Medium Confidence (50-79%)", value: confidenceDist.Medium, color: "#ea580c" },
          { name: "Low Confidence (<50%)", value: confidenceDist.Low, color: "#dc2626" },
        ],
        impactDistribution: [
          { name: "Critical (151+)", value: impactDist.Critical, color: "#dc2626" },
          { name: "High (101-150)", value: impactDist.High, color: "#9333ea" },
          { name: "Medium (51-100)", value: impactDist.Medium, color: "#2563eb" },
          { name: "Low (0-50)", value: impactDist.Low, color: "#64748b" },
        ],
        departmentImpact,
        topSupportedComplaints,
      },
    });
  } catch (error) {
    console.error("Analytics Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// PHASE 2: DEPARTMENT PERFORMANCE INDEX
// =========================
export const getDepartmentPerformance = async (req, res) => {
  try {
    const complaints = await Complaint.find().lean();
    const deptMap = {};

    complaints.forEach((c) => {
      const dept = c.department || "General Department";
      if (!deptMap[dept]) {
        deptMap[dept] = {
          name: dept,
          totalAssigned: 0,
          pending: 0,
          accepted: 0,
          inProgress: 0,
          completed: 0,
          closed: 0,
          resolvedWithinSla: 0,
          totalResolved: 0,
          totalResolutionDays: 0,
          totalConfidence: 0,
          totalImpact: 0,
          totalRating: 0,
          escalatedCount: 0,
        };
      }

      const d = deptMap[dept];
      d.totalAssigned++;

      if (c.status === "Pending") d.pending++;
      if (c.status === "Accepted") d.accepted++;
      if (c.status === "In Progress") d.inProgress++;
      if (c.status === "Completed") d.completed++;
      if (c.status === "Closed" || c.citizenVerified === "Yes") d.closed++;

      if (c.escalationLevel && c.escalationLevel > 0) d.escalatedCount++;

      d.totalConfidence += c.confidenceScore || 75;
      d.totalImpact += c.impactScore || 45;
      d.totalRating += c.citizenRating || 5;

      const isResolved = c.status === "Completed" || c.status === "Closed" || c.citizenVerified === "Yes";
      if (isResolved) {
        d.totalResolved++;
        const createdDate = new Date(c.createdAt).getTime();
        const resolvedDate = new Date(c.completedAt || c.closedAt || c.updatedAt).getTime();
        const resolutionHours = Math.max(0.5, (resolvedDate - createdDate) / (1000 * 60 * 60));
        
        d.totalResolutionDays += resolutionHours / 24;

        const slaLimit = c.slaLimitHours || getSlaLimitForCategory(c.category, c.issue);
        if (resolutionHours <= slaLimit) {
          d.resolvedWithinSla++;
        }
      }
    });

    const performanceGrid = Object.keys(deptMap).map((key) => {
      const d = deptMap[key];

      const resolutionRate = d.totalAssigned > 0 ? Math.round(((d.completed + d.closed) / d.totalAssigned) * 100) : 100;
      const slaCompliancePercent = d.totalResolved > 0 ? Math.round((d.resolvedWithinSla / d.totalResolved) * 100) : 100;
      const avgResolutionDays = d.totalResolved > 0 ? (d.totalResolutionDays / d.totalResolved).toFixed(1) : "1.8";
      const citizenRating = d.totalAssigned > 0 ? (d.totalRating / d.totalAssigned).toFixed(1) : "4.8";

      // Grade Formula
      let grade = "A+";
      if (slaCompliancePercent >= 95) grade = "A+";
      else if (slaCompliancePercent >= 90) grade = "A";
      else if (slaCompliancePercent >= 80) grade = "B";
      else if (slaCompliancePercent >= 70) grade = "C";
      else grade = "Needs Improvement";

      return {
        department: d.name,
        totalAssigned: d.totalAssigned,
        pending: d.pending,
        accepted: d.accepted,
        inProgress: d.inProgress,
        completed: d.completed,
        closed: d.closed,
        totalResolved: d.totalResolved,
        resolutionRate,
        slaCompliancePercent,
        avgResolutionDays,
        citizenRating,
        grade,
        escalatedCount: d.escalatedCount,
        avgConfidence: Math.round(d.totalConfidence / Math.max(1, d.totalAssigned)),
        avgImpact: Math.round(d.totalImpact / Math.max(1, d.totalAssigned)),
      };
    });

    return res.status(200).json({
      success: true,
      departments: performanceGrid,
    });
  } catch (error) {
    console.error("Department Performance Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// PHASE 2: TRIGGER AUTOMATIC ESCALATIONS API
// =========================
export const triggerEscalationsApi = async (req, res) => {
  try {
    const result = await checkAndTriggerEscalations();
    return res.status(200).json({
      success: true,
      message: `Automatic Escalation Engine completed. ${result.count || 0} grievances evaluated and escalated.`,
      escalatedCount: result.count || 0,
    });
  } catch (error) {
    console.error("Trigger Escalation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// CLEAR ALL DUMMY / TEST COMPLAINTS
// =========================
export const clearAllComplaints = async (req, res) => {
  try {
    const deleted = await Complaint.deleteMany({});
    return res.status(200).json({
      success: true,
      message: `Successfully purged ${deleted.deletedCount} dummy test complaints from the system.`,
      deletedCount: deleted.deletedCount,
    });
  } catch (error) {
    console.error("Clear All Complaints Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================
// TEST EMAIL DISPATCH API
// =========================
export const testEmailApi = async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
    
    const result = await sendEmail({
      to: recipient,
      subject: "🔔 Smart Civic Portal - Live SMTP Email Verification Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1;">
          <h2 style="color: #1e3a8a;">Smart Civic Portal SMTP Service Active ✅</h2>
          <p>This is a live verification email dispatched from the Municipal Infrastructure & Grievance Redressal System.</p>
          <p><strong>Target Recipient:</strong> ${recipient}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN')}</p>
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Smart Civic Portal Automatic Notification System</p>
        </div>
      `,
    });

    if (result && result.success) {
      return res.status(200).json({
        success: true,
        message: `Live test email dispatched successfully to ${recipient}`,
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Email dispatch failed: ${result?.error || 'Unknown error'}`,
      });
    }
  } catch (error) {
    console.error("Test Email Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};