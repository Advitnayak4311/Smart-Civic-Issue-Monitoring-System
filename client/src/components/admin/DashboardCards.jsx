export default function DashboardCards({ complaints }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <p className="text-gray-500">Total Complaints</p>
        <h2 className="text-4xl font-bold mt-3">
          {complaints.length}
        </h2>
      </div>

      <div className="bg-yellow-50 rounded-3xl shadow-lg p-6">
        <p className="text-yellow-700">Pending</p>
        <h2 className="text-4xl font-bold mt-3">
          {complaints.filter(c => c.status === "Pending").length}
        </h2>
      </div>

      <div className="bg-green-50 rounded-3xl shadow-lg p-6">
        <p className="text-green-700">Completed</p>
        <h2 className="text-4xl font-bold mt-3">
          {complaints.filter(c => c.status === "Completed").length}
        </h2>
      </div>

      <div className="bg-red-50 rounded-3xl shadow-lg p-6">
        <p className="text-red-700">High Priority</p>
        <h2 className="text-4xl font-bold mt-3">
          {complaints.filter(c => c.priority === "High").length}
        </h2>
      </div>

    </div>
  );
}