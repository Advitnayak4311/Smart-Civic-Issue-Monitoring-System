import Complaint from "../models/Complaint.js";
import {
  processOfficerQuery,
  predictComplaintTrends,
  generateResourceAllocation,
  evaluateBeforeAfterImage,
} from "../utils/aiService.js";

// 1. AI Officer Assistant NLP Query Handler
export const queryOfficerAssistant = async (req, res) => {
  try {
    const { query } = req.body;
    const complaints = await Complaint.find().lean();
    const result = processOfficerQuery(query, complaints);

    return res.status(200).json({
      success: true,
      query,
      result,
    });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Predictive Complaint Analytics API
export const getPredictiveAnalytics = async (req, res) => {
  try {
    const complaints = await Complaint.find().lean();
    const analytics = predictComplaintTrends(complaints);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Predictive Analytics Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Intelligent Resource Allocation API
export const getResourceAllocations = async (req, res) => {
  try {
    const complaints = await Complaint.find().lean();
    const allocations = generateResourceAllocation(complaints);

    return res.status(200).json({
      success: true,
      allocations,
    });
  } catch (error) {
    console.error("Resource Allocation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. AI Before & After Image Analysis API
export const evaluateImageRepair = async (req, res) => {
  try {
    const { beforeImage, afterImage } = req.body;
    const result = evaluateBeforeAfterImage(beforeImage, afterImage);

    return res.status(200).json({
      success: true,
      evaluation: result,
    });
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Emergency Response Mode Trigger API
export const triggerEmergencyOverride = async (req, res) => {
  try {
    const { complaintId, emergencyType } = req.body;

    const complaint = await Complaint.findOne({
      $or: [{ _id: complaintId }, { complaintId: complaintId }],
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Grievance ticket not found." });
    }

    complaint.isEmergency = true;
    complaint.emergencyType = emergencyType || "CRITICAL CIVIC EMERGENCY";
    complaint.priority = "High";
    complaint.impactScore = 200;
    complaint.impactLevel = "Critical";

    complaint.timeline.push({
      stage: `CRITICAL EMERGENCY ACTIVATED (${complaint.emergencyType})`,
      timestamp: new Date(),
      officer: "Emergency Command Center",
      remarks: "Priority overridden to Top-of-Queue Emergency Response.",
      statusColor: "red",
    });

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: `Emergency Response Mode activated for Ticket #${complaint.complaintId}. Overridden to Top-of-Queue.`,
      complaint,
    });
  } catch (error) {
    console.error("Emergency Override Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
