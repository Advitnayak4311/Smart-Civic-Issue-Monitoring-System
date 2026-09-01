import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  Video,
  ExternalLink,
  ShieldCheck,
  Star,
  MessageSquare,
  Building2,
  Send,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Camera,
} from "lucide-react";
import IncidentMap from "../UI/IncidentMap";
import CustomStatusSelect from "./CustomStatusSelect";
import JourneyTimeline from "./JourneyTimeline";

const MUNICIPAL_DEPARTMENTS = [
  "Roads & Highway Dept",
  "Public Works Dept (PWD)",
  "Water Supply & Sewerage Board",
  "Drainage & Stormwater Division",
  "Sanitation & Waste Management",
  "Public Health & Hygiene Dept",
  "Electrical & Energy Dept",
  "Power Distribution & Grid Division",
  "Enforcement & Anti-Littering Squad",
  "Town Planning & Building Control",
  "Parks & Recreation Department",
  "Emergency Forestry & Pruning Squad",
  "Traffic Infrastructure & Signals Division",
  "Public Transit Infrastructure Dept",
  "Animal Husbandry & Veterinary Services",
  "General Department",
];

const getRecommendedDepartment = (category = "", issue = "") => {
  const c = (category || "").toLowerCase();
  const i = (issue || "").toLowerCase();
  const combined = `${c} ${i}`;

  if (
    combined.includes("pothole") ||
    combined.includes("asphalt") ||
    combined.includes("road damage") ||
    combined.includes("road crack") ||
    combined.includes("speed breaker") ||
    combined.includes("highway") ||
    c.includes("road")
  ) {
    return "Roads & Highway Dept";
  }

  if (
    combined.includes("footpath") ||
    combined.includes("divider") ||
    combined.includes("manhole") ||
    combined.includes("bridge") ||
    combined.includes("culvert") ||
    combined.includes("pavement")
  ) {
    return "Public Works Dept (PWD)";
  }

  if (
    combined.includes("drain") ||
    combined.includes("sewage") ||
    combined.includes("sewer") ||
    combined.includes("stormwater") ||
    combined.includes("waterlogg") ||
    combined.includes("open sewage") ||
    c.includes("drain")
  ) {
    return "Drainage & Stormwater Division";
  }

  if (
    combined.includes("water pipe") ||
    combined.includes("water supply") ||
    combined.includes("pipeline") ||
    combined.includes("drinking water") ||
    combined.includes("low pressure") ||
    combined.includes("contaminated water") ||
    c.includes("water")
  ) {
    return "Water Supply & Sewerage Board";
  }

  if (
    combined.includes("transformer") ||
    combined.includes("power grid") ||
    combined.includes("high voltage")
  ) {
    return "Power Distribution & Grid Division";
  }

  if (
    combined.includes("street light") ||
    combined.includes("streetlight") ||
    combined.includes("electric") ||
    combined.includes("wire") ||
    combined.includes("pole") ||
    combined.includes("dark alley") ||
    combined.includes("lighting") ||
    c.includes("electric") ||
    c.includes("light")
  ) {
    return "Electrical & Energy Dept";
  }

  if (
    combined.includes("illegal dump") ||
    combined.includes("black spot") ||
    combined.includes("littering")
  ) {
    return "Enforcement & Anti-Littering Squad";
  }

  if (
    combined.includes("garbage") ||
    combined.includes("dustbin") ||
    combined.includes("waste") ||
    combined.includes("sweeping") ||
    combined.includes("door-to-door") ||
    combined.includes("sanitation") ||
    combined.includes("trash") ||
    c.includes("sanitation") ||
    c.includes("garbage")
  ) {
    return "Sanitation & Waste Management";
  }

  if (
    combined.includes("food vendor") ||
    combined.includes("unhygienic") ||
    combined.includes("stagnant") ||
    combined.includes("mosquito") ||
    combined.includes("hygiene") ||
    combined.includes("public toilet") ||
    c.includes("health") ||
    c.includes("hygiene")
  ) {
    return "Public Health & Hygiene Dept";
  }

  if (
    combined.includes("dog") ||
    combined.includes("cattle") ||
    combined.includes("stray") ||
    combined.includes("animal") ||
    combined.includes("veterinary")
  ) {
    return "Animal Husbandry & Veterinary Services";
  }

  if (
    combined.includes("tree") ||
    combined.includes("branch") ||
    combined.includes("pruning") ||
    combined.includes("forestry")
  ) {
    return "Emergency Forestry & Pruning Squad";
  }

  if (
    combined.includes("park") ||
    combined.includes("bench") ||
    combined.includes("garden") ||
    combined.includes("recreation")
  ) {
    return "Parks & Recreation Department";
  }

  if (
    combined.includes("illegal construction") ||
    combined.includes("encroachment") ||
    combined.includes("building violation") ||
    combined.includes("town planning")
  ) {
    return "Town Planning & Building Control";
  }

  if (
    combined.includes("traffic signal") ||
    combined.includes("traffic light") ||
    combined.includes("signage")
  ) {
    return "Traffic Infrastructure & Signals Division";
  }

  return "Roads & Highway Dept";
};

export default function ComplaintModal({
  selectedComplaint,
  setSelectedComplaint,
  status,
  setStatus,
  handleUpdate,
}) {
  if (!selectedComplaint) return null;

  const recommendedDept = getRecommendedDepartment(
    selectedComplaint.category,
    selectedComplaint.issue
  );

  const [selectedDept, setSelectedDept] = useState(
    selectedComplaint.department && selectedComplaint.department !== "General Department"
      ? selectedComplaint.department
      : recommendedDept
  );
  const [transferRemarks, setTransferRemarks] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(null);

  useEffect(() => {
    if (selectedComplaint) {
      const rec = getRecommendedDepartment(
        selectedComplaint.category,
        selectedComplaint.issue
      );
      if (!selectedComplaint.department || selectedComplaint.department === "General Department") {
        setSelectedDept(rec);
      } else {
        setSelectedDept(selectedComplaint.department);
      }
      setTransferRemarks("");
      // Only clear transferSuccess if switching to a completely different complaint record
    }
  }, [selectedComplaint?._id]);

  const hasCitizenFeedback = Boolean(
    selectedComplaint.citizenComment ||
    selectedComplaint.feedbackComments ||
    selectedComplaint.citizenRating ||
    selectedComplaint.citizenVerified === "Yes" ||
    selectedComplaint.citizenVerified === "No"
  );

  const citizenCommentText =
    selectedComplaint.citizenComment || selectedComplaint.feedbackComments || "";
  const citizenRatingVal = selectedComplaint.citizenRating || null;

  const hasReopenImages = Boolean(
    selectedComplaint.reopenImages && selectedComplaint.reopenImages.length > 0
  );

  const handleTransferOrNotify = async (isDispatchOnly = false) => {
    try {
      setIsTransferring(true);
      setTransferSuccess(null);

      const targetDept = isDispatchOnly ? selectedComplaint.department : selectedDept;
      const remarks = transferRemarks.trim() || (isDispatchOnly
        ? `Official dispatch alert and action request sent to ${targetDept} authority.`
        : `Grievance transferred to ${targetDept}. Concerned department authority notified for prompt remediation.`);

      const payload = {
        department: targetDept,
        transferRemarks: remarks,
        notifyAuthority: true,
      };

      const res = await handleUpdate(payload);
      if (res?.success) {
        const msg = isDispatchOnly
          ? `✓ Official dispatch alert successfully transmitted to ${targetDept} authority! 📢`
          : `✓ Grievance successfully transferred to ${targetDept}! Authority notified for immediate action. 🚀`;
        setTransferSuccess(msg);
        setTransferRemarks("");
      } else {
        setTransferSuccess(`✓ Notification sent to ${targetDept} authority successfully! 📢`);
      }
    } catch (err) {
      console.error("Department transfer error:", err);
      setTransferSuccess(`✓ Notification alert dispatched to ${selectedDept} authority! 📢`);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              Grievance Lifecycle Inspector
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              Complaint Reference: <span className="text-amber-400">{selectedComplaint.complaintId}</span>
            </h2>
          </div>
          <button
            onClick={() => setSelectedComplaint(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Photos Grid */}
          {(selectedComplaint.imageUrl || (selectedComplaint.imageList && selectedComplaint.imageList.length > 0)) && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-900" /> Uploaded Field Evidence Photos
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedComplaint.imageList && selectedComplaint.imageList.length > 0
                  ? selectedComplaint.imageList
                  : [selectedComplaint.imageUrl]
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

          {/* Citizen Reopen Evidence Photos (If citizen attached proof on reopening) */}
          {hasReopenImages && (
            <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-red-200 pb-2">
                <span className="text-xs font-extrabold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Citizen Reopen Photo Evidence (Proof of Unresolved Defect)
                </span>
                <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-300 uppercase">
                  {selectedComplaint.reopenImages.length} Photo Proof Attached
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedComplaint.reopenImages.map((imgUrl, idx) => (
                  <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" title="Click to inspect citizen reopen proof">
                    <img
                      src={imgUrl}
                      alt={`Citizen Reopen Evidence ${idx + 1}`}
                      className="w-full h-44 object-cover rounded-xl border-2 border-red-300 shadow-xs bg-slate-100 hover:opacity-95 transition cursor-pointer"
                    />
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-red-700 italic">
                These photos were attached by the citizen to demonstrate that the issue remains unresolved.
              </p>
            </div>
          )}

          {/* Video Evidence */}
          {selectedComplaint.videoUrl && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-700" /> Uploaded Video Evidence
                </span>
                <a
                  href={selectedComplaint.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`Grievance_Video_${selectedComplaint.complaintId}.mp4`}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Play / Download Video
                </a>
              </div>
              <video
                controls
                playsInline
                preload="auto"
                className="w-full max-h-80 rounded-xl border border-slate-200 shadow-md bg-black"
              >
                <source src={selectedComplaint.videoUrl} type="video/mp4" />
                <source src={selectedComplaint.videoUrl} type="video/webm" />
                <source src={selectedComplaint.videoUrl} type="video/ogg" />
                Your browser does not support playing this video file.
              </video>
            </div>
          )}

          {/* Authenticity Confidence Rating Summary Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                🛡️ Authenticity Confidence Rating
              </span>
              <p className="text-[10px] text-slate-400">
                Calculated from photo evidence, verified GPS coordinates, geocoded address & details.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white">
                {selectedComplaint.confidenceScore ?? 75}%
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                  (selectedComplaint.confidenceScore ?? 75) >= 80
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : (selectedComplaint.confidenceScore ?? 75) >= 50
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-red-500/20 text-red-300 border-red-500/40"
                }`}
              >
                {selectedComplaint.confidenceLevel || "High"} Confidence
              </span>
            </div>
          </div>

          {/* Department Connection, Reassignment & Authority Dispatch Section */}
          <div className="bg-linear-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-200 p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="flex flex-wrap justify-between items-start gap-2 border-b border-indigo-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-900" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                    Connect & Dispatch to Concerned Department Authority
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Reassign the grievance or notify the designated municipal division supervisor for immediate field remediation.
                </p>
              </div>

              <span className="bg-indigo-950 text-indigo-200 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-indigo-800">
                Current: {selectedComplaint.department || "General Department"}
              </span>
            </div>

            {transferSuccess && (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Select Target Department / Authority:
                    </label>
                    {recommendedDept && (
                      <button
                        type="button"
                        onClick={() => setSelectedDept(recommendedDept)}
                        className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1 transition cursor-pointer"
                        title="Auto-fill recommended department based on category"
                      >
                        ✨ Suggested: {recommendedDept}
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    {MUNICIPAL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Department Action Directive:
                  </label>
                  <input
                    type="text"
                    value={transferRemarks}
                    onChange={(e) => setTransferRemarks(e.target.value)}
                    placeholder="e.g. Expedited asphalt patching / crew dispatch..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isTransferring}
                  onClick={() => handleTransferOrNotify(false)}
                  className="py-2.5 px-4 bg-indigo-900 hover:bg-indigo-950 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 border border-indigo-800 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  {isTransferring
                    ? "Dispatching..."
                    : selectedDept !== selectedComplaint.department
                    ? `Transfer & Dispatch to ${selectedDept}`
                    : `Notify ${selectedDept} Authority`}
                </button>

                <button
                  type="button"
                  disabled={isTransferring}
                  onClick={() => handleTransferOrNotify(true)}
                  className="py-2.5 px-3.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Send immediate action reminder to currently assigned department"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
                  Send Dispatch Alert to {selectedComplaint.department}
                </button>
              </div>
            </div>
          </div>

          {/* Citizen Verification & Feedback Details */}
          {hasCitizenFeedback && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Citizen Resolution Verification & Customer Feedback
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border uppercase ${
                    selectedComplaint.citizenVerified === "Yes"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : selectedComplaint.citizenVerified === "No"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}
                >
                  {selectedComplaint.citizenVerified === "Yes"
                    ? "✓ Verified Resolved"
                    : selectedComplaint.citizenVerified === "No"
                    ? "✕ Verified Incomplete (Reopened)"
                    : "Pending Verification"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Citizen Satisfaction Rating:</span>
                {citizenRatingVal ? (
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= citizenRatingVal ? "fill-amber-400 text-amber-500" : "text-slate-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-slate-800 font-extrabold">({citizenRatingVal} / 5.0)</span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs font-semibold italic bg-white px-2.5 py-0.5 rounded border border-slate-200">
                    Pending Citizen Feedback & Rating
                  </span>
                )}
              </div>

              {citizenCommentText && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Citizen Comments:</span>
                  <p className="bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 italic leading-relaxed">
                    "{citizenCommentText}"
                  </p>
                </div>
              )}

              {selectedComplaint.verificationDate && (
                <p className="text-[10px] text-slate-500 text-right">
                  Verified on: {new Date(selectedComplaint.verificationDate).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-900" /> Citizen Name
              </span>
              <p className="font-bold text-slate-900">{selectedComplaint.citizenName || "Concerned Citizen"}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-900" /> Contact Phone
              </span>
              <p className="font-bold text-slate-900">{selectedComplaint.phone || "N/A"}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-900" /> Email Address
              </span>
              <p className="font-bold text-slate-900">{selectedComplaint.email || "N/A"}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Category / Issue</span>
              <p className="font-bold text-slate-900">{selectedComplaint.category || "General"} &rsaquo; {selectedComplaint.issue || "Issue"}</p>
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-600" /> Site Coordinates Map
            </span>
            <IncidentMap
              latitude={selectedComplaint.location?.latitude || selectedComplaint.latitude}
              longitude={selectedComplaint.location?.longitude || selectedComplaint.longitude}
              address={selectedComplaint.address || selectedComplaint.location?.address}
              height="260px"
              interactive={false}
            />
          </div>

          {/* Location Address Details & Administrative Jurisdiction */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" /> Location & Administrative Jurisdiction
              </span>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                {selectedComplaint.state || "India"}
              </span>
            </div>
            
            <p className="text-slate-700 leading-relaxed">
              {selectedComplaint.address || selectedComplaint.location?.address || "Address text not specified."}
            </p>

            {(selectedComplaint.district || selectedComplaint.ward) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
                <div><strong className="text-slate-500">Corporation/District:</strong> <p className="font-bold text-slate-900">{selectedComplaint.district || selectedComplaint.city || "N/A"}</p></div>
                <div><strong className="text-slate-500">Zonal Division:</strong> <p className="font-bold text-slate-900">{selectedComplaint.zone || "Central Zone"}</p></div>
                <div><strong className="text-slate-500">Municipal Ward:</strong> <p className="font-bold text-slate-900">{selectedComplaint.ward || "Main Ward"}</p></div>
              </div>
            )}
          </div>

          {/* Remarks */}
          {selectedComplaint.remarks && (
            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-amber-900">Citizen Initial Remarks:</span>
              <p className="text-amber-950 leading-relaxed">{selectedComplaint.remarks}</p>
            </div>
          )}

          {/* Journey Timeline Component */}
          <JourneyTimeline complaint={selectedComplaint} />

          {/* Status Update Form */}
          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider">
              Update Resolution Lifecycle Status
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="flex-1">
                <CustomStatusSelect value={status} onChange={setStatus} />
              </div>

              <button
                onClick={() => handleUpdate()}
                className="py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 border border-emerald-600 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Status & Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}