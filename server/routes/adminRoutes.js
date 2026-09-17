import express from "express";

import {
  getAllComplaints,
  updateComplaint,
  trackComplaint,
  getClosedComplaints,
  deleteComplaint,
  getAnalyticsStats,
  getDepartmentPerformance,
  triggerEscalationsApi,
  clearAllComplaints,
  testEmailApi,
} from "../controllers/adminController.js";

const router = express.Router();

// Test live SMTP email dispatch
router.post("/test-email", testEmailApi);

// Delete / Purge all dummy & test complaints
router.delete("/clear-all", clearAllComplaints);

// Get all complaints
router.get("/complaints", getAllComplaints);

// Analytics & Intelligence Stats
router.get("/analytics", getAnalyticsStats);

// Phase 2: Department Performance Index
router.get("/department-performance", getDepartmentPerformance);

// Phase 2: Trigger Automatic Escalations
router.post("/escalations/trigger", triggerEscalationsApi);

// Get closed complaints
router.get("/complaints/closed", getClosedComplaints);

// Update complaint
router.put("/complaints/:id", updateComplaint);

// Delete closed complaint
router.delete("/complaints/:id", deleteComplaint);

// Track complaint
router.get("/track/:complaintId", trackComplaint);

export default router;