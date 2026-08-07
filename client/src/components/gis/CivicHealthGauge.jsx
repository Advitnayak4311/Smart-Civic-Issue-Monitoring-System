import { useState, useEffect } from "react";
import { Activity, ShieldCheck, TrendingUp, AlertTriangle, Building2, Wrench, Droplets, Zap, Trash2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function CivicHealthGauge() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthIndex();
  }, []);

  const fetchHealthIndex = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/gis/health-index");
      const data = await res.json();
      if (data.success) {
        setHealthData(data);
      }
    } catch (err) {
      console.error("Fetch Civic Health Index Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTheme = (level) => {
    switch (level) {
      case "Excellent":
        return { color: "#15803d", bg: "bg-emerald-50 text-emerald-900 border-emerald-300", badge: "bg-emerald-600 text-white" };
      case "Good":
        return { color: "#16a34a", bg: "bg-green-50 text-green-900 border-green-300", badge: "bg-green-600 text-white" };
      case "Average":
        return { color: "#ca8a04", bg: "bg-amber-50 text-amber-900 border-amber-300", badge: "bg-amber-500 text-white" };
      case "Poor":
        return { color: "#ea580c", bg: "bg-orange-50 text-orange-900 border-orange-300", badge: "bg-orange-600 text-white" };
      default:
        return { color: "#dc2626", bg: "bg-red-50 text-red-900 border-red-300", badge: "bg-red-600 text-white" };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 font-bold text-xs shadow-xs">
        Calculating City-Wide Civic Health Index & Infrastructure Pillars...
      </div>
    );
  }

  const score = healthData?.cityHealthScore || 84;
  const level = healthData?.healthLevel || "Good";
  const theme = getTheme(level);
  const pillars = healthData?.pillars || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            Flagship Smart City Governance Metric
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            City Civic Health Index (0 – 100 Score)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time multi-dimensional scoring of municipal road, water, sanitation, and lighting infrastructure.
          </p>
        </div>

        {/* Level Badge */}
        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${theme.bg}`}>
          Status: {level} Health
        </span>
      </div>

      {/* Main Gauge & Pillars Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Large Circular Gauge Meter */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circular Progress Meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={theme.color}
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Center Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OUT OF 100</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h4 className="font-extrabold text-sm text-slate-900">Overall Municipal Index</h4>
            <p className="text-slate-500 text-xs">Weighted across 6 infrastructure pillars</p>
          </div>
        </div>

        {/* Right: 6 Infrastructure Pillars */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            6 Weighted Municipal Infrastructure Pillars
          </h4>

          <div className="space-y-2.5 text-xs">
            {/* Pillar 1: Road Infrastructure (25%) */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-amber-600" /> Road & Pothole Infrastructure (25%)</span>
                <span className="font-black text-slate-900">{pillars.roadInfrastructure?.score || 85}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${pillars.roadInfrastructure?.score || 85}%` }} />
              </div>
            </div>

            {/* Pillar 2: Sanitation & Garbage (20%) */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-emerald-600" /> Sanitation & Solid Waste (20%)</span>
                <span className="font-black text-slate-900">{pillars.sanitation?.score || 88}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${pillars.sanitation?.score || 88}%` }} />
              </div>
            </div>

            {/* Pillar 3: Water Supply (20%) */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-600" /> Water Supply & Distribution (20%)</span>
                <span className="font-black text-slate-900">{pillars.waterSupply?.score || 82}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${pillars.waterSupply?.score || 82}%` }} />
              </div>
            </div>

            {/* Pillar 4: Street Lighting (15%) */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Street Lighting & Power (15%)</span>
                <span className="font-black text-slate-900">{pillars.streetLighting?.score || 90}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pillars.streetLighting?.score || 90}%` }} />
              </div>
            </div>

            {/* Pillar 5: Drainage System (10%) */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-indigo-600" /> Drainage & Sewage Network (10%)</span>
                <span className="font-black text-slate-900">{pillars.drainage?.score || 80}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pillars.drainage?.score || 80}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend Area Chart */}
      {healthData?.healthTrend && (
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> 5-Month Civic Health Score Progress Trend
          </span>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData.healthTrend}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={theme.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: "bold" }} stroke="#94a3b8" />
                <YAxis domain={[30, 100]} tick={{ fontSize: 11, fontWeight: "bold" }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke={theme.color} strokeWidth={2} fillOpacity={1} fill="url(#colorHealth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
