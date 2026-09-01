import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { PieChart as PieIcon, BarChart3, ShieldCheck, Building2 } from "lucide-react";

export default function AnalyticsCharts({
  chartData = [],
  COLORS = ["#d97706", "#2563eb", "#6366f1", "#059669", "#dc2626"],
  monthlyData = [],
  confidenceData = [],
  departmentData = [],
}) {
  // Fallbacks if confidenceData or departmentData not explicitly passed
  const activeStatusData = (chartData || []).filter((d) => d.value > 0);
  const activeConfidenceData = (confidenceData || []).filter((d) => d.value > 0);
  const activeDeptData = (departmentData || []).filter((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Chart 1: Lifecycle Status Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">Complaint Lifecycle Distribution</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Real-Time Live
          </span>
        </div>

        <div className="w-full h-72">
          {activeStatusData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
              No complaint status records found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.fill || COLORS[index % COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Grievance Authenticity & Confidence Rating */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Grievance Authenticity & Confidence</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Field Verification
          </span>
        </div>

        <div className="w-full h-72">
          {activeConfidenceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
              No confidence rating records found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {confidenceData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.fill || entry.color || "#16a34a"}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 3: Department Grievance Workload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">Department Workload Distribution</h3>
          </div>
          <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Division Load
          </span>
        </div>

        <div className="w-full h-72">
          {activeDeptData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
              No department workload records available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData.slice(0, 6)}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Grievances"
                  fill="#1e3a8a"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 4: Monthly Grievance Filing Volume */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-900" />
            <h3 className="text-sm font-bold text-slate-900">Monthly Grievance Filing Trend</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Timeline
          </span>
        </div>

        <div className="w-full h-72">
          {monthlyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
              No timeline filing records available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="complaints"
                  name="Complaints"
                  fill="#4338ca"
                  radius={[6, 6, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}