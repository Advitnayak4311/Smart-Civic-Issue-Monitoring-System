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
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <table className="w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-4 text-left">Complaint ID</th>
            <th className="p-4 text-left">Citizen</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Priority</th>
            <th className="p-4 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredComplaints.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-slate-500">
                No complaints match the selected filters.
              </td>
            </tr>
          ) : (
            filteredComplaints.map((item) => (
              <tr
                key={item._id}
                className="border-b transition hover:bg-blue-50"
              >
                <td className="p-4 font-semibold text-blue-700">
                  {item.complaintId}
                </td>

                <td className="p-4">{item.citizenName}</td>

                <td className="p-4">{item.category}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "In Progress"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "Accepted"
                        ? "bg-purple-100 text-purple-700"
                        : item.status === "Closed"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      item.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "Medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority}
                  </span>
                </td>

                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedComplaint(item);
                      setStatus(item.status);
                    }}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}