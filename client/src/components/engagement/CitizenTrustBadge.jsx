import { ShieldCheck, Award, Star, Trophy, CheckCircle2 } from "lucide-react";

export default function CitizenTrustBadge({ trustScore = 75, trustBadge = "Active Citizen", badges = [] }) {
  const getBadgeTheme = (score) => {
    if (score >= 90) return { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300", badge: "bg-emerald-600 text-white" };
    if (score >= 75) return { color: "text-blue-700", bg: "bg-blue-50 border-blue-300", badge: "bg-blue-600 text-white" };
    if (score >= 50) return { color: "text-amber-700", bg: "bg-amber-50 border-amber-300", badge: "bg-amber-600 text-white" };
    return { color: "text-red-700", bg: "bg-red-50 border-red-300", badge: "bg-red-600 text-white" };
  };

  const theme = getBadgeTheme(trustScore);

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${theme.bg}`}>
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`w-5 h-5 ${theme.color}`} />
          <h3 className="font-extrabold text-sm text-slate-900">Citizen Credibility Rating</h3>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${theme.badge}`}>
          {trustBadge}
        </span>
      </div>

      {/* Trust Score Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-extrabold">
          <span className="text-slate-600">Trust Score Index</span>
          <span className="text-slate-900 font-black">{trustScore} / 100</span>
        </div>

        <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              trustScore >= 80 ? "bg-emerald-500" : trustScore >= 50 ? "bg-blue-600" : "bg-amber-500"
            }`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
      </div>

      {/* Unlocked Achievement Badges */}
      {badges.length > 0 && (
        <div className="pt-2 border-t border-slate-200/80 space-y-2">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Unlocked Civic Achievement Badges ({badges.length})
          </span>

          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 bg-white text-slate-800 border border-slate-300 font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-2xs"
              >
                <Award className="w-3 h-3 text-amber-500" />
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
