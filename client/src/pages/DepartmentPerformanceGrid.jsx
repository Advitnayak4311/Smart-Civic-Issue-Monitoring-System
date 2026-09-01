import { useState, useEffect } from "react";
import { Building2, Award, Clock, Star, ShieldAlert, CheckCircle2, TrendingUp, Filter } from "lucide-react";

export default function DepartmentPerformanceGrid() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("grade");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/admin/department-performance");
      const data = await res.json();
      if (data.success && Array.isArray(data.departments)) {
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error("Fetch Department Performance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortedDepartments = [...departments].sort((a, b) => {
    if (sortBy === "grade") return a.slaCompliancePercent < b.slaCompliancePercent ? 1 : -1;
    if (sortBy === "pending") return b.pending - a.pending;
    if (sortBy === "sla") return b.slaCompliancePercent - a.slaCompliancePercent;
    if (sortBy === "speed") return parseFloat(a.avgResolutionDays) - parseFloat(b.avgResolutionDays);
    if (sortBy === "rating") return parseFloat(b.citizenRating) - parseFloat(a.citizenRating);
    return 0;
  });

  const getGradeStyle = (grade) => {
    switch (grade) {
      case "A+":
        return "bg-emerald-500 text-white border-emerald-600 shadow-sm";
      case "A":
        return "bg-blue-600 text-white border-blue-700 shadow-sm";
      case "B":
        return "bg-amber-500 text-white border-amber-600 shadow-sm";
      case "C":
        return "bg-orange-500 text-white border-orange-600 shadow-sm";
      default:
        return "bg-red-600 text-white border-red-700 shadow-sm";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            Executive Governance Metric
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Department Performance Index & Letter Grades
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Automated SLA efficiency ratings, resolution speed, and citizen satisfaction scores across municipal divisions.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-600">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="grade">Performance Grade (Highest)</option>
            <option value="sla">SLA Compliance %</option>
            <option value="pending">Pending Tickets (Highest)</option>
            <option value="speed">Resolution Speed (Fastest)</option>
            <option value="rating">Citizen Rating (Highest)</option>
          </select>
        </div>
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          Calculating Department SLA Performance Metrics...
        </div>
      ) : sortedDepartments.length === 0 ? (
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          No department data available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDepartments.map((dept) => (
            <div
              key={dept.department}
              className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-2xs transition flex flex-col justify-between space-y-4 hover:border-slate-300"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-3 border-b border-slate-200/80 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Municipal Division
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{dept.department}</h3>
                </div>

                {/* Grade Badge */}
                <div className="flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base border ${getGradeStyle(dept.grade)}`}>
                    {dept.grade}
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-500 mt-1 uppercase">Grade</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SLA Compliance</span>
                  <p className="font-extrabold text-emerald-700 text-base">{dept.slaCompliancePercent}%</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Speed</span>
                  <p className="font-extrabold text-blue-900 text-base">{dept.avgResolutionDays} Days</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Tickets</span>
                  <p className="font-extrabold text-amber-800 text-sm">{dept.pending} Tickets</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Rating</span>
                  {dept.citizenRating ? (
                    <p className="font-extrabold text-amber-600 text-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {dept.citizenRating} / 5.0
                    </p>
                  ) : (
                    <p className="font-bold text-slate-400 text-xs italic mt-0.5">Pending Feedback</p>
                  )}
                </div>
              </div>

              {/* Footer Summary */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-bold border-t border-slate-200/80 pt-2.5">
                <span>Assigned: {dept.totalAssigned} Tickets</span>
                <span>Resolved: {dept.completed + dept.closed}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
