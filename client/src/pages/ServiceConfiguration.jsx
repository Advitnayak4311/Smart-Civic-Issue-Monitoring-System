import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Settings,
  ShieldCheck,
  PlusCircle,
  Edit2,
  Trash2,
  Building2,
  Layers,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ShieldAlert,
  Lock
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PriorityBadge from "../components/UI/PriorityBadge";

export default function ServiceConfiguration() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const [services, setServices] = useState([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deptList, setDeptList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/service-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServices(data.services);
        }
      })
      .catch((err) => console.log(err));

    fetch("http://localhost:8000/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.departments)) {
          setDeptList(data.departments);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  if (!token || (userRole !== "officer" && userRole !== "superadmin")) {
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
                Service Rules & SLA Configuration can only be viewed and modified by authorized Officers or SuperAdmins after sign-in.
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

  const resetForm = () => {
    setCategory("");
    setSubcategory("");
    setDepartment("");
    setPriority("Medium");
    setEditingId(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!category || !subcategory || !department) {
      return alert("Please select category, type subcategory name, and assign a department.");
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/api/service-config/${editingId}`
        : "http://localhost:8000/api/service-config";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subcategory, department, priority }),
      });

      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          // Fallback refresh
          fetchServices();
        }
        alert(isEditing ? "Rule updated successfully!" : "New service rule added successfully!");
        resetForm();
      } else {
        alert(data.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
  };

  const fetchServices = () => {
    fetch("http://localhost:8000/api/service-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.services)) {
          setServices(data.services);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleEdit = (s) => {
    setIsEditing(true);
    setEditingId(s._id);
    setCategory(s.category || "");
    setSubcategory(s.subcategory || "");
    setDepartment(s.department || "");
    setPriority(s.priority || "Medium");
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this civic service rule?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/service-config/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          setServices((prev) => prev.filter((item) => item._id !== id));
        }
        alert("Service rule removed successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete service rule.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Page Banner */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Settings className="w-4 h-4" />
                <span>Municipal Governance Rulebook</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Service & Category SLA Rules
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Configure civic problem categories, SLA response times, and target municipal department assignments.
              </p>
            </div>

            <Link
              to="/admin"
              className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" /> Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Add / Edit Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-900" />
                {isEditing ? "Edit Service SLA Rule" : "Define New Civic Category / Subcategory Rule"}
              </h2>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Roads & Potholes"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Subcategory / Specific Issue *</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Deep Road Pothole"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Assigned Department *</label>
                <input
                  type="text"
                  list="department-options"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Select or type department name..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                />
                <datalist id="department-options">
                  {deptList.map((d) => (
                    <option key={d._id || d.name} value={d.name} />
                  ))}
                  <option value="Water Supply & Sewerage Board" />
                  <option value="Drainage & Stormwater Division" />
                  <option value="Roads & Highway Dept" />
                  <option value="Public Works Dept (PWD)" />
                  <option value="Electrical & Energy Dept" />
                  <option value="Power Distribution & Grid Division" />
                  <option value="Sanitation & Waste Management" />
                  <option value="Public Health & Hygiene Dept" />
                  <option value="Enforcement & Anti-Littering Squad" />
                  <option value="Animal Husbandry & Veterinary Services" />
                  <option value="Emergency Forestry & Pruning Squad" />
                  <option value="Parks & Recreation Department" />
                  <option value="Town Planning & Building Control" />
                  <option value="Traffic Infrastructure & Signals Division" />
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority (Urgent)</option>
                  <option value="Emergency">Emergency Level</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 border border-blue-950"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                {isEditing ? "Update Service Rule" : "Save & Register Category Rule"}
              </button>
            </div>
          </div>

          {/* Active Rules List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Registered Service Routing Rules ({services.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-extrabold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subcategory</th>
                    <th className="py-3 px-4">Assigned Department</th>
                    <th className="py-3 px-4">Default Priority</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No custom service rules defined yet. System will use standard category rules.
                      </td>
                    </tr>
                  ) : (
                    services.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.category}</td>
                        <td className="py-3 px-4">{s.subcategory}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-200">
                            {s.department}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={s.priority} />
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}