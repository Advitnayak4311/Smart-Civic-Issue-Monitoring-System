import React from "react";
import { CheckCircle2, Clock, Sparkles, CheckCheck, FileText } from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Pending Stage";
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ComplaintTimeline = ({ complaint }) => {
  const steps = [
    {
      title: "1. Complaint Registered",
      date: complaint.createdAt,
      completed: true,
      icon: CheckCircle2,
      message: "Grievance successfully submitted and assigned reference ID.",
    },
    {
      title: "2. Department Acceptance",
      date: complaint.acceptedAt,
      completed: !!complaint.acceptedAt,
      icon: CheckCircle2,
      message: `Assigned to ${complaint.department || "Municipal Officer"}.`,
    },
    {
      title: "3. Work In Progress",
      date: complaint.inProgressAt,
      completed: !!complaint.inProgressAt,
      icon: Sparkles,
      message: "Field team deployed for inspection and remediation.",
    },
    {
      title: "4. Work Completed",
      date: complaint.completedAt,
      completed: !!complaint.completedAt,
      icon: CheckCheck,
      message: "Remediation finished. Verification email dispatched to citizen.",
    },
    {
      title: "5. Official Closure",
      date: complaint.closedAt,
      completed: !!complaint.closedAt,
      icon: CheckCircle2,
      message: "Grievance closed following citizen verification.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-900" />
          SLA Milestone Resolution Timeline
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Updated Real-Time</span>
      </div>

      <div className="relative pl-3 space-y-6">
        {/* Timeline Line */}
        <div className="absolute left-6 top-3 bottom-6 w-0.5 bg-slate-200" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 relative z-10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  step.completed
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-400 border border-slate-300"
                }`}
              >
                {step.completed ? <Icon className="w-3.5 h-3.5" /> : index + 1}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-3">
                  <h4 className={`text-xs font-bold ${step.completed ? "text-slate-900" : "text-slate-500"}`}>
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {formatDate(step.date)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {step.completed ? step.message : "Awaiting previous milestone completion."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintTimeline;