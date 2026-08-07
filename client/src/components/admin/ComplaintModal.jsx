import { X, MapPin, ExternalLink, ShieldCheck, Mail, Phone, User, Building2, CheckCircle2, Clock, Video } from "lucide-react";
import StatusBadge from "../UI/StatusBadge";
import PriorityBadge from "../UI/PriorityBadge";
import IncidentMap from "../UI/IncidentMap";
import CustomStatusSelect from "./CustomStatusSelect";
import JourneyTimeline from "./JourneyTimeline";

export default function ComplaintModal({
  selectedComplaint,
  setSelectedComplaint,
  status,
  setStatus,
  handleUpdate,
}) {
  if (!selectedComplaint) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-blue-900 text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-bold text-blue-200 uppercase">Officer Inspection Modal</span>
            <h3 className="text-lg font-extrabold text-white">Grievance {selectedComplaint.complaintId}</h3>
          </div>
          <button
            onClick={() => setSelectedComplaint(null)}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Banner Details */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Department</span>
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-4 h-4 text-blue-900" />
                {selectedComplaint.department || "General Department"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={selectedComplaint.priority} />
              <StatusBadge status={selectedComplaint.status} />
            </div>
          </div>

          {/* Photo Evidence */}
          {(selectedComplaint.imageUrl || (selectedComplaint.imageList && selectedComplaint.imageList.length > 0)) && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">
                Uploaded Photo Evidence ({(selectedComplaint.imageList && selectedComplaint.imageList.length > 0 ? selectedComplaint.imageList : [selectedComplaint.imageUrl]).length} File{((selectedComplaint.imageList && selectedComplaint.imageList.length > 0 ? selectedComplaint.imageList : [selectedComplaint.imageUrl]).length > 1) ? "s" : ""})
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

          {/* Phase 1 - Intelligence Metrics Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                🛡️ Authenticity Confidence Rating
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white">
                  {selectedComplaint.confidenceScore ?? 75}%
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    (selectedComplaint.confidenceScore ?? 75) >= 80
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : (selectedComplaint.confidenceScore ?? 75) >= 50
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {selectedComplaint.confidenceLevel || "High"} Confidence
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Calculated from photo evidence, verified GPS coordinates, geocoded address & details.
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                ⚡ Public Impact Score
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-white">
                  {selectedComplaint.impactScore ?? 45} / 200
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    (selectedComplaint.impactLevel || "Low") === "Critical"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : (selectedComplaint.impactLevel || "Low") === "High"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  }`}
                >
                  {selectedComplaint.impactLevel || "Low"} Level
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {selectedComplaint.supportCount > 1
                  ? `Supported by ${selectedComplaint.supportCount} citizens`
                  : "Standard citizen report"}
              </p>
            </div>
          </div>

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
              <span className="font-bold text-amber-900">Citizen Remarks / Notes:</span>
              <p className="text-amber-950 leading-relaxed">{selectedComplaint.remarks}</p>
            </div>
          )}

          {/* Phase 2: Journey Timeline Component */}
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
                onClick={handleUpdate}
                className="py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 border border-emerald-600 shrink-0"
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