import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCards from "../components/admin/DashboardCards";
import AnalyticsCharts from "../components/admin/AnalyticsCharts";
import SearchFilterBar from "../components/admin/SearchFilterBar";
import ComplaintTable from "../components/admin/ComplaintTable";
import ComplaintModal from "../components/admin/ComplaintModal";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/complaints")
      .then((res) => res.json())
      .then((data) => setComplaints(data.data))
      .catch((err) => console.log(err));
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/complaints/${selectedComplaint._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Complaint Updated Successfully ✅");

        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint._id === data.data._id ? data.data : complaint
          )
        );

        setSelectedComplaint(null);
      }
    } catch (err) {
      console.log(err);
      alert("Update Failed");
    }
  };

  const chartData = [
    {
      name: "Pending",
      value: complaints.filter((c) => c.status === "Pending").length,
    },
    {
      name: "Accepted",
      value: complaints.filter((c) => c.status === "Accepted").length,
    },
    {
      name: "In Progress",
      value: complaints.filter((c) => c.status === "In Progress").length,
    },
    {
      name: "Completed",
      value: complaints.filter((c) => c.status === "Completed").length,
    },
  ];

  const COLORS = ["#FACC15", "#8B5CF6", "#3B82F6", "#22C55E"];

  const monthlyData = [
    {
      month: "Jul",
      complaints: complaints.length,
    },
  ];

  const departments = [
  ...new Set(
    complaints
      .map((complaint) => complaint.department)
      .filter(Boolean)
  ),
];

  const departmentCounts = departments.map((department) => ({
    name: department,
    count: complaints.filter((c) => c.department === department).length,
  }));

  const highPriorityComplaints = complaints.filter(
    (complaint) =>
      complaint.priority === "High" &&
      complaint.status !== "Closed"
  );

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold text-slate-800">
        🏛 Smart Civic Admin Dashboard
      </h1>

      <p className="mt-2 text-slate-500">
        Manage complaints submitted by citizens.
      </p>


      <div className="mt-6 flex gap-4">
  <button
    onClick={() => navigate("/closed-complaints")}
    className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-900"
  >
    📁 Closed Complaints
  </button>

  <button
    onClick={() => navigate("/service-config")}
    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
  >
    ⚙️ Service Configuration
  </button>
</div>

      <DashboardCards complaints={complaints} />

      <AnalyticsCharts
        chartData={chartData}
        COLORS={COLORS}
        monthlyData={monthlyData}
      />

      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-red-700">
              🚨 Urgent Action Required
            </h2>

            <p className="mt-1 text-sm text-red-600">
              High-priority complaints requiring immediate attention.
            </p>
          </div>

          <span className="animate-pulse rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
            {highPriorityComplaints.length} Urgent
          </span>
        </div>

        {highPriorityComplaints.length === 0 ? (
          <p className="mt-5 rounded-xl bg-white p-4 text-slate-500">
            No high-priority complaints at the moment.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {highPriorityComplaints.map((complaint) => (
              <button
                key={complaint._id}
                onClick={() => setDepartmentFilter(complaint.department)}
                className="rounded-xl border-l-4 border-red-600 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">
                      ⚠️ {complaint.issue}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {complaint.complaintId} · {complaint.department}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Citizen: {complaint.citizenName}
                    </p>
                  </div>

                  <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                    HIGH
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">🏢 Department Overview</h2>

          {departmentFilter !== "All" && (
            <button
              onClick={() => setDepartmentFilter("All")}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Show All Departments
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {departmentCounts.map((department) => (
            <button
              key={department.name}
              onClick={() => setDepartmentFilter(department.name)}
              className={`rounded-xl p-5 text-left shadow-md transition ${
                departmentFilter === department.name
                  ? "bg-blue-600 text-white ring-4 ring-blue-200"
                  : "bg-white hover:shadow-lg"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  departmentFilter === department.name
                    ? "text-white"
                    : "text-slate-700"
                }`}
              >
                {department.name}
              </h3>

              <p
                className={`mt-2 text-3xl font-bold ${
                  departmentFilter === department.name
                    ? "text-white"
                    : "text-blue-600"
                }`}
              >
                {department.count}
              </p>

              <p
                className={`text-sm ${
                  departmentFilter === department.name
                    ? "text-blue-100"
                    : "text-slate-500"
                }`}
              >
                Click to view complaints
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-800">
          {departmentFilter === "All"
            ? "📋 All Complaints"
            : `📋 ${departmentFilter}`}
        </h2>

        <SearchFilterBar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
        />

        <ComplaintTable
          complaints={complaints}
          search={search}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          departmentFilter={departmentFilter}
          setSelectedComplaint={setSelectedComplaint}
          setStatus={setStatus}
        />
      </div>

      <ComplaintModal
        selectedComplaint={selectedComplaint}
        setSelectedComplaint={setSelectedComplaint}
        status={status}
        setStatus={setStatus}
        handleUpdate={handleUpdate}
      />
    </div>
  );
}