import { useState, useEffect } from "react";
import { Image, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Building2 } from "lucide-react";

export default function BeforeAfterGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/transparency/gallery");
      const data = await res.json();
      if (data.success && Array.isArray(data.gallery)) {
        setGallery(data.gallery);
      }
    } catch (err) {
      console.error("Fetch Gallery Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 font-bold text-xs shadow-xs">
        Loading Remediation Audit Photo Records...
      </div>
    );
  }

  if (gallery.length === 0) {
    return null;
  }

  const current = gallery[activeIdx] || gallery[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 text-xs font-extrabold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Verified Proof of Remediation
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Before & After Resolution Gallery
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Transparent side-by-side photographic evidence comparing initial citizen reports with completed municipal field repairs.
          </p>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-slate-700">
            {activeIdx + 1} / {gallery.length}
          </span>
          <button
            onClick={() => setActiveIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: BEFORE Photo */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="bg-red-900 text-white px-4 py-2 flex justify-between items-center text-xs font-extrabold">
            <span>BEFORE REPAIR</span>
            <span className="bg-red-800 px-2 py-0.5 rounded text-[10px] uppercase">Original Citizen Report</span>
          </div>

          <div className="p-4 flex-1 flex items-center justify-center bg-slate-100 min-h-[220px]">
            {current.beforeImage ? (
              <img
                src={current.beforeImage}
                alt="Before Repair"
                className="max-h-60 rounded-xl object-cover shadow-xs border border-slate-200"
              />
            ) : (
              <div className="text-center text-slate-400 text-xs font-bold space-y-1">
                <Image className="w-8 h-8 mx-auto text-slate-300" />
                <p>Before photo evidence verified by citizen</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AFTER Photo */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="bg-emerald-900 text-white px-4 py-2 flex justify-between items-center text-xs font-extrabold">
            <span>AFTER REPAIR</span>
            <span className="bg-emerald-800 px-2 py-0.5 rounded text-[10px] uppercase">Verified Remediation</span>
          </div>

          <div className="p-4 flex-1 flex items-center justify-center bg-slate-100 min-h-[220px]">
            {current.afterImage ? (
              <img
                src={current.afterImage}
                alt="After Repair"
                className="max-h-60 rounded-xl object-cover shadow-xs border border-slate-200"
              />
            ) : (
              <div className="text-center text-slate-400 text-xs font-bold space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p>Municipal repair verified & completed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Summary Footer */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
        <div>
          <span className="font-extrabold text-blue-950">Grievance Ref #{current.complaintId} &rsaquo; {current.category}</span>
          <p className="text-blue-900 mt-0.5">"{current.resolutionNotes}"</p>
        </div>

        <span className="inline-flex items-center gap-1 bg-blue-900 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Field Audit Verified
        </span>
      </div>
    </div>
  );
}
