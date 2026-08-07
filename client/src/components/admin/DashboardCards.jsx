import { FileText, Clock, CheckCircle2, ShieldAlert, Zap, ShieldCheck } from "lucide-react";

export default function DashboardCards({ complaints }) {
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const total = safeComplaints.length;
  const pending = safeComplaints.filter((c) => c?.status === "Pending").length;
  const completed = safeComplaints.filter((c) => c?.status === "Completed").length;
  const highPriority = safeComplaints.filter((c) => c?.priority === "High").length;
  
  // Phase 1 Intelligence Metrics
  const criticalImpact = safeComplaints.filter((c) => (c?.impactScore ?? 0) >= 151 || c?.impactLevel === "Critical").length;
  const avgConfidence = total > 0
    ? Math.round(safeComplaints.reduce((sum, c) => sum + (c?.confidenceScore ?? 75), 0) / total)
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      {/* Total Complaints */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Grievances</p>
          <h2 className="text-2xl font-extrabold text-slate-900">{total}</h2>
          <p className="text-[10px] text-slate-400">All active tickets</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</p>
          <h2 className="text-2xl font-extrabold text-amber-900">{pending}</h2>
          <p className="text-[10px] text-amber-600 font-medium">Awaiting action</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Critical Impact Complaints */}
      <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-purple-50/30">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Critical Impact</p>
          <h2 className="text-2xl font-extrabold text-purple-900">{criticalImpact}</h2>
          <p className="text-[10px] text-purple-600 font-medium">High public importance</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold border border-purple-300">
          <Zap className="w-5 h-5" />
        </div>
      </div>

      {/* High Priority */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">High SLA Priority</p>
          <h2 className="text-2xl font-extrabold text-red-900">{highPriority}</h2>
          <p className="text-[10px] text-red-600 font-medium">Urgent response needed</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold border border-red-200">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>

      {/* Average Confidence Rating */}
      <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Avg Confidence</p>
          <h2 className="text-2xl font-extrabold text-emerald-900">{avgConfidence}%</h2>
          <p className="text-[10px] text-emerald-600 font-medium">Authenticity rating</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold border border-emerald-300">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}