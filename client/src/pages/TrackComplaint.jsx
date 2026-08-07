import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  ClipboardPaste
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ComplaintTimeline from "../components/ComplaintTimeline";
import StatusBadge from "../components/UI/StatusBadge";
import PriorityBadge from "../components/UI/PriorityBadge";
import IncidentMap from "../components/UI/IncidentMap";

export default function TrackComplaint() {
  const { complaintId: urlParamId } = useParams();

  const [complaintId, setComplaintId] = useState(urlParamId || "");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlParamId) {
      setComplaintId(urlParamId);
      fetchComplaintById(urlParamId);
    }
  }, [urlParamId]);

  const fetchComplaintById = async (idToSearch) => {
    const targetId = idToSearch || complaintId;
    if (!targetId || !targetId.trim()) {
      setError("Please enter a valid Complaint ID (e.g. CIV-12345678 or SCMSC-XXXX)");
      return;
    }

    setError("");
    setComplaint(null);
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/track/${targetId.trim()}`
      );
      const data = await res.json();

      if (data.success) {
        setComplaint(data.data);
      } else {
        setError(data.message || "No complaint record found for this Reference ID.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Failed to reach tracking server.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setComplaintId(text.trim());
      }
    } catch (err) {
      console.log("Clipboard read error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Page Header */}
        <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Real-Time Grievance Tracking Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Track Complaint Status
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Enter your unique Complaint Reference ID (CIV-XXXXXXXX or SCMSC-XXXXXXXX) to inspect live SLA resolution progress.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enter Complaint Reference ID
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-xs font-bold text-blue-800 hover:text-blue-950 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1 transition"
                title="Paste Complaint ID from Clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-blue-700" /> Paste ID
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. CIV-12345678 or SCMSC-XXXX"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchComplaintById()}
                  className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="absolute right-2 top-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition border border-blue-200"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-blue-700" /> Paste
                </button>
              </div>

              <button
                onClick={() => fetchComplaintById()}
                disabled={loading}
                className="py-3 px-6 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Searching Database..." : "Track Grievance"}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Complaint Record Details */}
          {complaint && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      Grievance Reference Number
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">
                      {complaint.complaintId}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted on: {new Date(complaint.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                </div>

                {/* Grid Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Category</span>
                    <p className="font-bold text-slate-900 mt-0.5">{complaint.category}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Subcategory Issue</span>
                    <p className="font-bold text-slate-900 mt-0.5">{complaint.issue}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Department</span>
                    <p className="font-bold text-slate-900 mt-0.5">{complaint.department || "General Department"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Citizen Feedback</span>
                    <p className="font-bold text-slate-900 mt-0.5">{complaint.citizenVerified || "Pending"}</p>
                  </div>
                </div>

                {/* Interactive Leaflet Map */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" /> Incident Map Location
                  </span>
                  <IncidentMap
                    latitude={complaint.location?.latitude || complaint.latitude}
                    longitude={complaint.location?.longitude || complaint.longitude}
                    address={complaint.address || complaint.location?.address}
                    height="280px"
                    interactive={false}
                  />
                </div>

                {/* Evidence Image */}
                {(complaint.imageUrl || (complaint.imageList && complaint.imageList.length > 0)) && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800">
                      Photo Evidence Attached ({(complaint.imageList && complaint.imageList.length > 0 ? complaint.imageList : [complaint.imageUrl]).length} File{((complaint.imageList && complaint.imageList.length > 0 ? complaint.imageList : [complaint.imageUrl]).length > 1) ? "s" : ""})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(complaint.imageList && complaint.imageList.length > 0
                        ? complaint.imageList
                        : [complaint.imageUrl]
                      ).map((imgUrl, idx) => (
                        <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" title="Click to view full size">
                          <img
                            src={imgUrl}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-xs bg-slate-100 hover:opacity-95 transition cursor-pointer"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Details */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-600" /> Address Details
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {complaint.address || complaint.location?.address || "Address details logged."}
                  </p>
                </div>
              </div>

              {/* Timeline Component */}
              <ComplaintTimeline complaint={complaint} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}