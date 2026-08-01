import StatusBadge from "../UI/StatusBadge";
import PriorityBadge from "../UI/PriorityBadge";
import { Eye, FileSpreadsheet, Building2, User, Calendar } from "lucide-react";

export default function ComplaintTable({
  complaints,
  search,
  statusFilter,
  categoryFilter,
  departmentFilter,
  setSelectedComplaint,
  setStatus,
}) {
  const filteredComplaints = complaints.filter((item) => {
    const value = search.toLowerCase();

    const matchesSearch =
      item.complaintId.toLowerCase().includes(value) ||
      item.citizenName.toLowerCase().includes(value) ||
      item.phone.toLowerCase().includes(value);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Grievance Ref ID</th>
              <th className="py-3.5 px-4">Citizen Name</th>
              <th className="py-3.5 px-4">Category & Issue</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">SLA Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500 font-medium">
                  <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No grievances found matching the selected search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="py-3.5 px-4 font-extrabold text-blue-900">
                    {item.complaintId}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.citizenName}</div>
                    <div className="text-[10px] text-slate-500">{item.phone}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{item.category}</div>
                    <div className="text-[10px] text-slate-500">{item.issue}</div>
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
                      className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </td>
                </tr>
              ))
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