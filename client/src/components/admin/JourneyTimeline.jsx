import React from "react";
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
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  Zap,
} from "lucide-react";

export default function JourneyTimeline({ complaint }) {
  if (!complaint) return null;

  // Build high-fidelity standard audit stages if timeline array isn't populated
  const buildTimelineStages = () => {
    const customTimeline = complaint.timeline || [];

    const defaultStages = [
      {
        stage: "Complaint Registered & Triaged",
        timestamp: complaint.createdAt,
        officer: complaint.citizenName || "Citizen (Digital Portal)",
        remarks: "Grievance securely registered into Central Municipal Command & GIS Routing Engine.",
        statusColor: "emerald",
        stageType: "creation",
        active: true,
      },
      {
        stage: "Department Allocation & SLA Binding",
        timestamp: complaint.acceptedAt || (complaint.status !== "Pending" ? complaint.createdAt : null),
        officer: complaint.department ? `${complaint.department} Authority` : "Municipal Nodal Officer",
        remarks: `Assigned to ${complaint.department || "General Services Division"} under guaranteed ${complaint.slaLimitHours || 48}-Hour Resolution SLA.`,
        statusColor: "blue",
        stageType: "assignment",
        active: complaint.status !== "Pending",
      },
      {
        stage: "Field Inspection & Remediation",
        timestamp: complaint.inProgressAt,
        officer: complaint.department || "Field Engineering Division",
        remarks: "Field crew & technical inspectors deployed on-site for physical repair and civic remediation.",
        statusColor: "amber",
        stageType: "action",
        active: ["In Progress", "Completed", "Closed"].includes(complaint.status),
      },
      {
        stage: "Remediation Completed & Evidence Verified",
        timestamp: complaint.completedAt,
        officer: "Senior Field Inspection Nodal Officer",
        remarks: "Field repair completed; verified photographic proof captured and dispatch verification sent to citizen.",
        statusColor: "emerald",
        stageType: "resolution",
        active: ["Completed", "Closed"].includes(complaint.status) || complaint.citizenVerified === "Yes",
      },
      {
        stage: "Citizen Verification & Audit Sign-Off",
        timestamp: complaint.closedAt || complaint.verificationDate,
        officer: "Citizen Resolution Audit System",
        remarks: complaint.citizenVerified === "Yes"
          ? "Citizen verified satisfactory completion. Audit closed and archived."
          : complaint.citizenVerified === "No"
          ? "Citizen reported issue persists. Grievance reopened with High Priority."
          : "Awaiting final citizen verification feedback and satisfaction rating.",
        statusColor: complaint.citizenVerified === "No" ? "red" : "purple",
        stageType: "closure",
        active: complaint.status === "Closed" || complaint.citizenVerified === "Yes" || complaint.citizenVerified === "No",
      },
    ];

    if (customTimeline && customTimeline.length > 0) {
      return customTimeline.map((item) => ({
        stage: item.stage,
        timestamp: item.timestamp,
        officer: item.officer || "Municipal System",
        remarks: item.remarks || "Audit entry logged into municipal tracking registry.",
        statusColor: item.statusColor || (item.stage.toLowerCase().includes("escalat") ? "red" : "blue"),
        active: true,
      }));
    }

    return defaultStages;
  };

  const stages = buildTimelineStages();
  const completedCount = stages.filter((s) => s.active).length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-8 space-y-6 overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Live Sync Status & Progress Gauge */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Synchronized Audit Trail
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900 shrink-0" />
            Official Complaint Resolution Journey
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable end-to-end municipal ledger recording dispatch alerts, officer actions, and citizen audits.
          </p>
        </div>

        {/* Executive SLA Completion Pill */}
        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-800 shrink-0">
          <div className="text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-blue-300">
              Audit Progress
            </div>
            <div className="text-xs font-black text-white">
              {completedCount} of {stages.length} Milestones
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-[11px] text-emerald-400 border-2 border-emerald-500">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(8, progressPercent)}%` }}
        />
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-linear-to-b before:from-blue-600 before:via-indigo-400 before:to-slate-200">
        {stages.map((st, idx) => {
          const isDone = st.active;
          const isCurrent = isDone && (idx === stages.length - 1 || !stages[idx + 1]?.active);
          const isEscalation = st.stage.toLowerCase().includes("escalat") || st.stage.toLowerCase().includes("reopen") || st.stage.toLowerCase().includes("dispute");
          const timeFormatted = formatTimestamp(st.timestamp);

          return (
            <div
              key={idx}
              className={`relative flex items-start gap-4 transition-all duration-200 ${
                isDone ? "opacity-100" : "opacity-45"
              }`}
            >
              {/* Stepper Node Icon Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isEscalation
                    ? "bg-red-600 border-white text-white ring-4 ring-red-500/20 shadow-md animate-pulse"
                    : isCurrent
                    ? "bg-blue-900 border-white text-white ring-4 ring-blue-600/30 shadow-md scale-110"
                    : isDone
                    ? "bg-emerald-600 border-white text-white shadow-xs"
                    : "bg-slate-100 border-slate-300 text-slate-400"
                }`}
              >
                {isEscalation ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                ) : isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Card Container */}
              <div
                className={`flex-1 rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                  isEscalation
                    ? "bg-linear-to-br from-red-50 to-orange-50/40 border-red-200 text-red-950 shadow-xs"
                    : isCurrent
                    ? "bg-linear-to-br from-blue-50/90 via-indigo-50/40 to-white border-blue-200 shadow-md ring-1 ring-blue-500/20"
                    : isDone
                    ? "bg-slate-50/80 hover:bg-slate-50 border-slate-200/90 text-slate-900 shadow-2xs"
                    : "bg-slate-50/30 border-dashed border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                      {st.stage}
                    </h4>
                    {isCurrent && (
                      <span className="bg-blue-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                        Active Stage
                      </span>
                    )}
                    {isEscalation && (
                      <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                        Priority Escalated
                      </span>
                    )}
                  </div>

                  {timeFormatted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs shrink-0">
                      <Clock className="w-3 h-3 text-blue-800" />
                      {timeFormatted}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 italic">
                      Pending milestone
                    </span>
                  )}
                </div>

                {st.officer && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-950 mt-2">
                    <Building2 className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                    <span>Nodal Authority:</span>
                    <span className="bg-blue-100/70 text-blue-900 px-2 py-0.5 rounded font-extrabold">
                      {st.officer}
                    </span>
                  </div>
                )}

                {st.remarks && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/60 font-medium">
                    {st.remarks}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer System Verification Stamp */}
      <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Smart Civic Issue Monitoring System &bull; Cryptographic Audit Ledger</span>
        </div>
        <span className="text-slate-400 text-[10px]">
          Ref #{complaint.complaintId || "N/A"}
        </span>
      </div>
    </div>
  );
}
