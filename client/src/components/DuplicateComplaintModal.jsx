import { useState } from "react";
import { AlertTriangle, ThumbsUp, ArrowRight, MapPin, Building2, Clock, Users, X } from "lucide-react";

export default function DuplicateComplaintModal({ duplicateData, onSupport, onSubmitAnyway, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!duplicateData) return null;

  const handleSupportClick = async () => {
    try {
      setLoading(true);
      await onSupport(duplicateData.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-amber-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Possible Duplicate Complaint Found</h3>
              <p className="text-amber-100 text-xs font-medium">
                An active civic issue matching your report exists nearby ({duplicateData.distance}m away)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-100 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Card */}
        <div className="p-6 space-y-5 text-slate-800">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-amber-200/60 pb-2">
              <span className="font-bold text-slate-600">Existing Grievance Ref</span>
              <span className="font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md font-mono text-[11px]">
                {duplicateData.complaintId}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Department
                </span>
                <p className="font-bold text-slate-800">{duplicateData.department || "Municipal Division"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Current Status
                </span>
                <p className="font-bold text-blue-900">{duplicateData.status || "In Progress"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-600" /> Public Support
                </span>
                <p className="font-extrabold text-amber-800">Reported by {duplicateData.supportCount} Citizens</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> Proximity
                </span>
                <p className="font-bold text-slate-800">{duplicateData.distance} meters from your location</p>
              </div>
            </div>

            {duplicateData.address && (
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[11px] font-semibold text-slate-500 block">Reported Location:</span>
                <p className="font-medium text-slate-700 truncate">{duplicateData.address}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed text-center">
            To prevent duplicate tickets and accelerate municipal action, you can <b>Support Existing Complaint</b>.
            This boosts the priority score and notifies municipal supervisors immediately.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSupportClick}
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4 text-emerald-200" />
              {loading ? "Recording Public Support..." : "Support Existing Complaint (Recommended)"}
            </button>

            <div className="flex gap-2">
              <button
                onClick={onSubmitAnyway}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-200"
              >
                Submit New Ticket Anyway
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-500 font-semibold text-xs rounded-xl transition border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
