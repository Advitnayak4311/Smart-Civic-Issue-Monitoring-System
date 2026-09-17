import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Users,
  LayoutDashboard,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  UserPlus,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  Award,
  Crown
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/UI/StatusBadge";
import PriorityBadge from "../components/UI/PriorityBadge";
import ComplaintModal from "../components/admin/ComplaintModal";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, complaints, rules

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Data States
  const [complaints, setComplaints] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // User Accounts Management (Citizens + Officers)
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "officer", department: "Roads & Infrastructure", phone: "" });
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, servRes] = await Promise.all([
        fetch("http://localhost:8000/api/admin/complaints"),
        fetch("http://localhost:8000/api/service-config")
      ]);

      const compData = await compRes.json();
      const servData = await servRes.json();

      if (compData.success) {
        setComplaints(compData.complaints || compData.data || []);
      }
      if (servData.success) {
        setServices(servData.services || []);
      }
    } catch (err) {
      console.error("SuperAdmin Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!token || userRole !== "superadmin") {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <div>
          <Navbar />
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
              <Crown className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Access Denied: SuperAdmin Privileges Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Municipal Officers and Citizens do not have permission to access the SuperAdmin Master Governance Portal. Only Chief Commissioners with master credentials can open this view.
              </p>
            </div>
            <button
              onClick={() => navigate("/superadmin-login")}
              className="py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 mx-auto border border-amber-400"
            >
              <Crown className="w-4 h-4" /> Sign In at SuperAdmin Gateway
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleUpdateRole = (userId, newRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert(`User role updated to ${newRole.toUpperCase()} successfully.`);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const created = {
      id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      phone: newUser.phone || "9876543210",
      status: "Active",
      joined: new Date().toISOString().split("T")[0]
    };
    setUsers(prev => [created, ...prev]);
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", role: "officer", department: "Roads & Infrastructure", phone: "" });
    alert("New Municipal Officer Account created successfully!");
  };

  // Metrics Calculations
  const totalComplaints = complaints.length;
  const closedComplaints = complaints.filter(c => c.status === "Closed" || c.status === "Resolved").length;
  const pendingComplaints = complaints.filter(c => c.status === "Pending").length;
  const inProgressComplaints = complaints.filter(c => c.status === "In Progress" || c.status === "Accepted").length;
  const resolutionRate = totalComplaints ? ((closedComplaints / totalComplaints) * 100).toFixed(1) : 100.0;
  const totalOfficers = users.filter(u => u.role === "officer" || u.role === "admin").length;
  const totalCitizens = users.filter(u => u.role === "citizen").length;

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.complaintId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issue?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === "ALL" || c.department === filterDepartment;
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100">
      <div>
        <Navbar />

        {/* SuperAdmin Executive Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white py-8 border-b border-slate-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Executive Governance & System Master Control</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                  SuperAdmin Master Portal
                </h1>
                <p className="text-slate-300 text-xs mt-1">
                  System-wide oversight for Chief Municipal Commissioners to manage officers, citizens, SLA rules & grievances.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh System
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Exit Master View
                </Link>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Executive Dashboard
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                  activeTab === "users"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" /> Officer & Citizen Management ({users.length})
              </button>

              <button
                onClick={() => setActiveTab("complaints")}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                  activeTab === "complaints"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> Master Grievance Audit ({complaints.length})
              </button>

              <Link
                to="/service-config"
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Service & SLA Rules
              </Link>
            </div>
          </div>
        </div>

        {/* Tab 1: Executive Dashboard */}
        {activeTab === "overview" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Total Grievances</span>
                <p className="text-3xl font-black text-slate-900">{totalComplaints}</p>
                <span className="text-[11px] text-blue-700 font-semibold">Across 11 Municipal Categories</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">System Resolution Rate</span>
                <p className="text-3xl font-black text-emerald-600">{resolutionRate}%</p>
                <span className="text-[11px] text-emerald-700 font-semibold">{closedComplaints} Resolved & Verified</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Active Municipal Officers</span>
                <p className="text-3xl font-black text-indigo-900">{totalOfficers}</p>
                <span className="text-[11px] text-indigo-700 font-semibold">Field Staff & Department Leads</span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Registered Citizens</span>
                <p className="text-3xl font-black text-purple-900">{totalCitizens}</p>
                <span className="text-[11px] text-purple-700 font-semibold">Active Citizen Reporters</span>
              </div>
            </div>

            {/* Quick Status Breakdown Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-amber-900 uppercase">Pending Intake</span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-3xl font-black text-amber-950">{pendingComplaints}</p>
                <p className="text-xs text-amber-800">Complaints awaiting officer assignment or triage.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-blue-900 uppercase">In Progress / Field Repair</span>
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-black text-blue-950">{inProgressComplaints}</p>
                <p className="text-xs text-blue-800">Under active repair execution by municipal teams.</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase">Closed / Citizen Verified</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-black text-emerald-950">{closedComplaints}</p>
                <p className="text-xs text-emerald-800">Successfully resolved and archived in ledger.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User & Officer Account Management */}
        {activeTab === "users" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">User Account & Role Management</h3>
                <p className="text-xs text-slate-500">Monitor all citizen accounts and municipal officers. Promote or demote access permissions.</p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-amber-400" /> Create Municipal Officer Account
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">User ID / Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Current Role</th>
                      <th className="p-4">Department / Phone</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Role Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{u.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === "superadmin"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : u.role === "officer" || u.role === "admin"
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{u.department || "Citizen Public"}</div>
                          <div className="text-[10px] text-slate-500">{u.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {u.role === "citizen" && (
                            <button
                              onClick={() => handleUpdateRole(u.id, "officer")}
                              className="px-2.5 py-1 bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-bold transition"
                            >
                              Promote to Officer
                            </button>
                          )}
                          {u.role === "officer" && (
                            <button
                              onClick={() => handleUpdateRole(u.id, "citizen")}
                              className="px-2.5 py-1 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 rounded-lg text-[10px] font-bold transition"
                            >
                              Demote to Citizen
                            </button>
                          )}
                          {u.role === "superadmin" && (
                            <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              System Owner
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Master Complaints Audit & Oversight */}
        {activeTab === "complaints" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Master Grievance Audit & Override</h3>
                  <p className="text-xs text-slate-500">Inspect all municipal complaints across every department.</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  Showing {filteredComplaints.length} of {complaints.length} Records
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search complaint ID, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-semibold"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
                    <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                    <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-semibold"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints Master Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Reference ID</th>
                      <th className="p-4">Category & Subissue</th>
                      <th className="p-4">Citizen Name</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Status & Priority</th>
                      <th className="p-4 text-right">Inspect Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-black text-slate-900">{c.complaintId}</td>
                          <td className="p-4">
                            <div className="font-extrabold text-slate-900">{c.category}</div>
                            <div className="text-[11px] text-slate-500">{c.issue}</div>
                          </td>
                          <td className="p-4 font-semibold text-slate-800">{c.citizenName}</td>
                          <td className="p-4 font-semibold text-indigo-900">{c.department || "General"}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={c.status} />
                              <PriorityBadge priority={c.priority} />
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedComplaint(c)}
                              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-lg shadow-xs transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" /> Inspect & Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500 font-semibold">
                          No grievances match your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dialog to Inspect / Edit Complaint as SuperAdmin */}
        {selectedComplaint && (
          <ComplaintModal
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onUpdateSuccess={() => {
              setSelectedComplaint(null);
              fetchData();
            }}
          />
        )}

        {/* Modal Dialog to Add New Municipal Officer */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-900" /> Create Officer Account
                </h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Officer Name *</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="e.g. Officer Rajesh Verma"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="officer@municipal.gov.in"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Municipal Department</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold outline-none"
                  >
                    <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                    <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
                    <option value="Electrical & Streetlights">Electrical & Streetlights</option>
                    <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                    <option value="Executive Governance">Executive Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-xs"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
