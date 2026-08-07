import {
  FileText,
  UserCheck,
  Building2,
  Search,
  Wrench,
  CheckCircle2,
  MailCheck,
  ShieldCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";

export default function JourneyTimeline({ complaint }) {
  if (!complaint) return null;

  // Standard timeline fallback generator if timeline array is not fully populated
  const buildTimelineStages = () => {
    const customTimeline = complaint.timeline || [];

    const defaultStages = [
      {
        stage: "Complaint Submitted",
        timestamp: complaint.createdAt,
        officer: complaint.citizenName || "Citizen",
        remarks: "Grievance registered into Municipal Command Center.",
        statusColor: "emerald",
        icon: FileText,
        active: true,
      },
      {
        stage: "Officer Accepted & Department Assigned",
        timestamp: complaint.acceptedAt || (complaint.status !== "Pending" ? complaint.createdAt : null),
        officer: "Municipal Nodal Officer",
        remarks: `Assigned to ${complaint.department || "General Division"} (SLA Limit: ${complaint.slaLimitHours || 48} Hours).`,
        statusColor: "blue",
        active: complaint.status !== "Pending",
      },
      {
        stage: "Site Inspection & Work Started",
        timestamp: complaint.inProgressAt,
        officer: complaint.department || "Field Engineering Division",
        remarks: "Field crew dispatched for on-site inspection and repair.",
        statusColor: "amber",
        active: ["In Progress", "Completed", "Closed"].includes(complaint.status),
      },
      {
        stage: "Repair Completed & Verification Dispatched",
        timestamp: complaint.completedAt,
        officer: "Lead Field Inspector",
        remarks: "Remediation verified; interactive email dispatch to citizen.",
        statusColor: "emerald",
        active: ["Completed", "Closed"].includes(complaint.status) || complaint.citizenVerified === "Yes",
      },
      {
        stage: "Citizen Verified & Audit Closure",
        timestamp: complaint.closedAt || complaint.verificationDate,
        officer: "Audit System",
        remarks: complaint.citizenVerified === "Yes" ? "Citizen confirmed resolution. Grievance archived." : "Final audit verification.",
        statusColor: "purple",
        active: complaint.status === "Closed" || complaint.citizenVerified === "Yes",
      },
    ];

    // If custom timeline array exists, merge or prefer it
    if (customTimeline && customTimeline.length > 0) {
      return customTimeline.map((item, idx) => ({
        stage: item.stage,
        timestamp: item.timestamp,
        officer: item.officer || "Municipal System",
        remarks: item.remarks || "Stage recorded in system audit log.",
        statusColor: item.statusColor || "blue",
        active: true,
      }));
    }

    return defaultStages;
  };

  const stages = buildTimelineStages();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-900" />
          Complaint Journey Audit Trail
        </h3>
        <span className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md">
          {stages.filter((s) => s.active).length} / {stages.length} Stages Completed
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stages.map((st, idx) => {
          const isDone = st.active;
          const isEscalation = st.stage.toLowerCase().includes("escalat");

          return (
            <div key={idx} className="relative flex items-start gap-4 text-xs group">
              {/* Dot / Icon Badge */}
              <div
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                  isEscalation
                    ? "bg-red-600 border-red-200 text-white animate-bounce"
                    : isDone
                    ? "bg-blue-900 border-white text-white shadow-xs"
                    : "bg-slate-100 border-slate-300 text-slate-400"
                }`}
              >
                {isEscalation ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : isDone ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Card Body */}
              <div className={`flex-1 rounded-xl p-3.5 border transition ${
                isEscalation
                  ? "bg-red-50/80 border-red-300 text-red-950"
                  : isDone
                  ? "bg-slate-50/70 border-slate-200 text-slate-900"
                  : "bg-slate-50/30 border-dashed border-slate-200 text-slate-400"
              }`}>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-xs text-slate-900">{st.stage}</h4>
                  {(() => {
                    if (!st.timestamp) return null;
                    try {
                      const d = new Date(st.timestamp);
                      if (isNaN(d.getTime())) return null;
                      return (
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          {d.toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>

                {st.officer && (
                  <p className="text-[11px] font-semibold text-blue-900 mt-1">
                    Logged Officer: {st.officer}
                  </p>
                )}

                {st.remarks && (
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed italic">
                    "{st.remarks}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
