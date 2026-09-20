import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Archive,
  ShieldCheck,
  ArrowLeft,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Building2,
  ShieldAlert,
  Lock
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PriorityBadge from "../components/UI/PriorityBadge";
import StatusBadge from "../components/UI/StatusBadge";

export default function ClosedComplaints() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const isAuthorizedOfficer =
    Boolean(token) &&
    token !== "null" &&
    token !== "undefined" &&
    (userRole === "officer" || userRole === "admin" || userRole === "superadmin");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthorizedOfficer) {
      fetchClosedComplaints();
    }
  }, [isAuthorizedOfficer]);

  const fetchClosedComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:8000/api/admin/complaints/closed",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setComplaints(data.complaints || []);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch closed complaints.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently purge this closed complaint from official records?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/admin/complaints/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Complaint deleted successfully.");
        setComplaints((prev) =>
          prev.filter((item) => item._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Delete operation failed.");
    }
  };

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
              <h2 className="text-2xl font-black text-slate-900">Access Denied: Officer Login Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Municipal Closed Complaints Vault is strictly restricted to authenticated Municipal Officers and Administrators. Please log in with official department credentials.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate("/admin-login")}
                className="py-3 px-6 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 border border-blue-950"
              >
                <Lock className="w-4 h-4 text-amber-400" /> Officer Portal Sign In
              </button>
              <button
                onClick={() => navigate("/")}
                className="py-3 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition shadow-2xs"
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Header */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Municipal Permanent Record Vault</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Closed & Verified Complaints Archive
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Repository of complaints that have undergone citizen resolution verification and completed their SLA cycle.
              </p>
            </div>

            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Officer Dashboard
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-600 font-semibold text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-900" /> Accessing municipal archive vault...
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Archive className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Closed Complaints in Archive</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complaints are archived here once citizens confirm resolution via the verification email link.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Archive className="w-4 h-4 text-blue-900" /> Official Archived Grievance Ledger
                </span>
                <span className="font-semibold text-slate-500">{complaints.length} Closed Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Ref ID</th>
                      <th className="py-3.5 px-4">Citizen Name</th>
                      <th className="py-3.5 px-4">Category & Issue</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">SLA Priority</th>
                      <th className="py-3.5 px-4">Closed Timestamp</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {complaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-blue-900">{complaint.complaintId}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{complaint.citizenName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{complaint.category}</div>
                          <div className="text-[10px] text-slate-500">{complaint.issue}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{complaint.department || "General"}</td>
                        <td className="py-3.5 px-4">
                          <PriorityBadge priority={complaint.priority} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {complaint.verificationDate
                            ? new Date(complaint.verificationDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                            : complaint.closedAt
                            ? new Date(complaint.closedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
                            : "Archived"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDelete(complaint._id)}
                            className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs px-3 py-1.5 rounded-lg border border-red-300 transition"
                            title="Purge Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Purge
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}