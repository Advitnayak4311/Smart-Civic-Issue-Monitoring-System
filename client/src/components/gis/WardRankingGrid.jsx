import { useState, useEffect } from "react";
import { Award, Trophy, TrendingUp, Building2, Star, CheckCircle2, ShieldAlert, Filter } from "lucide-react";

export default function WardRankingGrid() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState("all"); // 'all', 'top', 'lowest'

  useEffect(() => {
    fetchWardRankings();
  }, []);

  const fetchWardRankings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/gis/ward-rankings");
      const data = await res.json();
      if (data.success && Array.isArray(data.wards)) {
        setWards(data.wards);
      }
    } catch (err) {
      console.error("Fetch Ward Rankings Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthBadge = (level) => {
    switch (level) {
      case "Excellent":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold";
      case "Good":
        return "bg-green-100 text-green-900 border-green-300 font-extrabold";
      case "Average":
        return "bg-amber-100 text-amber-900 border-amber-300 font-extrabold";
      case "Poor":
        return "bg-orange-100 text-orange-900 border-orange-300 font-extrabold";
      default:
        return "bg-red-100 text-red-900 border-red-300 font-extrabold";
    }
  };

  const filteredWards = wards.filter((w) => {
    if (viewTab === "top") return w.ranking <= 5;
    if (viewTab === "lowest") return w.ranking > wards.length - 5;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            Comparative Governance Analysis
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Municipal Ward Performance Rankings (#1 to #{wards.length || 15})
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Ward-wise comparative performance scores based on civic health indices, SLA resolution speeds, and citizen satisfaction ratings.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-extrabold">
          <button
            onClick={() => setViewTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Wards ({wards.length})
          </button>
          <button
            onClick={() => setViewTab("top")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewTab === "top" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Top 5 Performers
          </button>
          <button
            onClick={() => setViewTab("lowest")}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewTab === "lowest" ? "bg-red-600 text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Requires Attention
          </button>
        </div>
      </div>

      {/* Ward Ranking Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          Computing Ward Performance Aggregation Rankings...
        </div>
      ) : filteredWards.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          No ward ranking records available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Ward Name & Division</th>
                <th className="py-3.5 px-4">Zone</th>
                <th className="py-3.5 px-4">Civic Health Score</th>
                <th className="py-3.5 px-4">Resolution Rate %</th>
                <th className="py-3.5 px-4">Citizen Rating</th>
                <th className="py-3.5 px-4">Status Level</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredWards.map((w) => {
                const isGold = w.ranking === 1;
                const isSilver = w.ranking === 2;
                const isBronze = w.ranking === 3;

                return (
                  <tr key={w.wardNumber} className="hover:bg-slate-50 transition">
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs border ${
                          isGold
                            ? "bg-amber-400 text-amber-950 border-amber-500 shadow-sm"
                            : isSilver
                            ? "bg-slate-200 text-slate-900 border-slate-300 shadow-sm"
                            : isBronze
                            ? "bg-amber-700 text-white border-amber-800 shadow-sm"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        #{w.ranking}
                      </span>
                    </td>

                    {/* Ward Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{w.wardName}</div>
                      <div className="text-[10px] text-slate-400">Pop: {w.population.toLocaleString()} citizens</div>
                    </td>

                    {/* Zone */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{w.zone}</td>

                    {/* Civic Health Score */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-sm text-slate-900">{w.healthScore} / 100</div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            w.healthScore >= 80 ? "bg-emerald-500" : w.healthScore >= 60 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${w.healthScore}%` }}
                        />
                      </div>
                    </td>

                    {/* Resolution Rate */}
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700">{w.resolutionRate}%</td>

                    {/* Citizen Rating */}
                    <td className="py-3.5 px-4 font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {w.citizenRating} / 5.0
                    </td>

                    {/* Status Level Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] border ${getHealthBadge(w.healthLevel)}`}>
                        {w.healthLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
