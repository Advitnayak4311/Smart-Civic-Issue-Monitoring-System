// AI Engine Utilities for Phase 5 Smart Governance

// 1. AI Complaint Summarization & NLP Keyword Extractor
export const generateAiSummary = (remarks = "", category = "", issue = "") => {
  const text = remarks.trim() || `${category} - ${issue}`;
  
  // Extract keywords
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const stopWords = new Set(["the", "a", "an", "is", "and", "or", "in", "on", "at", "to", "for", "with", "near"]);
  const keywords = Array.from(new Set(words.filter((w) => w.length > 3 && !stopWords.has(w)))).slice(0, 5);

  let severity = "Low";
  if (text.toLowerCase().includes("urgent") || text.toLowerCase().includes("danger") || text.toLowerCase().includes("burst") || text.toLowerCase().includes("fire")) {
    severity = "High";
  } else if (text.length > 50 || category.includes("Water") || category.includes("Electricity")) {
    severity = "Medium";
  }

  const summary = `${category} issue (${issue}) reported near location. Immediate field inspection required.`;

  return { summary, keywords, severity };
};

// 2. Predictive Complaint Analytics & Forecasting Engine (100% Real Database Trends)
export const predictComplaintTrends = (allComplaints = []) => {
  const standardCategories = [
    "Roads & Infrastructure",
    "Water & Pipeline",
    "Street Light & Electrical",
    "Sanitation & Garbage",
    "Drainage & Sewerage",
  ];

  if (!allComplaints || allComplaints.length === 0) {
    const forecast = standardCategories.map((cat) => ({
      category: cat,
      currentMonth: 0,
      predictedNextMonth: 0,
      increasePercent: 0,
      riskLevel: "Low",
    }));

    return {
      forecast,
      highRiskWards: [],
      sampleSize: 0,
    };
  }

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;

  // Extract all distinct categories from actual complaints plus standard categories
  const actualCategories = Array.from(
    new Set([
      ...standardCategories,
      ...allComplaints.map((c) => c.category).filter(Boolean),
    ])
  );

  const forecast = actualCategories.map((cat) => {
    const matchingComplaints = allComplaints.filter(
      (c) => (c.category || "").toLowerCase() === cat.toLowerCase()
    );

    const currentMonthTickets = matchingComplaints.filter((c) => {
      const createdTime = new Date(c.createdAt || now).getTime();
      return now - createdTime <= thirtyDaysMs;
    });

    const previousMonthTickets = matchingComplaints.filter((c) => {
      const createdTime = new Date(c.createdAt || now).getTime();
      const age = now - createdTime;
      return age > thirtyDaysMs && age <= sixtyDaysMs;
    });

    const currentCount = currentMonthTickets.length || matchingComplaints.length;
    const prevCount = previousMonthTickets.length;

    let predictedNextMonth = currentCount;
    let increasePercent = 0;

    if (prevCount > 0) {
      const trendRate = (currentCount - prevCount) / prevCount;
      predictedNextMonth = Math.max(0, Math.round(currentCount * (1 + trendRate)));
      increasePercent = Math.round(trendRate * 100);
    } else {
      predictedNextMonth = currentCount;
      increasePercent = 0;
    }

    const highPriorityCount = matchingComplaints.filter(
      (c) => c.priority === "High" && c.status !== "Closed"
    ).length;

    let riskLevel = "Low";
    if (highPriorityCount >= 3 || currentCount >= 10) riskLevel = "High";
    else if (highPriorityCount >= 1 || currentCount >= 4) riskLevel = "Medium";

    return {
      category: cat,
      currentMonth: currentCount,
      predictedNextMonth,
      increasePercent,
      riskLevel,
    };
  });

  // Calculate High-Risk Wards dynamically from genuine complaints with wards
  const wardMap = {};
  allComplaints.forEach((c) => {
    const wardName = c.ward?.trim() || (c.location?.address ? c.location.address.split(",")[0] : null);
    if (!wardName) return;

    if (!wardMap[wardName]) {
      wardMap[wardName] = {
        ward: wardName,
        totalTickets: 0,
        pendingTickets: 0,
        highPriority: 0,
        categories: {},
      };
    }

    wardMap[wardName].totalTickets++;
    if (c.status !== "Closed" && c.status !== "Completed") {
      wardMap[wardName].pendingTickets++;
    }
    if (c.priority === "High") {
      wardMap[wardName].highPriority++;
    }

    const cat = c.category || "General";
    wardMap[wardName].categories[cat] = (wardMap[wardName].categories[cat] || 0) + 1;
  });

  const highRiskWards = Object.values(wardMap)
    .sort((a, b) => b.pendingTickets - a.pendingTickets || b.highPriority - a.highPriority)
    .slice(0, 3)
    .map((w) => {
      const topCategory =
        Object.entries(w.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "Civic Grievances";

      return {
        ward: w.ward,
        predictedIncrease: `${w.pendingTickets} pending / ${w.totalTickets} total`,
        primaryRisk: `${topCategory} (${w.highPriority} High Priority)`,
      };
    });

  return {
    forecast,
    highRiskWards,
    sampleSize: allComplaints.length,
  };
};

// 3. Intelligent Municipal Resource Allocation Engine (Derived Strictly from Real Department Backlog)
export const generateResourceAllocation = (allComplaints = []) => {
  const pendingComplaints = (allComplaints || []).filter(
    (c) => c.status !== "Closed" && c.status !== "Completed"
  );

  if (pendingComplaints.length === 0) {
    return [];
  }

  // Group pending tickets by real department
  const deptMap = {};
  pendingComplaints.forEach((c) => {
    const dept = c.department?.trim() || "General Department";
    if (!deptMap[dept]) {
      deptMap[dept] = {
        department: dept,
        pendingTickets: 0,
        highPriority: 0,
        categories: new Set(),
      };
    }
    deptMap[dept].pendingTickets++;
    if (c.priority === "High") deptMap[dept].highPriority++;
    if (c.category) deptMap[dept].categories.add(c.category);
  });

  return Object.values(deptMap)
    .sort((a, b) => b.pendingTickets - a.pendingTickets || b.highPriority - a.highPriority)
    .map((item) => {
      const { department, pendingTickets, highPriority } = item;

      let recommendedWorkforce = "1 Inspection Team (2 field staff)";
      if (pendingTickets > 8) {
        recommendedWorkforce = `${Math.ceil(pendingTickets / 3)} Field Units (${Math.ceil(pendingTickets / 3) * 3} staff)`;
      } else if (pendingTickets > 3) {
        recommendedWorkforce = "2 Dedicated Field Units (6 staff)";
      } else if (pendingTickets > 1) {
        recommendedWorkforce = "1 Dedicated Field Unit (3 staff)";
      }

      let recommendedEquipment = "Standard Utility Van & Toolkit";
      const deptLower = department.toLowerCase();
      if (deptLower.includes("road") || deptLower.includes("highway") || deptLower.includes("pwd")) {
        recommendedEquipment = pendingTickets > 3 ? "1 Asphalt Compactor & Repair Van" : "1 Rapid Patch Utility Van";
      } else if (deptLower.includes("water") || deptLower.includes("drainage") || deptLower.includes("sewer")) {
        recommendedEquipment = pendingTickets > 3 ? "1 High-Pressure Suction Jetter & Tool Van" : "1 Pipe Inspection & Repair Van";
      } else if (deptLower.includes("sanitation") || deptLower.includes("waste")) {
        recommendedEquipment = pendingTickets > 3 ? "2 Hydraulic Compactor Trucks" : "1 Waste Collection Tipper";
      } else if (deptLower.includes("electric") || deptLower.includes("energy") || deptLower.includes("light")) {
        recommendedEquipment = "1 Aerial Bucket Lift Van & Diagnostic Kit";
      }

      let urgency = "Low";
      if (highPriority > 2 || pendingTickets >= 10) urgency = "Critical";
      else if (highPriority > 0 || pendingTickets >= 4) urgency = "High";
      else if (pendingTickets > 1) urgency = "Medium";

      return {
        department,
        pendingTickets,
        recommendedWorkforce,
        recommendedEquipment,
        urgency,
      };
    });
};

// 4. AI Before & After Image Analysis Simulator
export const evaluateBeforeAfterImage = (beforeImg, afterImg) => {
  if (!afterImg) {
    return {
      status: "Awaiting Remediation Upload",
      message: "Please upload the post-repair image to perform visual confirmation.",
    };
  }

  return {
    status: "Remediation Evidence Attached",
    message: "Field remediation image submitted. Awaiting municipal officer review and citizen confirmation.",
  };
};

// 5. AI Municipal Officer Assistant Query Processor (100% Real Dynamic Stats)
export const processOfficerQuery = (queryText = "", complaints = []) => {
  const q = (queryText || "").toLowerCase();
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const total = safeComplaints.length;
  const activeTickets = safeComplaints.filter((c) => c.status !== "Closed" && c.status !== "Completed");
  const resolvedTickets = safeComplaints.filter((c) => c.status === "Closed" || c.status === "Completed");

  if (q.includes("high priority") || q.includes("urgent")) {
    const highTickets = activeTickets.filter((c) => c.priority === "High");
    return {
      answer: highTickets.length > 0
        ? `Found ${highTickets.length} active High-Priority grievance(s) requiring immediate officer attention.`
        : "No active High-Priority grievances pending in the queue.",
      table: highTickets.slice(0, 5).map((c) => ({
        Ref: c.complaintId,
        Category: c.category,
        Dept: c.department || "General",
        Status: c.status,
      })),
      action: "Filter Table by High Priority",
    };
  }

  if (q.includes("backlog") || q.includes("highest")) {
    if (activeTickets.length === 0) {
      return {
        answer: "There are currently 0 active pending grievances across all municipal departments. No backlog detected.",
        stats: { "Active Pending": 0, "Resolved": resolvedTickets.length },
        action: "Review Department Registry",
      };
    }

    const deptCounts = {};
    activeTickets.forEach((c) => {
      const d = c.department?.trim() || "General Department";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    const [topDept, topCount] = sortedDepts[0];
    const topPercent = Math.round((topCount / activeTickets.length) * 100);

    const stats = {};
    sortedDepts.slice(0, 4).forEach(([d, count]) => {
      stats[d] = `${Math.round((count / activeTickets.length) * 100)}% (${count})`;
    });

    return {
      answer: `${topDept} currently holds the highest pending backlog with ${topCount} ticket(s) (${topPercent}% of active pending grievances).`,
      stats,
      action: "Review Department Performance",
    };
  }

  if (q.includes("resolved") || q.includes("completed") || q.includes("closed")) {
    const resolutionRate = total > 0 ? Math.round((resolvedTickets.length / total) * 100) : 100;
    return {
      answer: `A total of ${resolvedTickets.length} out of ${total} grievance(s) have been resolved (${resolutionRate}% resolution rate).`,
      stats: {
        "Resolved Tickets": resolvedTickets.length,
        "Active Pending": activeTickets.length,
        "Total Filed": total,
      },
      action: "View Resolution Archives",
    };
  }

  if (q.includes("sla") || q.includes("violation") || q.includes("breach")) {
    return {
      answer: activeTickets.length > 0
        ? `Found ${activeTickets.length} active grievance ticket(s) currently being monitored against SLA turnaround targets.`
        : "All grievances have been addressed. No SLA breaches or active tickets pending.",
      table: activeTickets.slice(0, 5).map((c) => ({
        Ref: c.complaintId,
        Category: c.category,
        Dept: c.department || "General",
        Created: new Date(c.createdAt).toLocaleDateString(),
      })),
      action: "Monitor SLA Performance",
    };
  }

  // Default natural language overview
  const resRate = total > 0 ? Math.round((resolvedTickets.length / total) * 100) : 100;
  return {
    answer: total > 0
      ? `Analyzed municipal database across ${total} total grievance ticket(s). ${resolvedTickets.length} resolved (${resRate}% resolution rate), with ${activeTickets.length} active grievance(s) currently in progress.`
      : "The municipal grievance registry is currently clear with 0 complaints recorded.",
    stats: {
      "Total Tickets": total,
      "Resolved": resolvedTickets.length,
      "Active Pending": activeTickets.length,
    },
    action: "View GIS Command Map",
  };
};
