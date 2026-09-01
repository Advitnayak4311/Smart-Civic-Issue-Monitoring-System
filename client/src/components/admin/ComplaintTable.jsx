import StatusBadge from "../UI/StatusBadge";
import PriorityBadge from "../UI/PriorityBadge";
import SLATimerBadge from "./SLATimerBadge";
import { Eye, FileSpreadsheet, Building2, User, Calendar, Star, MessageSquare } from "lucide-react";

export default function ComplaintTable({
  complaints,
  search,
  statusFilter,
  categoryFilter,
  departmentFilter,
  setSelectedComplaint,
  setStatus,
}) {
  const filteredComplaints = (complaints || []).filter((item) => {
    if (!item) return false;
    const value = (search || "").toLowerCase();

    const matchesSearch =
      (item.complaintId || "").toLowerCase().includes(value) ||
      (item.citizenName || "").toLowerCase().includes(value) ||
      (item.phone || "").toLowerCase().includes(value);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesDepartment =
      departmentFilter === "All" ||
      item.department === departmentFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesDepartment
    );
  });

  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (a.status === "Reopened" && b.status !== "Reopened") return -1;
    if (a.status !== "Reopened" && b.status === "Reopened") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Grievance Ref ID</th>
              <th className="py-3.5 px-4">Citizen Name</th>
              <th className="py-3.5 px-4">Category & Issue</th>
              <th className="py-3.5 px-4">SLA Countdown</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">SLA Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-700">
            {sortedComplaints.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500 font-medium">
                  <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No grievances found matching the selected search or filter criteria.
                </td>
              </tr>
            ) : (
              sortedComplaints.map((item) => {
                const confScore = item.confidenceScore ?? 75;
                const confLevel = item.confidenceLevel || (confScore >= 80 ? "High" : confScore >= 50 ? "Medium" : "Low");
                const hasCitizenComment = Boolean(item.citizenComment || item.feedbackComments);

                return (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-50 transition ${
                      item.status === "Reopened" ? "bg-red-50/60 font-medium" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-extrabold text-blue-900">
                      <div>{item.complaintId}</div>
                      {item.status === "Reopened" && (
                        <span className="inline-block mt-1 text-[9px] font-black uppercase text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300 animate-pulse">
                          🔴 Reopened: Work Incomplete
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.citizenName}</div>
                      <div className="text-[10px] text-slate-500">{item.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.category}</div>
                      <div className="text-[10px] text-slate-500">{item.issue}</div>
                    </td>

                    {/* SLA Timer Countdown */}
                    <td className="py-3.5 px-4">
                      <SLATimerBadge
                        createdAt={item.createdAt}
                        category={item.category}
                        issue={item.issue}
                        slaLimitHours={item.slaLimitHours}
                      />
                    </td>

                    {/* Confidence Score Indicator */}
                    <td className="py-3.5 px-4 space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          confLevel === "High"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : confLevel === "Medium"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : "bg-red-50 text-red-700 border-red-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            confLevel === "High"
                              ? "bg-emerald-500"
                              : confLevel === "Medium"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        Confidence {confScore}%
                      </span>
                      {hasCitizenComment && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>Feedback Available</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.department || "General Department"}
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setStatus(item.status);
                        }}
                        className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 font-medium">
        <span>Showing {filteredComplaints.length} active grievance records</span>
        <span>Standard Municipal Data Grid View</span>
      </div>
    </div>
  );
}