import mongoose from "mongoose";

const serviceConfigSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    subcategory: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ServiceConfig", serviceConfigSchema);