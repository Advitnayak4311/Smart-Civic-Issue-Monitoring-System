import Complaint from "../models/Complaint.js";
import { sendEmail } from "./sendEmail.js";

// Category SLA Limit Configuration (Hours)
export const getSlaLimitForCategory = (category = "", issue = "") => {
  const cat = (category || "").toLowerCase();
  const iss = (issue || "").toLowerCase();

  if (cat.includes("water") || iss.includes("water") || iss.includes("pipe") || iss.includes("leak")) {
    return 12; // 12 Hours SLA
  }
  if (cat.includes("garbage") || cat.includes("sanitation") || iss.includes("garbage") || iss.includes("waste")) {
    return 24; // 24 Hours SLA
  }
  if (cat.includes("drain") || iss.includes("drain") || iss.includes("sewage")) {
    return 24; // 24 Hours SLA
  }
  if (cat.includes("electric") || cat.includes("light") || iss.includes("pole") || iss.includes("street light")) {
    return 36; // 36 Hours SLA
  }
  if (cat.includes("road") || iss.includes("pothole") || iss.includes("footpath")) {
    return 48; // 48 Hours SLA
  }

  return 48; // Standard Default 48 Hours SLA
};

// Automatic Escalation Engine Runner
export const checkAndTriggerEscalations = async () => {
  try {
    const now = Date.now();
    const activeComplaints = await Complaint.find({ status: { $ne: "Closed" } });

    let escalatedCount = 0;

    for (const c of activeComplaints) {
      const createdTime = new Date(c.createdAt).getTime();
      const hoursElapsed = (now - createdTime) / (1000 * 60 * 60);

      let newLevel = c.escalationLevel || 0;
      let escalationReason = "";
      let targetRole = "";

      // Escalation Rule 4: Overdue > 14 Days (336 Hours) -> Municipal Commissioner
      if (hoursElapsed >= 336 && newLevel < 4) {
        newLevel = 4;
        escalationReason = "CRITICAL BREACH: Grievance un-remediated after 14 Days of registration.";
        targetRole = "Municipal Commissioner & Nodal Officer Desk";
      }
      // Escalation Rule 3: In Progress > 7 Days (168 Hours) -> Department Head
      else if (hoursElapsed >= 168 && newLevel < 3) {
        newLevel = 3;
        escalationReason = "SERIOUS DELAY: In-progress work stalled for over 7 Days.";
        targetRole = "Department Head & Chief Engineer Desk";
      }
      // Escalation Rule 2: Accepted > 48 Hours -> Supervisor
      else if (hoursElapsed >= 48 && newLevel < 2) {
        newLevel = 2;
        escalationReason = "SLA BREACH: Officer accepted grievance but resolution exceeds 48 Hours.";
        targetRole = "Zonal Ward Supervisor Desk";
      }
      // Escalation Rule 1: Pending > 24 Hours -> Level 1 Reminder
      else if (hoursElapsed >= 24 && newLevel < 1 && c.status === "Pending") {
        newLevel = 1;
        escalationReason = "UNACCEPTED TICKET: Pending officer review for >24 Hours.";
        targetRole = "Municipal Response Officer Desk";
      }

      if (newLevel > (c.escalationLevel || 0)) {
        c.escalationLevel = newLevel;
        c.priority = "High"; // Automatically escalate to High Priority
        c.lastEscalatedAt = new Date();

        c.escalationHistory.push({
          level: newLevel,
          escalatedAt: new Date(),
          reason: escalationReason,
          escalatedBy: "Auto Escalation Engine",
        });

        c.timeline.push({
          stage: `Escalated to Level ${newLevel} (${targetRole})`,
          timestamp: new Date(),
          officer: "Auto Escalation Engine",
          remarks: escalationReason,
          statusColor: newLevel === 4 ? "red" : newLevel === 3 ? "purple" : "orange",
        });

        await c.save();
        escalatedCount++;

        // Send Email Alert to Municipal Officer & Admin Desk
        setImmediate(async () => {
          try {
            const officerEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
            await sendEmail({
              to: officerEmail,
              subject: `🚨 ESCALATION ALERT Level ${newLevel}: Ticket #${c.complaintId} (${c.category})`,
              html: `
                <div style="font-family:Arial,sans-serif;padding:24px;background:#f8fafc;">
                  <div style="max-width:550px;margin:auto;background:white;padding:24px;border-radius:12px;border:2px solid #dc2626;">
                    <div style="background:#fee2e2;color:#991b1b;padding:8px 12px;border-radius:8px;font-weight:bold;font-size:12px;margin-bottom:16px;">
                      AUTOMATIC ESCALATION LEVEL ${newLevel} NOTICE
                    </div>
                    <h3 style="color:#0f172a;margin-top:0;">Grievance Ref #${c.complaintId}</h3>
                    <p><b>Category:</b> ${c.category} &rsaquo; ${c.issue}</p>
                    <p><b>Assigned Department:</b> ${c.department}</p>
                    <p><b>Target Level:</b> ${targetRole}</p>
                    <p><b>Reason:</b> ${escalationReason}</p>
                    <p style="color:#64748b;font-size:12px;">Total elapsed time: ${Math.round(hoursElapsed)} hours.</p>
                  </div>
                </div>
              `,
            });
          } catch (e) {
            console.log("Escalation Email Alert Note:", e.message);
          }
        });
      }
    }

    return { success: true, count: escalatedCount };
  } catch (err) {
    console.error("Escalation Engine Note:", err.message);
    return { success: false, error: err.message };
  }
};
