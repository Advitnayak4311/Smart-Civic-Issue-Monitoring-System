import express from "express";

import {
  getAllComplaints,
  updateComplaint,
  trackComplaint,
  getClosedComplaints,
  deleteComplaint,
} from "../controllers/adminController.js";

const router = express.Router();

// Get all complaints
router.get("/complaints", getAllComplaints);

// Get closed complaints
router.get("/complaints/closed", getClosedComplaints);

// Update complaint
router.put("/complaints/:id", updateComplaint);

// Delete closed complaint
router.delete("/complaints/:id", deleteComplaint);

// Track complaint
router.get("/track/:complaintId", trackComplaint);

export default router;