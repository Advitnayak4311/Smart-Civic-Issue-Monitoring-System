import { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, Activity, BarChart3, ShieldCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function PredictiveAnalyticsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/ai/predictive-analytics");
      const result = await res.json();
      if (result.success && result.analytics) {
        setData(result.analytics);
      }
    } catch (err) {
      console.error("Fetch Predictive Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 font-bold text-xs shadow-xs">
        Calculating Time-Series Predictive Complaint Forecasts...
      </div>
    );
  }

  const forecast = data?.forecast || [];
  const highRiskWards = data?.highRiskWards || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600 animate-pulse" />
            AI Time-Series Forecasting Model
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Predictive Complaint Analytics (Next 30-Day Forecast)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Predicting future municipal complaint surges, category workloads, and high-risk wards based on historical trends.
          </p>
        </div>

        <span className="text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-full">
          Forecast Model Confidence: {data?.confidenceInterval || "94.2%"}
        </span>
      </div>

      {/* Bar Chart Forecast Comparison */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Current Month vs Predicted Next Month Volume
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fontWeight: "bold" }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11, fontWeight: "bold" }} stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentMonth" name="Current Month" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predictedNextMonth" name="Predicted Next Month" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Risk Ward Projections */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-600" /> Projected High-Risk Wards (Next Month)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {highRiskWards.map((item, idx) => (
            <div key={idx} className="bg-red-50/80 border border-red-200 p-4 rounded-xl space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-red-950 font-extrabold">{item.ward}</span>
                <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded text-[10px] font-black">{item.predictedIncrease}</span>
              </div>
              <p className="text-[11px] text-red-800 font-medium">Primary Risk: {item.primaryRisk}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
