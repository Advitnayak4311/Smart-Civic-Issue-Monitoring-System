import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CivicHealthGauge from "../components/gis/CivicHealthGauge";
import BeforeAfterGallery from "../components/engagement/BeforeAfterGallery";
import MunicipalGisMap from "../components/gis/MunicipalGisMap";
import CitizenLeaderboard from "../components/engagement/CitizenLeaderboard";
import { ShieldCheck, Lock, Globe, FileText, CheckCircle2, Building2, Activity, Users } from "lucide-react";

export default function PublicTransparencyPortal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransparencyStats();
  }, []);

  const fetchTransparencyStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/transparency/public-stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch Transparency Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Public Portal Executive Header */}
        <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Public Civic Accountability & Governance Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Open Civic Transparency Dashboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Explore live municipal remediation progress, spatial GIS maps, before-and-after resolution galleries, and citizen trust ratings—with strict privacy protection for personal data.
            </p>

            {/* Privacy Redaction Banner */}
            <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded-xl font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Privacy Shield Active: Citizen phone numbers, emails, and exact home addresses are redacted.</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold shrink-0 border border-blue-200">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Grievances</span>
                <p className="text-2xl font-black text-slate-900">{stats?.totalComplaints || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Resolved Grievances</span>
                <p className="text-2xl font-black text-emerald-700">{stats?.resolvedCount || 0}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold shrink-0 border border-amber-200">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Overall Resolution Rate</span>
                <p className="text-2xl font-black text-amber-700">{stats?.resolutionRate || 100}%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold shrink-0 border border-purple-200">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Citizens</span>
                <p className="text-2xl font-black text-purple-900">100% Verified</p>
              </div>
            </div>
          </div>

          {/* Flagship Civic Health Gauge */}
          <CivicHealthGauge />

          {/* Before & After Resolution Gallery */}
          <BeforeAfterGallery />

          {/* Public Municipal GIS Map */}
          <MunicipalGisMap />

          {/* Top Citizen Leaderboard */}
          <CitizenLeaderboard />
        </div>
      </div>

      <Footer />
    </div>
  );
}
