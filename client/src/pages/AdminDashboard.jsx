import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Archive,
  Settings,
  AlertTriangle,
  FileText,
  Filter,
  CheckCircle2,
  Download,
  ShieldAlert,
  Lock,
  Bot,
  Trash2
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DashboardCards from "../components/admin/DashboardCards";
import AnalyticsCharts from "../components/admin/AnalyticsCharts";
import SearchFilterBar from "../components/admin/SearchFilterBar";
import ComplaintTable from "../components/admin/ComplaintTable";
import ComplaintModal from "../components/admin/ComplaintModal";
import DepartmentPerformanceGrid from "../components/admin/DepartmentPerformanceGrid";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const [isEscalating, setIsEscalating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleTriggerEscalations = async () => {
    try {
      setIsEscalating(true);
      const res = await fetch("http://localhost:8000/api/admin/escalations/trigger", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Escalation Engine evaluated active tickets.");
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
      alert("Error triggering escalation engine.");
    } finally {
      setIsEscalating(false);
    }
  };

  const handleClearAllComplaints = async () => {
    if (!window.confirm("Are you sure you want to purge all active and closed grievance records? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/admin/clear-all", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "All grievance records purged successfully.");
        fetchComplaints();
      } else {
        alert(data.message || "Failed to purge complaint records.");
      }
    } catch (err) {
      console.error(err);
      alert("Error purging complaint records.");
    }
  };

  const fetchComplaints = () => {
    fetch("http://localhost:8000/api/admin/complaints")
      .then((res) => res.json())
      .then((data) => setComplaints(data.data || []))
      .catch((err) => console.log(err));
  };

  // If user is explicitly logged in as a citizen, display clean Access Denied banner with Officer Login link
  if (userRole === "citizen") {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <div>
          <Navbar />
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Access Denied: Officer Login Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You must sign in as an authorized Municipal Officer or Administrator to access officer grievance records.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin-login")}
              className="py-3 px-6 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 mx-auto"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Sign In at Officer Portal
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleUpdate = async () => {
    if (!selectedComplaint) return;

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
        alert("Complaint Status Updated & Email Notification Dispatched Successfully ✅");

        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint._id === data.data._id ? data.data : complaint
          )
        );

        setSelectedComplaint(null);
      } else {
        alert(data.message || "Update Failed");
      }
    } catch (err) {
      console.log(err);
      alert("Update Failed");
    }
  };

  const handleExportCSV = () => {
    if (!complaints.length) {
      alert("No complaint records available to export.");
      return;
    }

    const headers = [
      "Complaint ID",
      "Citizen Name",
      "Phone",
      "Email",
      "Category",
      "Issue",
      "Department",
      "Priority",
      "Status",
      "Address",
      "Created At"
    ];

    const rows = complaints.map((c) => [
      `"${c.complaintId || ''}"`,
      `"${c.citizenName || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.category || ''}"`,
      `"${c.issue || ''}"`,
      `"${c.department || ''}"`,
      `"${c.priority || ''}"`,
      `"${c.status || ''}"`,
      `"${(c.address || c.location?.address || '').replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleString('en-IN')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Municipal_Complaints_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  const chartData = [
    {
      name: "Pending",
      value: safeComplaints.filter((c) => c?.status === "Pending").length,
    },
    {
      name: "Accepted",
      value: safeComplaints.filter((c) => c?.status === "Accepted").length,
    },
    {
      name: "In Progress",
      value: safeComplaints.filter((c) => c?.status === "In Progress").length,
    },
    {
      name: "Completed",
      value: safeComplaints.filter((c) => c?.status === "Completed").length,
    },
  ];

  const COLORS = ["#d97706", "#2563eb", "#6366f1", "#059669"];

  const monthlyData = [
    {
      month: "Current Period",
      complaints: safeComplaints.length,
    },
  ];

  const departments = [
    ...new Set(
      safeComplaints
        .map((complaint) => complaint?.department)
        .filter(Boolean)
    ),
  ];

  const departmentCounts = departments.map((department) => ({
    name: department,
    count: safeComplaints.filter((c) => c?.department === department).length,
  }));

  const highPriorityComplaints = safeComplaints.filter(
    (complaint) =>
      complaint &&
      complaint.priority === "High" &&
      complaint.status !== "Closed"
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Executive Header */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Executive Command & Control Interface</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Municipal Officer Dashboard
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Monitor SLA compliance, review field complaints, and manage department resolution dispatch.
              </p>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate("/ai-command")}
                className="flex items-center gap-2 text-xs font-black text-amber-300 bg-slate-800 hover:bg-slate-950 px-4 py-2.5 rounded-xl border border-amber-500/50 shadow-sm transition"
              >
                <Bot className="w-4 h-4 text-amber-400 animate-pulse" /> AI Command Center
              </button>

              <button
                onClick={handleTriggerEscalations}
                disabled={isEscalating}
                className="flex items-center gap-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-2.5 rounded-xl transition shadow-sm border border-amber-500"
              >
                <AlertTriangle className="w-4 h-4 text-amber-200" />
                {isEscalating ? "Escalating..." : "Run Auto-Escalation Engine"}
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" /> Export CSV
              </button>

              <button
                onClick={handleClearAllComplaints}
                className="flex items-center gap-2 text-xs font-bold text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 px-3.5 py-2.5 rounded-xl border border-red-800/80 transition shadow-sm"
                title="Purge all dummy & test grievance records"
              >
                <Trash2 className="w-4 h-4 text-red-400" /> Purge All Data
              </button>

              <button
                onClick={() => navigate("/closed-complaints")}
                className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-700 transition"
              >
                <Archive className="w-4 h-4 text-slate-400" /> Closed Archives
              </button>

              <button
                onClick={() => navigate("/service-config")}
                className="flex items-center gap-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 px-4 py-2.5 rounded-xl border border-blue-800 transition shadow-sm"
              >
                <Settings className="w-4 h-4 text-amber-300" /> Service Rules
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Executive KPI Summary */}
          <DashboardCards complaints={complaints} />

          {/* Phase 2: Department Performance Index */}
          <DepartmentPerformanceGrid />

          {/* Recharts Analytics */}
          <AnalyticsCharts
            chartData={chartData}
            COLORS={COLORS}
            monthlyData={monthlyData}
          />

          {/* Urgent Action Required Panel */}
          <div className="bg-red-50/90 rounded-2xl border border-red-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-red-200/80 pb-3">
              <div className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm sm:text-base">High-Priority Grievance Escalations</h3>
              </div>
              <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-2xs animate-pulse">
                {highPriorityComplaints.length} Urgent Action Required
              </span>
            </div>

            {highPriorityComplaints.length === 0 ? (
              <p className="text-xs text-red-800 bg-white/80 p-4 rounded-xl border border-red-100 font-medium">
                No active high-priority escalations currently pending review.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highPriorityComplaints.map((complaint) => (
                  <button
                    key={complaint._id}
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setStatus(complaint.status);
                    }}
                    className="bg-white p-4 rounded-xl border-l-4 border-l-red-600 border-y border-r border-slate-200 text-left shadow-2xs hover:shadow-md transition space-y-2 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-extrabold text-blue-900">{complaint.complaintId}</span>
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">High</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs group-hover:text-red-700 transition truncate">{complaint.issue}</p>
                    <p className="text-[11px] text-slate-500">Citizen: {complaint.citizenName} &bull; {complaint.department}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Department Breakdown Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900" /> Department Breakdown Filter
              </h3>

              {departmentFilter !== "All" && (
                <button
                  onClick={() => setDepartmentFilter("All")}
                  className="text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                >
                  Show All Departments
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {departmentCounts.map((dept) => (
                <button
                  key={dept.name}
                  onClick={() => setDepartmentFilter(dept.name)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    departmentFilter === dept.name
                      ? "bg-blue-900 text-white border-blue-950 shadow-md"
                      : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase truncate block opacity-80">{dept.name}</span>
                  <p className="text-xl font-black mt-1">{dept.count}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Table & Filters */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900">
                {departmentFilter === "All" ? "Active Grievances Registry" : `${departmentFilter} Registry`}
              </h3>
            </div>

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
        </div>

        <ComplaintModal
          selectedComplaint={selectedComplaint}
          setSelectedComplaint={setSelectedComplaint}
          status={status}
          setStatus={setStatus}
          handleUpdate={handleUpdate}
        />
      </div>

      <Footer />
    </div>
  );
}