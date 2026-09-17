import { AlertTriangle, ShieldAlert, ArrowRight, Flame, Droplets, Zap, Wrench } from "lucide-react";

export default function EmergencyBanner({ emergencyCount = 1, onInspectEmergency }) {
  if (!emergencyCount || emergencyCount === 0) return null;

  return (
    <div className="bg-red-900 text-white rounded-2xl p-5 border-2 border-red-600 shadow-xl animate-pulse space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black animate-ping shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-200">
              CRITICAL EMERGENCY RESPONSE MODE ACTIVATED
            </span>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              🚨 {emergencyCount} Critical City Emergency Ticket(s) Override Active Queue
            </h3>
          </div>
        </div>

        {onInspectEmergency && (
          <button
            onClick={onInspectEmergency}
            className="px-4 py-2 bg-white text-red-950 font-black text-xs rounded-xl shadow hover:bg-red-100 transition flex items-center gap-1.5 shrink-0"
          >
            Inspect Emergency Queue <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-red-100 leading-relaxed font-medium border-t border-red-800/80 pt-2">
        SLA timers overridden to <b>Immediate Response Desk</b>. Field crews dispatched automatically to location coordinates.
      </p>
    </div>
  );
}
