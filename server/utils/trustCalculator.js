import User from "../models/User.js";
import Complaint from "../models/Complaint.js";

export const calculateCitizenTrustAndBadges = async (userId) => {
  try {
    if (!userId) return null;

    const user = await User.findById(userId);
    if (!user) return null;

    const complaints = await Complaint.find({
      $or: [{ email: user.email }, { phone: user.phone }],
    }).lean();

    let score = 50; // Base starting score

    complaints.forEach((c) => {
      // +10 Verified Complaint
      if (c.status !== "Pending") score += 10;

      // +5 Supported by Others
      if (c.supportCount > 1) score += 5;

      // +3 Detailed Description (>80 chars)
      if (c.remarks && c.remarks.length >= 80) score += 3;

      // +2 Image Evidence Uploaded
      if (c.image) score += 2;

      // +2 Location GPS Available
      if (c.location && c.location.latitude) score += 2;

      // +5 Successfully Closed
      if (c.status === "Closed" || c.citizenVerified === "Yes") score += 5;
    });

    score = Math.min(100, Math.max(0, score));

    // Determine Trust Badge Level
    let trustBadge = "Active Citizen";
    if (score >= 90) trustBadge = "Verified Citizen";
    else if (score >= 75) trustBadge = "Trusted Citizen";
    else if (score >= 50) trustBadge = "Active Citizen";
    else trustBadge = "Needs Verification";

    // Award Achievement Badges based on milestones
    const badgesSet = new Set(user.badges || []);

    if (complaints.length >= 1) badgesSet.add("First Complaint");
    if (complaints.length >= 3) badgesSet.add("Top Contributor");

    const roadCount = complaints.filter((c) => (c.category || "").toLowerCase().includes("road")).length;
    if (roadCount >= 2) badgesSet.add("Road Guardian");

    const sanitationCount = complaints.filter((c) => (c.category || "").toLowerCase().includes("garbage")).length;
    if (sanitationCount >= 2) badgesSet.add("Clean City Champion");

    const waterCount = complaints.filter((c) => (c.category || "").toLowerCase().includes("water")).length;
    if (waterCount >= 2) badgesSet.add("Water Protector");

    if (score >= 90) badgesSet.add("Trust Champion");

    user.trustScore = score;
    user.trustBadge = trustBadge;
    user.badges = Array.from(badgesSet);
    user.contributionCount = complaints.length;
    user.resolvedCount = complaints.filter((c) => c.status === "Closed" || c.status === "Completed").length;

    await user.save();
    return user;
  } catch (err) {
    console.error("Trust Calculator Error:", err.message);
    return null;
  }
};
