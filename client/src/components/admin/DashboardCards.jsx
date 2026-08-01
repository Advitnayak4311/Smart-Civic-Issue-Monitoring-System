import { FileText, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DashboardCards({ complaints }) {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const completed = complaints.filter((c) => c.status === "Completed").length;
  const highPriority = complaints.filter((c) => c.priority === "High").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
      {/* Total Complaints */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Active Grievances</p>
          <h2 className="text-3xl font-extrabold text-slate-900">{total}</h2>
          <p className="text-[11px] text-slate-400">All registered issues</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold border border-blue-200">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Officer Review</p>
          <h2 className="text-3xl font-extrabold text-amber-900">{pending}</h2>
          <p className="text-[11px] text-amber-600 font-medium">Awaiting acceptance</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Remediated / Verified</p>
          <h2 className="text-3xl font-extrabold text-emerald-900">{completed}</h2>
          <p className="text-[11px] text-emerald-600 font-medium">Citizen verification sent</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* High Priority */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-red-700">High SLA Priority</p>
          <h2 className="text-3xl font-extrabold text-red-900">{highPriority}</h2>
          <p className="text-[11px] text-red-600 font-medium">Immediate response needed</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold border border-red-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}