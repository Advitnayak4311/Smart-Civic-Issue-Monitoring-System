import express from "express";
import {
  queryOfficerAssistant,
  getPredictiveAnalytics,
  getResourceAllocations,
  evaluateImageRepair,
  triggerEmergencyOverride,
} from "../controllers/aiController.js";

const router = express.Router();

// Phase 5: AI Officer Assistant NLP
router.post("/assistant", queryOfficerAssistant);

// Phase 5: Predictive Analytics & Forecasting
router.get("/predictive-analytics", getPredictiveAnalytics);

// Phase 5: Intelligent Resource Allocation
router.get("/resource-allocation", getResourceAllocations);

// Phase 5: AI Image Analysis
router.post("/image-analysis", evaluateImageRepair);

// Phase 5: Emergency Response Override
router.post("/emergency-trigger", triggerEmergencyOverride);

export default router;
