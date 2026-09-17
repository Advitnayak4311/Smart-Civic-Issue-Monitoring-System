import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MunicipalGisMap from "../components/gis/MunicipalGisMap";
import CivicHealthGauge from "../components/gis/CivicHealthGauge";
import WardRankingGrid from "../components/gis/WardRankingGrid";
import { Activity, MapPin, Trophy, ShieldCheck } from "lucide-react";

export default function GisDashboard() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Executive GIS Platform Header */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Smart City GIS & Urban Intelligence Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Municipal Command Center: Spatial Analytics
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              City-wide GIS spatial mapping, complaint density heat maps, comparative ward rankings, and the flagship Civic Health Index.
            </p>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Flagship Civic Health Gauge */}
          <CivicHealthGauge />

          {/* Live Municipal GIS Map */}
          <MunicipalGisMap />

          {/* Ward Ranking System */}
          <WardRankingGrid />
        </div>
      </div>

      <Footer />
    </div>
  );
}
