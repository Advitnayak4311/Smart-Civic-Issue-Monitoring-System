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

    imageList: [{
      type: String,
    }],

    videoUrl: {
      type: String,
      default: null,
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

    district: {
      type: String,
    },

    zone: {
      type: String,
    },

    ward: {
      type: String,
      default: "Ward 12 - Central Division",
      index: true,
    },

    wardNumber: {
      type: Number,
      default: 12,
      index: true,
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
    "Under Verification",
    "Completed",
    "Closed",
    "Reopened",
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

reopenedAt: {
  type: Date,
  default: null,
},

    // ==========================================
    // Phase 1 - Smart Intelligence Fields
    // ==========================================
    supportCount: {
      type: Number,
      default: 1,
      index: true,
    },

    supportedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        email: String,
        phone: String,
        supportedAt: { type: Date, default: Date.now },
      },
    ],

    isDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },

    parentComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    duplicateComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Complaint",
      },
    ],

    confidenceScore: {
      type: Number,
      default: 0,
      index: true,
    },

    confidenceLevel: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },

    impactScore: {
      type: Number,
      default: 0,
      index: true,
    },

    impactLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    // ==========================================
    // Phase 2 - Intelligent Decision Support (DSS) Fields
    // ==========================================
    slaLimitHours: {
      type: Number,
      default: 48,
      index: true,
    },

    timeline: [
      {
        stage: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        officer: { type: String, default: "System Automation" },
        remarks: { type: String, default: "" },
        statusColor: { type: String, default: "blue" },
      },
    ],

    escalationLevel: {
      type: Number,
      default: 0, // 0 = Normal, 1 = Level 1 Reminder, 2 = Level 2 Supervisor, 3 = Level 3 Dept Head, 4 = Level 4 Commissioner
      index: true,
    },

    escalationHistory: [
      {
        level: Number,
        escalatedAt: { type: Date, default: Date.now },
        reason: String,
        escalatedBy: { type: String, default: "Auto Escalation Engine" },
      },
    ],

    reminderCount: {
      type: Number,
      default: 0,
    },

    lastEscalatedAt: {
      type: Date,
      default: null,
    },

    citizenRating: {
      type: Number,
      default: null,
    },

    citizenComment: {
      type: String,
      default: "",
    },

    reopenImages: [
      {
        type: String,
      },
    ],

    reopenedReason: {
      type: String,
      default: "",
    },

    // ==========================================
    // Phase 4 - Engagement, Transparency & Feedback Fields
    // ==========================================
    beforeImage: {
      type: String,
      default: "",
    },

    afterImage: {
      type: String,
      default: "",
    },

    resolutionNotes: {
      type: String,
      default: "Remediation verified by field inspection team.",
    },

    resolvedBy: {
      type: String,
      default: "Municipal Works Division",
    },

    departmentRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    responseRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    workQuality: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    feedbackComments: {
      type: String,
      default: "",
    },

    // ==========================================
    // Phase 5 - AI Powered Smart Governance & Emergency Fields
    // ==========================================
    isEmergency: {
      type: Boolean,
      default: false,
      index: true,
    },

    emergencyType: {
      type: String,
      default: "",
    },

    aiSummary: {
      type: String,
      default: "",
    },

    aiKeywords: [{ type: String }],

    aiSeverity: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },

    aiRepairConfidence: {
      type: Number,
      default: 0,
    },

    aiSimilarityScore: {
      type: Number,
      default: 0,
    },

    aiRecommendations: [
      {
        action: String,
        confidence: Number,
        accepted: { type: Boolean, default: false },
      },
    ],

  },
  {
    timestamps: true,
  }
);

// High Performance Indexing for Duplicate Detection, SLA & Analytics
complaintSchema.index({ category: 1, issue: 1, status: 1 });
complaintSchema.index({ "location.latitude": 1, "location.longitude": 1 });
complaintSchema.index({ supportCount: -1 });
complaintSchema.index({ impactScore: -1 });
complaintSchema.index({ confidenceScore: -1 });
complaintSchema.index({ escalationLevel: -1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ isEmergency: -1 });

export default mongoose.model("Complaint", complaintSchema);