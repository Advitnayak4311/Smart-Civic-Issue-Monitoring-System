import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Maximize2,
  MapPin,
  Calendar,
} from "lucide-react";

export default function BeforeAfterGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetchGallery(true);

    // 3-Second Real-Time Live Polling Engine
    const intervalId = setInterval(() => {
      fetchGallery(false);
    }, 3000);

    const handleLiveEvent = () => fetchGallery(false);
    window.addEventListener("scms_complaint_registered", handleLiveEvent);
    window.addEventListener("storage", handleLiveEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("scms_complaint_registered", handleLiveEvent);
      window.removeEventListener("storage", handleLiveEvent);
    };
  }, []);

  const fetchGallery = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("http://localhost:8000/api/transparency/gallery");
      const data = await res.json();
      if (data.success && Array.isArray(data.gallery)) {
        setGallery(data.gallery);
      }
    } catch (err) {
      console.error("Fetch Gallery Error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-10 text-center text-slate-500 font-bold text-xs shadow-md space-y-3">
        <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Loading Verified Remediation Photo Records...</p>
      </div>
    );
  }

  if (gallery.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 text-center text-slate-500 font-medium text-xs shadow-md space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-sm text-slate-900">Remediation Photo Audit Stream</h3>
        <p className="max-w-md mx-auto text-slate-500">
          Completed municipal repair photo records will automatically appear here once field inspectors record remediation evidence.
        </p>
      </div>
    );
  }

  const current = gallery[activeIdx] || gallery[0];

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl space-y-6 overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Proof of Civic Remediation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Before & After Resolution Gallery
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 max-w-xl">
            Side-by-side photographic evidence comparing initial citizen grievance reports against verified municipal field repairs.
          </p>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-2xl border border-slate-800 shadow-sm shrink-0">
          <button
            onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Previous record"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black px-2 tracking-wider">
            {activeIdx + 1} / {gallery.length}
          </span>
          <button
            onClick={() => setActiveIdx((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Next record"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: BEFORE Photo */}
        <div className="bg-slate-900/5 rounded-2xl border border-red-200/80 overflow-hidden flex flex-col justify-between shadow-xs group">
          <div className="bg-linear-to-r from-red-900 to-red-800 text-white px-4 py-2.5 flex justify-between items-center text-xs font-black">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              BEFORE REMEDIATION
            </span>
            <span className="bg-red-950/80 text-red-200 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border border-red-700">
              Original Citizen Report
            </span>
          </div>

          <div className="p-3 flex-1 flex items-center justify-center bg-slate-100/70 min-h-[240px] sm:min-h-[280px] relative">
            {current.beforeImage ? (
              <div className="relative w-full h-full group overflow-hidden rounded-xl">
                <img
                  src={current.beforeImage}
                  alt="Before Remediation"
                  className="w-full h-60 sm:h-72 object-cover rounded-xl shadow-xs transition duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setLightboxImg(current.beforeImage)}
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
                  title="Expand image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs font-bold space-y-2 p-6">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
                <p>Initial citizen issue photo recorded into municipal database.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: AFTER Photo */}
        <div className="bg-slate-900/5 rounded-2xl border border-emerald-200/80 overflow-hidden flex flex-col justify-between shadow-xs group">
          <div className="bg-linear-to-r from-emerald-900 to-emerald-800 text-white px-4 py-2.5 flex justify-between items-center text-xs font-black">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              AFTER REMEDIATION
            </span>
            <span className="bg-emerald-950/80 text-emerald-200 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold border border-emerald-700">
              Verified Municipal Fix
            </span>
          </div>

          <div className="p-3 flex-1 flex items-center justify-center bg-slate-100/70 min-h-[240px] sm:min-h-[280px] relative">
            {current.afterImage ? (
              <div className="relative w-full h-full group overflow-hidden rounded-xl">
                <img
                  src={current.afterImage}
                  alt="After Remediation"
                  className="w-full h-60 sm:h-72 object-cover rounded-xl shadow-xs transition duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setLightboxImg(current.afterImage)}
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
                  title="Expand image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs font-bold space-y-2 p-6">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <p>Municipal repair verified & resolution certified by inspector.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Summary Footer */}
      <div className="bg-linear-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-black text-blue-950">Grievance Ref #{current.complaintId}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="font-bold text-slate-700">{current.category} ({current.issue})</span>
          </div>
          <p className="text-blue-900 italic">
            "{current.resolutionNotes}"
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 bg-blue-900 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Field Audit Verified
          </span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Full Resolution Proof"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-center text-white/80 text-xs mt-2 font-bold">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
