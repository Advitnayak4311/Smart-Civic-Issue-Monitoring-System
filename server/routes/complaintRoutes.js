import express from "express";
const router = express.Router();

import { protectRoute } from "../middleware/auth.js";

import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
  getComplaintByToken,
  verifyComplaint,
  getClosedComplaints,
  deleteComplaint,
  checkDuplicateComplaint,
  supportComplaint,
} from "../controllers/complaintController.js";

// =========================================
// Citizen Routes
// =========================================

// Check Duplicate Complaint (<300ms SLA)
router.post("/check-duplicate", checkDuplicateComplaint);

// Support Existing Complaint
router.post("/support/:id", supportComplaint);

// Register Complaint
router.post("/", createComplaint);

// Logged-in User Complaints
router.get("/my", protectRoute, getMyComplaints);

// Citizen Verification
router.get("/verify/:token", getComplaintByToken);
router.post("/verify/:token", verifyComplaint);

// =========================================
// Admin Routes
// =========================================

// Get All Complaints
router.get("/", protectRoute, getAllComplaints);

// Get Closed Complaints
router.get("/closed", protectRoute, getClosedComplaints);

// Update Complaint Status
router.put("/:id", protectRoute, updateComplaintStatus);

// Delete Closed Complaint
router.delete("/:id", protectRoute, deleteComplaint);

export default router;