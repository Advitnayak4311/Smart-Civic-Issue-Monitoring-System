import { Clock, CheckCircle2, AlertCircle, Sparkles, CheckCheck } from "lucide-react";

export default function StatusBadge({ status }) {
  switch (status) {
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending Review
        </span>
      );
    case "Accepted":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Accepted
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          In Progress
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case "Closed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          Closed & Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
          {status || "Unknown"}
        </span>
      );
  }
}
