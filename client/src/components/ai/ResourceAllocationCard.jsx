import { useState, useEffect } from "react";
import { Wrench, Truck, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ResourceAllocationCard() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/ai/resource-allocation");
      const data = await res.json();
      if (data.success && Array.isArray(data.allocations)) {
        setAllocations(data.allocations);
      }
    } catch (err) {
      console.error("Fetch Resource Allocations Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 font-bold text-xs shadow-xs">
        Calculating Intelligent Workforce Resource Allocations...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            AI Operations Optimization
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Intelligent Municipal Resource Allocation
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            AI workforce, field crew, and equipment recommendations optimized for pending ticket workloads and SLA deadlines.
          </p>
        </div>

        <span className="text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full">
          Optimization Active
        </span>
      </div>

      {/* Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allocations.map((item, idx) => (
          <div key={idx} className="bg-slate-50/70 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
              <h4 className="font-extrabold text-xs text-slate-900">{item.department}</h4>
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Pending: {item.pendingTickets}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-bold">Workforce Recommendation:</span>
                <span className="font-black text-blue-900">{item.recommendedWorkforce}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-bold">Equipment & Vehicles:</span>
                <span className="font-black text-emerald-800">{item.recommendedEquipment}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
