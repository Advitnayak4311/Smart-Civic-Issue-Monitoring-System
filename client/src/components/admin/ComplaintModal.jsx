import { X, MapPin, ExternalLink, ShieldCheck, Mail, Phone, User, Building2, CheckCircle2, Clock } from "lucide-react";
import StatusBadge from "../UI/StatusBadge";
import PriorityBadge from "../UI/PriorityBadge";
import IncidentMap from "../UI/IncidentMap";

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
          {selectedComplaint.imageUrl && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">Uploaded Photo Evidence</span>
              <img
                src={selectedComplaint.imageUrl}
                alt="Complaint Evidence"
                className="w-full max-h-72 object-cover rounded-xl border border-slate-200 shadow-xs"
              />
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-900" /> Citizen Name
              </span>
              <p className="font-bold text-slate-900">{selectedComplaint.citizenName}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-900" /> Contact Phone
              </span>
              <p className="font-bold text-slate-900">{selectedComplaint.phone}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-900" /> Email Address
              </span>
              <p className="font-bold text-slate-900">{selectedComplaint.email}</p>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Category / Issue</span>
              <p className="font-bold text-slate-900">{selectedComplaint.category} &rsaquo; {selectedComplaint.issue}</p>
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

          {/* Status Update Form */}
          <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider">
              Update Resolution Lifecycle Status
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 bg-white p-3 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed (Dispatches Email Verification)</option>
              </select>

              <button
                onClick={handleUpdate}
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 border border-emerald-600"
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