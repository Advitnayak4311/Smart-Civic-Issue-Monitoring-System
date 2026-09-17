import { useState, useEffect } from "react";
import { Trophy, Award, Star, ShieldCheck, User } from "lucide-react";

export default function CitizenLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/transparency/leaderboard");
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Fetch Leaderboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            Responsible Civic Participation
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Top Citizen Contributors Leaderboard
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Recognizing citizens who actively report civic issues, verify remediations, and build community trust.
          </p>
        </div>

        <span className="text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-full">
          Monthly Leaderboard
        </span>
      </div>

      {/* Leaderboard Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          Loading Citizen Leaderboard Standings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          No citizen rankings recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaderboard.map((item) => {
            const isGold = item.rank === 1;
            const isSilver = item.rank === 2;
            const isBronze = item.rank === 3;

            return (
              <div
                key={item.rank}
                className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl flex items-start gap-3 transition hover:bg-slate-50 hover:border-slate-300"
              >
                {/* Rank Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                    isGold
                      ? "bg-amber-400 text-amber-950 border-amber-500 shadow-sm"
                      : isSilver
                      ? "bg-slate-200 text-slate-900 border-slate-300 shadow-sm"
                      : isBronze
                      ? "bg-amber-700 text-white border-amber-800 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  #{item.rank}
                </div>

                {/* Info */}
                <div className="space-y-1 text-xs flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-extrabold text-slate-900 text-sm">{item.name}</h4>
                    <span className="text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                      Trust: {item.trustScore}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-semibold">
                    {item.contributions} Tickets Reported &bull; {item.resolved} Solved
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.badges.slice(0, 2).map((b) => (
                      <span key={b} className="text-[9px] font-bold bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                        🏆 {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
