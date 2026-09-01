import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  ArrowLeft,
  ClipboardPaste,
  Star,
  MessageSquare,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Copy,
  Check,
  Share2,
  Printer,
  Sparkles,
  Zap,
  RotateCcw,
  Maximize2,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import IncidentMap from "../components/UI/IncidentMap";
import ComplaintTimeline from "../components/ComplaintTimeline";
import StatusBadge from "../components/UI/StatusBadge";
import PriorityBadge from "../components/UI/PriorityBadge";

export default function TrackComplaint() {
  const { complaintId: routeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromQuery = params.get("id") || params.get("complaintId") || params.get("ref");
    const targetId = routeId || idFromQuery;

    if (targetId) {
      const cleanId = decodeURIComponent(targetId).trim();
      setComplaintId(cleanId);
      fetchComplaintById(cleanId);
    }
  }, [routeId, location.search]);

  const fetchComplaintById = async (searchId = complaintId) => {
    const cleanId = (searchId || complaintId || "").trim();
    if (!cleanId) {
      setError("Please enter a valid Complaint Reference ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const res = await fetch(`http://localhost:8000/api/admin/track/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setComplaint(data.data);
        setComplaintId(data.data.complaintId || cleanId);
      } else {
        setError(data.message || `No complaint record found for Reference ID "${cleanId}".`);
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

  const handleCopyId = () => {
    if (complaint?.complaintId) {
      navigator.clipboard.writeText(complaint.complaintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract all media evidence
  const photoEvidenceList = complaint
    ? (Array.isArray(complaint.imageList) && complaint.imageList.length > 0
        ? complaint.imageList
        : [complaint.imageUrl || complaint.image].filter(Boolean)
      ).slice(0, 5)
    : [];

  const videoEvidenceUrl = complaint?.videoUrl || complaint?.reopenVideo || null;

  const hasBeforeAfter = Boolean(
    complaint &&
    (complaint.status === "Completed" || complaint.status === "Closed" || complaint.citizenVerified === "Yes" || complaint.resolutionProof) &&
    (complaint.imageUrl || (complaint.imageList && complaint.imageList.length > 0))
  );

  const beforePhoto = complaint?.beforeImage || complaint?.imageUrl || (complaint?.imageList && complaint?.imageList[0]) || "";
  const afterPhoto = complaint?.afterImage || complaint?.resolutionProof || (complaint?.imageList && complaint?.imageList.length > 1 ? complaint.imageList[1] : beforePhoto);

  // Live SLA Countdown Computation
  const getSlaInfo = () => {
    if (!complaint?.createdAt) return { label: "48 Hours Guarantee", detail: "Active SLA Target", isOverdue: false, isResolved: false };
    const slaHours = complaint.slaLimitHours || 48;
    const createdTime = new Date(complaint.createdAt).getTime();
    const deadline = createdTime + (slaHours * 60 * 60 * 1000);
    const now = Date.now();

    if (complaint.status === "Completed" || complaint.status === "Closed" || complaint.citizenVerified === "Yes") {
      const finishedTime = new Date(complaint.completedAt || complaint.closedAt || complaint.updatedAt || now).getTime();
      const elapsedHours = Math.max(0.1, (finishedTime - createdTime) / (1000 * 60 * 60));
      return {
        label: `${elapsedHours.toFixed(1)}h Elapsed`,
        detail: elapsedHours <= slaHours ? "✓ Resolved Within SLA" : "⚠️ Resolved Past SLA",
        isOverdue: elapsedHours > slaHours,
        isResolved: true,
      };
    }

    const diffMs = deadline - now;
    if (diffMs <= 0) {
      const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      return {
        label: `Overdue by ${overdueHours}h`,
        detail: "🚨 Escalated to High Priority",
        isOverdue: true,
        isResolved: false,
      };
    }

    const remHours = Math.floor(diffMs / (1000 * 60 * 60));
    const remMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      label: `${remHours}h ${remMins}m Remaining`,
      detail: `${slaHours}h Guaranteed SLA Window`,
      isOverdue: false,
      isResolved: false,
    };
  };

  const slaInfo = getSlaInfo();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <div>
        <Navbar />

        {/* Executive Luxury Header */}
        <div className="relative bg-linear-to-b from-slate-950 via-slate-900 to-slate-900/90 py-12 border-b border-slate-800 overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>Live Municipal SLA Monitoring Hub</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Grievance Tracking & Audit Trail
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Inspect real-time field progression, assigned municipal authorities, verified remediation proofs, and citizen feedback audits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 backdrop-blur-md transition shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Portal Home
              </Link>
              {complaint && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 backdrop-blur-md transition shadow-sm cursor-pointer"
                  title="Print official tracking receipt"
                >
                  <Printer className="w-4 h-4 text-blue-400" /> Print
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Executive Search Card */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                Inspect Grievance by Reference Number
              </label>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/30 flex items-center gap-1.5 transition cursor-pointer"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" /> Paste ID
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter CIV-XXXXXXXX or SCMSC-XXXXXXXX..."
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchComplaintById()}
                  className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-600/80 text-sm font-bold text-white bg-slate-900/80 placeholder-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {complaintId && (
                  <button
                    type="button"
                    onClick={() => setComplaintId("")}
                    className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => fetchComplaintById()}
                disabled={loading}
                className="py-3.5 px-8 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-blue-400/30"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Querying Command Center...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Live Status</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-300 bg-red-950/60 p-3.5 rounded-xl border border-red-800/80 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && !complaint && (
            <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/60 p-12 text-center text-slate-400 font-bold text-xs space-y-3 shadow-lg">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Authenticating & Loading Grievance Record...</p>
            </div>
          )}

          {/* Complaint Record Presentation */}
          {complaint && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Luxury Summary Card */}
              <div className="bg-slate-800/70 backdrop-blur-xl rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-6">
                {/* Top Reference & Badges */}
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-700/60 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
                        Official Grievance Dossier
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                        title="Copy Reference ID"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Copied!" : "Copy ID"}</span>
                      </button>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {complaint.complaintId}
                    </h2>

                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Logged on: {new Date(complaint.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2.5">
                    <StatusBadge status={complaint.status} />
                    <PriorityBadge priority={complaint.priority} />
                  </div>
                </div>

                {/* 4-Stat Executive Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Category */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Civic Category
                    </span>
                    <p className="font-extrabold text-white text-sm truncate">{complaint.category}</p>
                    <span className="text-[10px] font-medium text-slate-400 block truncate">
                      {complaint.issue}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Responsible Authority
                    </span>
                    <p className="font-extrabold text-blue-300 text-sm truncate">
                      {complaint.department || "General Division"}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {complaint.ward || "Central Division"}
                    </span>
                  </div>

                  {/* SLA Guarantee & Live Countdown */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Resolution SLA Bound
                    </span>
                    <div className={`flex items-center gap-1.5 font-extrabold text-sm ${slaInfo.isOverdue ? "text-red-400" : slaInfo.isResolved ? "text-emerald-400" : "text-emerald-400"}`}>
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{slaInfo.label}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 block truncate">
                      {slaInfo.detail}
                    </span>
                  </div>

                  {/* Citizen Verification */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Citizen Verification
                    </span>
                    <p className="font-extrabold text-sm flex items-center gap-1">
                      {complaint.citizenVerified === "Yes" ? (
                        <span className="text-emerald-400">✓ Verified Resolved</span>
                      ) : complaint.citizenVerified === "No" ? (
                        <span className="text-red-400">✕ Disputed (Reopened)</span>
                      ) : (
                        <span className="text-amber-400">⏳ Verification Pending</span>
                      )}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 block">
                      {complaint.citizenVerified !== "Pending" && complaint.citizenRating
                        ? `Citizen Rated: ${complaint.citizenRating}/5 Stars`
                        : "Awaiting Resolution & Citizen Feedback"}
                    </span>
                  </div>
                </div>

                {/* Pending Verification Call-To-Action Banner */}
                {complaint.status === "Completed" && complaint.citizenVerified === "Pending" && complaint.verificationToken && (
                  <div className="bg-linear-to-r from-emerald-950/80 via-emerald-900/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Action Required: Remediation Marked Complete</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The municipal field crew has resolved this issue. Please verify the physical repair and submit your official citizen rating.
                      </p>
                    </div>

                    <Link
                      to={`/verify/${complaint.verificationToken}`}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-md shadow-emerald-600/30 border border-emerald-400/40 shrink-0 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-300" /> Verify & Rate Resolution
                    </Link>
                  </div>
                )}

                {/* Side-By-Side Before & After Resolution Card */}
                {hasBeforeAfter && (
                  <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          Remediation Photographic Verification (Before vs After)
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        Remediation Audit
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Photo */}
                      <div className="rounded-xl overflow-hidden border border-red-800/60 bg-black/40">
                        <div className="bg-red-950 text-red-300 px-3 py-1.5 text-[10px] font-black uppercase flex justify-between">
                          <span>Before Repair</span>
                          <span>Original Report</span>
                        </div>
                        <img
                          src={beforePhoto}
                          alt="Before Remediation"
                          className="w-full h-48 object-cover hover:scale-105 transition duration-300 cursor-pointer"
                          onClick={() => setLightboxImg(beforePhoto)}
                        />
                      </div>

                      {/* After Photo */}
                      <div className="rounded-xl overflow-hidden border border-emerald-800/60 bg-black/40">
                        <div className="bg-emerald-950 text-emerald-300 px-3 py-1.5 text-[10px] font-black uppercase flex justify-between">
                          <span>After Repair</span>
                          <span>Verified Fix</span>
                        </div>
                        <img
                          src={afterPhoto}
                          alt="After Remediation"
                          className="w-full h-48 object-cover hover:scale-105 transition duration-300 cursor-pointer"
                          onClick={() => setLightboxImg(afterPhoto)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Recorded Citizen Feedback & Rating (Shown ONLY after citizen provides rating/feedback post-resolution) */}
                {complaint.citizenVerified !== "Pending" && (complaint.citizenRating || complaint.citizenComment || complaint.feedbackComments) && (
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3 text-xs">
                    <div className="flex flex-wrap justify-between items-center border-b border-amber-500/20 pb-2.5 gap-2">
                      <span className="font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        Citizen Resolution Feedback & Satisfaction Rating
                      </span>

                      {complaint.citizenRating ? (
                        <div className="flex items-center gap-1 text-amber-400 font-black">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= complaint.citizenRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                          <span className="ml-1.5 text-white font-black text-xs">
                            ({complaint.citizenRating} / 5.0)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-semibold italic">
                          Feedback recorded without Star Rating
                        </span>
                      )}
                    </div>

                    {(complaint.citizenComment || complaint.feedbackComments) && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Citizen Verified Review:
                        </span>
                        <p className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/20 text-slate-200 italic leading-relaxed">
                          "{complaint.citizenComment || complaint.feedbackComments}"
                        </p>
                      </div>
                    )}

                    {complaint.reopenImages && complaint.reopenImages.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                          Citizen Dispute Reopen Photos ({complaint.reopenImages.length} attached):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {complaint.reopenImages.map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`Dispute Proof ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-xl border border-red-800/60 bg-black/40 hover:opacity-95 transition cursor-pointer"
                              onClick={() => setLightboxImg(imgUrl)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Evidence Section (Supports Up To 500 MB) */}
                {videoEvidenceUrl && (
                  <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/60 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                      <span className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <Video className="w-4 h-4 text-indigo-400" />
                        Uploaded Video Evidence (500 MB Limit Supported)
                      </span>
                      <a
                        href={videoEvidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={`Grievance_Video_${complaint.complaintId}.mp4`}
                        className="text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> Download Video
                      </a>
                    </div>
                    <video
                      controls
                      playsInline
                      className="w-full max-h-80 rounded-xl border border-slate-700 bg-black shadow-lg"
                    >
                      <source src={videoEvidenceUrl} type="video/mp4" />
                      <source src={videoEvidenceUrl} type="video/webm" />
                      <source src={videoEvidenceUrl} type="video/ogg" />
                      Your browser does not support playing this video file.
                    </video>
                  </div>
                )}

                {/* Photo Evidence Gallery (Max 5 Images) */}
                {photoEvidenceList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                        Citizen Photo Evidence ({photoEvidenceList.length} of max 5 attached)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {photoEvidenceList.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-md cursor-pointer"
                          onClick={() => setLightboxImg(imgUrl)}
                        >
                          <img
                            src={imgUrl}
                            alt={`Photo Evidence ${idx + 1}`}
                            className="w-full h-28 object-cover transition duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="absolute bottom-1 left-1.5 bg-slate-950/80 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Photo #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Incident Map & Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address Details */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <MapPin className="w-4 h-4 text-red-400" /> Verified Geocoded Location
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {complaint.address || complaint.location?.address || "Location details verified in database."}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2 text-[10px] text-slate-400">
                      {complaint.district && (
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          District: {complaint.district}
                        </span>
                      )}
                      {complaint.state && (
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          State: {complaint.state}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-md">
                    <IncidentMap
                      latitude={complaint.location?.latitude || complaint.latitude}
                      longitude={complaint.location?.longitude || complaint.longitude}
                      address={complaint.address || complaint.location?.address}
                      height="160px"
                      interactive={false}
                    />
                  </div>
                </div>
              </div>

              {/* High-End Stepper & Journey Timeline Component */}
              <ComplaintTimeline complaint={complaint} />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Full Resolution View"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain border border-slate-700"
            />
            <p className="text-center text-slate-300 text-xs mt-3 font-bold">
              Click anywhere to close full-screen preview
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}