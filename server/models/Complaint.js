import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    category: {
      type: String,
      required: true,
    },

    issue: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    address: {
      type: String,
    },

    citizenName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    remarks: {
      type: String,
    },
priority: {
  type: String,
  enum: ["High", "Medium", "Low"],
  default: "Low",
},

department: {
  type: String,
  default: "General",
},

status: {
  type: String,
  enum: [
    "Pending",
    "Accepted",
    "In Progress",
    "Completed",
    "Closed",
  ],
  default: "Pending",
},

verificationToken: {
  type: String,
  default: null,
},

citizenVerified: {
  type: String,
  enum: ["Pending", "Yes", "No"],
  default: "Pending",
},

verificationDate: {
  type: Date,
  default: null,
},
acceptedAt: {
  type: Date,
  default: null,
},

inProgressAt: {
  type: Date,
  default: null,
},

completedAt: {
  type: Date,
  default: null,
},

closedAt: {
  type: Date,
  default: null,
},

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Complaint", complaintSchema);