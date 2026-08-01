import { ShieldAlert, AlertTriangle, Info } from "lucide-react";

export default function PriorityBadge({ priority }) {
  switch (priority) {
    case "High":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          <ShieldAlert className="w-3 h-3 text-red-600" />
          High Priority
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Medium Priority
        </span>
      );
    case "Low":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Info className="w-3 h-3 text-blue-600" />
          Low Priority
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {priority || "Normal"}
        </span>
      );
  }
}
