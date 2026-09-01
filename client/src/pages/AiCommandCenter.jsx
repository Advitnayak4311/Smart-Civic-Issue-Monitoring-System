import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EmergencyBanner from "../components/ai/EmergencyBanner";
import AiOfficerAssistant from "../components/ai/AiOfficerAssistant";
import PredictiveAnalyticsCard from "../components/ai/PredictiveAnalyticsCard";
import ResourceAllocationCard from "../components/ai/ResourceAllocationCard";
import MunicipalGisMap from "../components/gis/MunicipalGisMap";
import { Bot, Activity, ShieldCheck, Cpu, ShieldAlert, Lock } from "lucide-react";

export default function AiCommandCenter() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Strictly restrict AI Command Center to Authorized Municipal Officers
  const isOfficerOrAdmin = Boolean(token) && (userRole === "officer" || userRole === "superadmin" || userRole === "admin");

  if (!isOfficerOrAdmin) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50">
        <div>
          <Navbar />
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Access Denied: Officer Login Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The AI Municipal Command & Predictive Intelligence Platform is restricted to authorized Municipal Officers and Administrators.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin-login")}
              className="py-3 px-6 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 mx-auto border border-blue-950"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Sign In at Officer Portal
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Executive Header */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>National-Level AI Operations Control Room</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Municipal Command & Predictive Intelligence Platform
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Natural language officer assistants, time-series predictive analytics, emergency overrides, and automated resource allocations.
            </p>
          </div>
        </div>

        {/* Command Center Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Emergency Alert Banner */}
          <EmergencyBanner emergencyCount={1} />

          {/* AI Officer Assistant + Resource Allocation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <AiOfficerAssistant />
            </div>
            <div className="lg:col-span-5">
              <ResourceAllocationCard />
            </div>
          </div>

          {/* Time-Series Predictive Analytics */}
          <PredictiveAnalyticsCard />

          {/* Spatial GIS Map */}
          <MunicipalGisMap />
        </div>
      </div>

      <Footer />
    </div>
  );
}
