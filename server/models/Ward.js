import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    wardNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    wardName: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      default: "Central Zone",
    },
    population: {
      type: Number,
      default: 45000,
    },
    healthScore: {
      type: Number,
      default: 85,
      index: true,
    },
    healthLevel: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor", "Critical"],
      default: "Good",
    },
    ranking: {
      type: Number,
      default: 1,
      index: true,
    },
    slaCompliancePercent: {
      type: Number,
      default: 90,
    },
    totalComplaints: {
      type: Number,
      default: 0,
    },
    resolvedComplaints: {
      type: Number,
      default: 0,
    },
    avgResolutionDays: {
      type: Number,
      default: 1.8,
    },
    citizenRating: {
      type: Number,
      default: 4.8,
    },
    centerLatitude: {
      type: Number,
      default: 12.9716,
    },
    centerLongitude: {
      type: Number,
      default: 77.5946,
    },
    boundaryPolygon: [
      {
        lat: Number,
        lng: Number,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Ward", wardSchema);
