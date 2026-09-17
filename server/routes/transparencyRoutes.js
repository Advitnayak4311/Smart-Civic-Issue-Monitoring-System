import express from "express";
import {
  getPublicTransparencyStats,
  getLeaderboard,
  submitComplaintFeedback,
  getResolutionGallery,
} from "../controllers/transparencyController.js";

const router = express.Router();

// Phase 4: Public Transparency Portal Stats
router.get("/public-stats", getPublicTransparencyStats);

// Phase 4: Citizen Achievement Leaderboard
router.get("/leaderboard", getLeaderboard);

// Phase 4: Satisfaction Rating Feedback
router.post("/feedback", submitComplaintFeedback);

// Phase 4: Before & After Resolution Gallery
router.get("/gallery", getResolutionGallery);

export default router;
