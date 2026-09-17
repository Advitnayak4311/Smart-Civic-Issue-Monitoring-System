import express from "express";
import {
  createService,
  getServices,
  updateService,
  deleteService,
} from "../controllers/serviceConfigController.js";

const router = express.Router();

// Create Service
router.post("/", createService);

// Get All Services
router.get("/", getServices);

// Update Service
router.put("/:id", updateService);

// Delete Service
router.delete("/:id", deleteService);

export default router;