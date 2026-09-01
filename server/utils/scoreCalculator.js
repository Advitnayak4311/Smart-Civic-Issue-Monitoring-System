// ==========================================
// Haversine Distance Calculator (in meters)
// ==========================================
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return Infinity;
  }

  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Distance in meters
};

// ==========================================
// Complaint Confidence Score (0 - 100)
// ==========================================
export const calculateConfidenceScore = (complaint) => {
  let score = 0;

  // 1. Image Uploaded (+20)
  const hasImage = Boolean(
    (complaint.imageUrl && complaint.imageUrl.trim() !== "") ||
    (Array.isArray(complaint.imageList) && complaint.imageList.length > 0)
  );
  if (hasImage) score += 20;

  // 2. GPS Available (+15)
  const lat = complaint.location?.latitude ?? complaint.latitude;
  const lon = complaint.location?.longitude ?? complaint.longitude;
  if (lat && lon) score += 15;

  // 3. Reverse Geocoding Successful (+10)
  const hasAddress = Boolean(
    complaint.address ||
    complaint.location?.address
  );
  if (hasAddress) score += 10;

  // 4. Detailed Description (>80 chars) (+10)
  const remarksLength = (complaint.remarks || "").trim().length;
  if (remarksLength > 80) score += 10;

  // 5. Citizen Logged In (+10)
  if (complaint.user) score += 10;

  // 6. Support Count (+5 per supporter, max +25)
  const supportCount = complaint.supportCount || 1;
  const supportBonus = Math.min(25, Math.max(0, (supportCount - 1) * 5));
  score += supportBonus;

  // 7. No Duplicate (+10)
  if (!complaint.isDuplicate) score += 10;

  // Capped at 100 max
  score = Math.min(100, Math.max(0, score));

  // Determine Level
  let level = "Low";
  if (score >= 80) level = "High";
  else if (score >= 50) level = "Medium";

  return { score, level };
};

// ==========================================
// Complaint Impact Score (0 - 200)
// ==========================================
export const calculateImpactScore = (complaint) => {
  let score = 0;

  // 1. Category Base Weight
  const cat = (complaint.category || "").toLowerCase();
  const issue = (complaint.issue || "").toLowerCase();

  if (cat.includes("electric") || issue.includes("electric") || issue.includes("power") || issue.includes("wire")) {
    score += 25;
  } else if (cat.includes("water") || issue.includes("water") || issue.includes("pipe") || issue.includes("leak") || issue.includes("drain")) {
    score += 20;
  } else if (cat.includes("road") || issue.includes("pothole") || issue.includes("footpath")) {
    score += 15;
  } else if (cat.includes("sanitation") || cat.includes("garbage") || issue.includes("waste") || issue.includes("dustbin")) {
    score += 15;
  } else {
    score += 10;
  }

  // 2. Location Sensitivity Keywords (Near School: +25, Near Hospital: +30)
  const combinedText = `${complaint.address || ""} ${complaint.location?.address || ""} ${complaint.remarks || ""}`.toLowerCase();

  const schoolKeywords = ["school", "college", "university", "academy", "vidyalaya", "school gate", "school road", "kendra"];
  const hospitalKeywords = ["hospital", "clinic", "dispensary", "nursing home", "health center", "medical", "phc", "trauma"];

  const nearSchool = schoolKeywords.some((kw) => combinedText.includes(kw));
  const nearHospital = hospitalKeywords.some((kw) => combinedText.includes(kw));

  if (nearSchool) score += 25;
  if (nearHospital) score += 30;

  // 3. Support Count (+10 for every 5 supporters)
  const supportCount = complaint.supportCount || 1;
  const supporterBonus = Math.floor((supportCount - 1) / 5) * 10;
  score += supporterBonus;

  // 4. Days Pending (+2/day)
  if (complaint.createdAt) {
    const createdDate = new Date(complaint.createdAt);
    const diffTime = Math.max(0, Date.now() - createdDate.getTime());
    const daysPending = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    score += daysPending * 2;
  }

  // Capped at 200 max
  score = Math.min(200, Math.max(0, score));

  // Determine Level
  let level = "Low";
  if (score >= 101) level = "High";
  else if (score >= 51) level = "Medium";

  return { score, level };
};
