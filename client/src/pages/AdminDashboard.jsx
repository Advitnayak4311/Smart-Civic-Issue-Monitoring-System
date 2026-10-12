import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Trash2,
  Compass,
  Droplets,
  Zap,
  Waves,
  HeartPulse,
  HardHat,
  Car,
  TreePine,
  Dog,
  RefreshCw,
  UserCheck,
  ChevronDown
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DashboardCards from "../components/admin/DashboardCards";
import AnalyticsCharts from "../components/admin/AnalyticsCharts";
import SearchFilterBar from "../components/admin/SearchFilterBar";
import ComplaintTable from "../components/admin/ComplaintTable";
import ComplaintModal from "../components/admin/ComplaintModal";
import DepartmentPerformanceGrid from "../components/admin/DepartmentPerformanceGrid";
import { DEPARTMENT_PROFILES } from "./AdminLoginPage";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Authentication Context
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const storedDepartment = localStorage.getItem("userDepartment");
  const storedOfficerName = localStorage.getItem("officerName");
  const storedOfficerDesignation = localStorage.getItem("officerDesignation");
  const storedOfficerEmail = localStorage.getItem("officerEmail");

  const isAuthorizedOfficer =
    Boolean(token) &&
    token !== "null" &&
    token !== "undefined" &&
    (userRole === "officer" || userRole === "admin" || userRole === "superadmin");

  // Determine Active Department: from URL param ?dept=... or localStorage, defaulting to "Roads & Highway Dept"
  const urlDept = searchParams.get("dept");
  const activeDepartment =
    urlDept || storedDepartment || "Roads & Highway Dept";

  // Data States
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState(activeDepartment);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Sync departmentFilter when activeDepartment changes
  useEffect(() => {
    setDepartmentFilter(activeDepartment);
  }, [activeDepartment]);

  useEffect(() => {
    if (isAuthorizedOfficer) {
      fetchComplaints(activeDepartment);
    }
  }, [isAuthorizedOfficer, activeDepartment]);

  const fetchComplaints = (deptToFetch = activeDepartment) => {
    setLoading(true);
    const queryUrl =
      deptToFetch && deptToFetch !== "All"
        ? `http://localhost:8000/api/admin/complaints?department=${encodeURIComponent(deptToFetch)}`
        : `http://localhost:8000/api/admin/complaints`;

    fetch(queryUrl)
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data.data || []);
        if (typeof data.resolvedCount === "number") {
          setResolvedCount(data.resolvedCount);
        }
      })
      .catch((err) => console.error("Fetch Complaints Error:", err))
      .finally(() => setLoading(false));
  };

  const handleClearAllComplaints = async () => {
    if (
      !window.confirm(
        `Are you sure you want to purge all active and closed grievance records for ${activeDepartment}? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/admin/clear-all", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "Grievance records purged successfully.");
        fetchComplaints(activeDepartment);
      } else {
        alert(data.message || "Failed to purge complaint records.");
      }
    } catch (err) {
      console.error(err);
      alert("Error purging complaint records.");
    }
  };

  const handleUpdate = async (customPayload = null) => {
    if (!selectedComplaint) return;

    try {
      const payload = customPayload || { status };
      const res = await fetch(
        `http://localhost:8000/api/admin/complaints/${selectedComplaint._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        fetchComplaints(activeDepartment);

        if (customPayload?.department || customPayload?.notifyAuthority) {
          setSelectedComplaint(data.data);
          alert(
            `Grievance successfully transferred/dispatched to ${data.data.department} ✅`
          );
        } else {
          alert("Complaint Status Updated & Notification Dispatched Successfully ✅");
          setSelectedComplaint(null);
        }
        return { success: true, data: data.data };
      } else {
        alert(data.message || "Update Failed");
        return { success: false };
      }
    } catch (err) {
      console.error(err);
      alert("Update Failed");
      return { success: false };
    }
  };

  const handleExportCSV = () => {
    if (!complaints.length) {
      alert("No grievance records available in this department to export.");
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
      "Created At",
    ];

    const rows = complaints.map((c) => [
      `"${c.complaintId || ""}"`,
      `"${c.citizenName || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${c.category || ""}"`,
      `"${c.issue || ""}"`,
      `"${c.department || ""}"`,
      `"${c.priority || ""}"`,
      `"${c.status || ""}"`,
      `"${(c.address || c.location?.address || "").replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleString("en-IN")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedDeptName = activeDepartment.replace(/[^a-zA-Z0-9]/g, "_");
    link.setAttribute(
      "download",
      `${sanitizedDeptName}_Grievance_Report_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Resolve Active Department Profile (Icon, Colors, Details)
  const currentDeptProfile = useMemo(() => {
    return (
      DEPARTMENT_PROFILES.find((d) => d.name === activeDepartment) || {
        name: activeDepartment,
        shortName: activeDepartment,
        icon: Building2,
        color: "from-slate-900 to-indigo-950",
        badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
        email: storedOfficerEmail || "officer@municipal.gov.in",
        officer: storedOfficerName || "Executive Nodal Officer",
        designation: storedOfficerDesignation || "Division Chief",
        description: "Municipal Administration and Citizen Grievance Redressal",
      }
    );
  }, [activeDepartment, storedOfficerName, storedOfficerDesignation, storedOfficerEmail]);

  const DeptIcon = currentDeptProfile.icon || Building2;

  // Department-scoped Complaints Data
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  const highPriorityComplaints = safeComplaints.filter(
    (complaint) =>
      complaint &&
      complaint.priority === "High" &&
      complaint.status !== "Closed"
  );

  const pendingComplaintsCount = safeComplaints.filter((c) => c?.status === "Pending").length;
  const inProgressComplaintsCount = safeComplaints.filter(
    (c) => c?.status === "In Progress" || c?.status === "Accepted"
  ).length;
  const closedComplaintsCount = safeComplaints.filter(
    (c) => c?.status === "Closed" || c?.status === "Completed" || c?.citizenVerified === "Yes"
  ).length;

  const chartData = [
    { name: "Pending", value: pendingComplaintsCount, fill: "#d97706" },
    { name: "Accepted", value: safeComplaints.filter((c) => c?.status === "Accepted").length, fill: "#2563eb" },
    { name: "In Progress", value: inProgressComplaintsCount, fill: "#6366f1" },
    { name: "Completed", value: safeComplaints.filter((c) => c?.status === "Completed").length, fill: "#059669" },
    { name: "Closed", value: closedComplaintsCount, fill: "#10b981" },
    { name: "Reopened", value: safeComplaints.filter((c) => c?.status === "Reopened").length, fill: "#dc2626" },
  ];

  const COLORS = ["#d97706", "#2563eb", "#6366f1", "#059669", "#10b981", "#dc2626"];

  const priorityData = [
    { name: "High Priority", value: safeComplaints.filter((c) => c?.priority === "High").length, fill: "#dc2626" },
    { name: "Medium Priority", value: safeComplaints.filter((c) => c?.priority === "Medium").length, fill: "#d97706" },
    { name: "Low Priority", value: safeComplaints.filter((c) => c?.priority === "Low").length, fill: "#059669" },
  ];

  const monthlyData = [
    { month: "Jan", count: 0 },
    { month: "Feb", count: 0 },
    { month: "Mar", count: 0 },
    { month: "Apr", count: 0 },
    { month: "May", count: 0 },
    { month: "Jun", count: 0 },
    { month: "Jul", count: 0 },
    { month: "Aug", count: 0 },
    { month: "Sep", count: 0 },
    { month: "Oct", count: safeComplaints.length },
    { month: "Nov", count: 0 },
    { month: "Dec", count: 0 },
  ];

  const departmentCounts = [
    { name: activeDepartment, count: safeComplaints.length }
  ];

  // Strictly enforce Officer authentication: block unauthenticated guests
  if (!isAuthorizedOfficer) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <div>
          <Navbar />
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                Access Denied: Department Officer Login Required
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Municipal Department Officer Dashboard is strictly restricted to authenticated Nodal Officers. Please log in with your assigned department credentials.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/admin-login")}
                className="py-3 px-6 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 border border-blue-950 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" /> Department Portal Sign In
              </button>
              <button
                onClick={() => navigate("/")}
                className="py-3 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition shadow-2xs cursor-pointer"
              >
                Return to Public Portal
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100">
      <div>
        <Navbar />

        {/* Dynamic Department Command Header Banner */}
        <div className={`bg-gradient-to-r ${currentDeptProfile.color} text-white py-8 border-b border-black/20 shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Top Bar: Department Identity & Quick Switcher */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                  <DeptIcon className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-0.5 rounded border border-white/15">
                      DEPARTMENT PORTAL
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Dispatch Active
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                    {activeDepartment}
                  </h1>

                  <p className="text-white/80 text-xs mt-0.5 max-w-xl">
                    Dedicated Nodal Officer Portal • Showing grievances, SLA dispatches and field remediation allocated to this division.
                  </p>
                </div>
              </div>

              {/* Designated Municipal Jurisdiction Badge */}
              <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/70 block font-bold">Assigned Jurisdiction</span>
                  <span className="text-xs font-black text-white">{currentDeptProfile.shortName} Authority</span>
                </div>
              </div>
            </div>

            {/* Officer Profile & Municipal Jurisdiction Bar */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/70 uppercase block font-semibold">Nodal Officer</span>
                    <span className="font-extrabold text-white">{currentDeptProfile.officer}</span>
                  </div>
                </div>

                <div className="border-l border-white/20 pl-4 sm:pl-6">
                  <span className="text-[10px] text-white/70 uppercase block font-semibold">Designation</span>
                  <span className="font-bold text-white">{currentDeptProfile.designation}</span>
                </div>

                <div className="border-l border-white/20 pl-4 sm:pl-6 hidden md:block">
                  <span className="text-[10px] text-white/70 uppercase block font-semibold">Official Email</span>
                  <span className="font-semibold text-white/90">{currentDeptProfile.email}</span>
                </div>

                <div className="border-l border-white/20 pl-4 sm:pl-6 hidden lg:block">
                  <span className="text-[10px] text-white/70 uppercase block font-semibold">Jurisdiction</span>
                  <span className="font-semibold text-white/90">Wards 1–24 • Central Division</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fetchComplaints(activeDepartment)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 transition cursor-pointer"
                  title="Refresh departmental grievance feed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900 px-3 py-2 rounded-xl border border-emerald-500/40 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" /> Export CSV
                </button>

                <button
                  onClick={() => navigate("/ai-command")}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300 bg-black/40 hover:bg-black/60 px-3.5 py-2 rounded-xl border border-amber-500/40 transition cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> AI Assistant
                </button>

                <button
                  onClick={() => navigate("/service-config")}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/20 transition cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-300" /> SLA Rules
                </button>

                <button
                  onClick={handleClearAllComplaints}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-200 bg-red-950/70 hover:bg-red-900 px-3 py-2 rounded-xl border border-red-500/40 transition cursor-pointer"
                  title="Clear dummy testing data"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-300" /> Purge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Executive KPI Summary for this Department */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Department Performance Metrics & Live Dispatch State
              </h3>
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                Assigned: {safeComplaints.length} Total Grievances
              </span>
            </div>
            <DashboardCards complaints={complaints} resolvedCount={resolvedCount} />
          </div>

          {/* Urgent Action Required Panel (Scoped strictly to this department) */}
          <div className="bg-red-50/90 rounded-2xl border border-red-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-red-200/80 pb-3">
              <div className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  High-Priority Escalations in {activeDepartment}
                </h3>
              </div>
              <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-2xs animate-pulse">
                {highPriorityComplaints.length} Urgent Action Required
              </span>
            </div>

            {highPriorityComplaints.length === 0 ? (
              <p className="text-xs text-red-800 bg-white/80 p-4 rounded-xl border border-red-100 font-medium">
                No active high-priority escalations currently pending review in {activeDepartment}. All SLA benchmarks within compliance window.
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
                    className="bg-white p-4 rounded-xl border-l-4 border-l-red-600 border-y border-r border-slate-200 text-left shadow-2xs hover:shadow-md transition space-y-2 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-extrabold text-blue-900">
                        {complaint.complaintId}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        High Priority
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs group-hover:text-red-700 transition truncate">
                      {complaint.issue}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Citizen: {complaint.citizenName} &bull; Ward: {complaint.ward || "Ward 12"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Department Analytics Charts */}
          <AnalyticsCharts
            chartData={chartData}
            COLORS={COLORS}
            monthlyData={monthlyData}
            priorityData={priorityData}
            departmentData={departmentCounts}
          />

          {/* Department Performance Matrix */}
          <DepartmentPerformanceGrid />

          {/* Main Department Issues Registry Table & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-900" />
                  <span>{activeDepartment} Issues Registry</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live log of citizen grievance tickets dispatched to {activeDepartment} for field resolution.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing {safeComplaints.length} records
                </span>
              </div>
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
              departmentFilter={activeDepartment === "All" ? "All" : activeDepartment}
              setSelectedComplaint={setSelectedComplaint}
              setStatus={setStatus}
            />
          </div>
        </div>

        {/* Complaint Detail & Inter-Department Transfer Modal */}
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