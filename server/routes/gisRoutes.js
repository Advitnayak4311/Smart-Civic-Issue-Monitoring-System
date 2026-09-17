import express from "express";
import {
  getGisComplaints,
  getWardRankings,
  getCivicHealthIndex,
} from "../controllers/gisController.js";

const router = express.Router();

// Phase 3: GIS Map Markers & Spatial Data
router.get("/map-data", getGisComplaints);

// Phase 3: Ward Ranking System
router.get("/ward-rankings", getWardRankings);

// Phase 3: Flagship Civic Health Index
router.get("/health-index", getCivicHealthIndex);

export default router;
