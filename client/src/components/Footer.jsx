import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Building2, Shield, PhoneCall, Mail, MapPin, Globe, CheckCircle2, Lock, 
  X, FileText, AlertTriangle, Search, Users, BarChart3, Clock, Check, Info, ExternalLink 
} from "lucide-react";

import { INDIAN_MUNICIPAL_HIERARCHY, searchAllPanIndiaWards, getOrCreateWardInfo } from "../data/municipalHierarchy";

export default function Footer() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const isOfficerOrAdmin = token && (userRole === "officer" || userRole === "superadmin");

  // Modal State for Informational Footer Links
  const [modalType, setModalType] = useState(null);

  // Cascading Municipal Hierarchy States
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bengaluru Urban (BBMP)");
  const [selectedZone, setSelectedZone] = useState("North Zone");
  const [selectedWardId, setSelectedWardId] = useState("KA-BBMP-101");

  // Live Pan-India Ward Search State
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 relative">
      {/* Upper Helpline Strip */}
      <div className="bg-blue-950/80 border-b border-blue-900/60 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-900/80 border border-blue-700 flex items-center justify-center text-amber-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-300 font-medium">National Civic Response Desk</p>
              <a href="tel:18001112470" className="text-sm font-bold text-white tracking-wide hover:text-amber-300 transition">
                1800-111-2470 (Toll Free 24x7)
              </a>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>WCAG 2.1 AA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-300">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Government Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center border border-blue-800">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Smart Civic Portal</h3>
                <p className="text-[11px] text-slate-400">Public Infrastructure Monitoring</p>
              </div>
            </div>
            <p className="leading-relaxed text-slate-400 text-xs">
              Official e-governance platform designed for real-time monitoring, tracking, and resolution of civic complaints across municipal jurisdictions.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Ministry of Urban & Municipal Affairs</span>
            </div>
          </div>

          {/* Col 2: Citizen Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
              Citizen Services
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/register" className="hover:text-white transition flex items-center gap-1.5">
                  &rsaquo; Register New Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition flex items-center gap-1.5">
                  &rsaquo; Track Complaint Status
                </Link>
              </li>
              <li>
                <Link to="/closed-complaints" className="hover:text-white transition flex items-center gap-1.5">
                  &rsaquo; Resolved Public Archives
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setModalType("priority")} 
                  className="hover:text-white transition flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  &rsaquo; Service Priority Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setModalType("ward")} 
                  className="hover:text-white transition flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  &rsaquo; Municipal Ward Locator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Role-Specific Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
              {isOfficerOrAdmin ? "Officer Management" : "Public Resources"}
            </h4>
            <ul className="space-y-2.5">
              {isOfficerOrAdmin ? (
                <>
                  <li>
                    <Link to="/admin" className="hover:text-white transition flex items-center gap-1.5 text-amber-300">
                      &rsaquo; Officer Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/service-config" className="hover:text-white transition flex items-center gap-1.5">
                      &rsaquo; Service Configuration Rules
                    </Link>
                  </li>
                  {userRole === "superadmin" && (
                    <li>
                      <Link to="/superadmin" className="hover:text-white transition flex items-center gap-1.5 text-amber-400 font-bold">
                        &rsaquo; SuperAdmin Master Control
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <button 
                      onClick={() => setModalType("charter")} 
                      className="hover:text-white transition flex items-center gap-1.5 text-left w-full cursor-pointer"
                    >
                      &rsaquo; Citizen Charter & SLA
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setModalType("escalation")} 
                      className="hover:text-white transition flex items-center gap-1.5 text-left w-full cursor-pointer"
                    >
                      &rsaquo; Escalation Protocol Guidelines
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setModalType("transparency")} 
                      className="hover:text-white transition flex items-center gap-1.5 text-left w-full cursor-pointer"
                    >
                      &rsaquo; Public Transparency Reports
                    </button>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-white transition flex items-center gap-1.5">
                      &rsaquo; Citizen Account Sign In
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 border-b border-slate-800 pb-2">
              Grievance & Contact
            </h4>
            <div className="space-y-3 text-xs">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <a href="mailto:support-civic@gov.in" className="hover:text-white transition underline underline-offset-2">
                  support-civic@gov.in
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <button onClick={() => setModalType("portalInfo")} className="hover:text-white transition flex items-center gap-1 cursor-pointer">
                  <span>www.smartcivic.gov.in</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </button>
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <p className="font-semibold text-slate-200">Public Grievance Officer</p>
                <p className="text-[11px]">Room 402, Municipal Secretariat</p>
                <p className="text-[10px] text-blue-400">Timings: Mon-Fri (10:00 AM - 5:00 PM)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} Smart Civic Issue Monitoring System. All Rights Reserved. Government Digital Infrastructure.</p>
          <div className="flex gap-4">
            <button onClick={() => setModalType("privacy")} className="hover:text-slate-300 transition cursor-pointer">
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button onClick={() => setModalType("terms")} className="hover:text-slate-300 transition cursor-pointer">
              Terms of Service
            </button>
            <span>&bull;</span>
            <button onClick={() => setModalType("accessibility")} className="hover:text-slate-300 transition cursor-pointer">
              Accessibility Statement
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modal Dialog */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-400">
                  {modalType === "priority" && <Clock className="w-4 h-4" />}
                  {modalType === "ward" && <MapPin className="w-4 h-4" />}
                  {modalType === "charter" && <FileText className="w-4 h-4" />}
                  {modalType === "escalation" && <AlertTriangle className="w-4 h-4" />}
                  {modalType === "transparency" && <BarChart3 className="w-4 h-4" />}
                  {modalType === "privacy" && <Shield className="w-4 h-4" />}
                  {modalType === "terms" && <FileText className="w-4 h-4" />}
                  {modalType === "accessibility" && <CheckCircle2 className="w-4 h-4" />}
                  {modalType === "portalInfo" && <Globe className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-white capitalize">
                  {modalType === "priority" && "Service Priority Guidelines & SLA"}
                  {modalType === "ward" && "Municipal Ward Locator"}
                  {modalType === "charter" && "Citizen Charter & Service Commitments"}
                  {modalType === "escalation" && "Escalation Protocol Guidelines"}
                  {modalType === "transparency" && "Public Transparency & Metrics Report"}
                  {modalType === "privacy" && "Privacy Policy"}
                  {modalType === "terms" && "Terms of Service"}
                  {modalType === "accessibility" && "Accessibility Statement"}
                  {modalType === "portalInfo" && "Smart Civic Infrastructure Portal Information"}
                </h3>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-300 text-sm">
              {/* Priority Guidelines */}
              {modalType === "priority" && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs">
                    Civic complaints are automatically categorized and assigned Service Level Agreements (SLAs) based on severity and public safety impact.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg">
                      <span className="font-bold text-red-400 text-xs uppercase px-2 py-0.5 rounded bg-red-900/60 mr-2">High Priority</span>
                      <strong className="text-white">Resolution SLA: 12 - 24 Hours</strong>
                      <p className="text-xs text-slate-300 mt-1">Hazardous live wires, major water main bursts, gas leaks, sewage contamination in drinking lines.</p>
                    </div>
                    <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg">
                      <span className="font-bold text-amber-400 text-xs uppercase px-2 py-0.5 rounded bg-amber-900/60 mr-2">Medium Priority</span>
                      <strong className="text-white">Resolution SLA: 24 - 48 Hours</strong>
                      <p className="text-xs text-slate-300 mt-1">Solid waste overflow, broken streetlights in residential blocks, blocked storm drains.</p>
                    </div>
                    <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg">
                      <span className="font-bold text-blue-400 text-xs uppercase px-2 py-0.5 rounded bg-blue-900/60 mr-2">Standard Priority</span>
                      <strong className="text-white">Resolution SLA: 3 - 5 Days</strong>
                      <p className="text-xs text-slate-300 mt-1">Road potholes, broken pavement tiles, park maintenance, stray animal reporting.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ward Locator */}
              {modalType === "ward" && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs">
                    Search any Ward, City, Corporation, or District across India, or browse using State & Corporation dropdowns below.
                  </p>

                  {/* Live Pan-India Instant Search Input */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 text-blue-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search any Ward, City (e.g. Bandra, Indiranagar, Gomti Nagar, DLF)..."
                        className="w-full bg-slate-950 border border-blue-900/80 rounded-xl pl-9 pr-4 py-2 text-white text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Instant Search Results Dropdown */}
                    {searchQuery.trim().length >= 2 && (
                      <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-800">
                        {searchAllPanIndiaWards(searchQuery).length === 0 ? (
                          <div className="p-3 text-[11px] text-slate-400 text-center">
                            No pre-indexed ward matching "{searchQuery}". Use manual State/District filters below for full coverage.
                          </div>
                        ) : (
                          searchAllPanIndiaWards(searchQuery).map((res) => (
                            <button
                              key={res.id}
                              onClick={() => {
                                setSelectedState(res.state);
                                setSelectedDistrict(res.district);
                                setSelectedZone(res.zone);
                                setSelectedWardId(res.id);
                                setSearchQuery("");
                              }}
                              className="w-full text-left p-2.5 hover:bg-blue-950/60 transition flex justify-between items-center text-xs"
                            >
                              <div>
                                <p className="font-bold text-white">{res.name}</p>
                                <p className="text-[10px] text-slate-400">{res.district} • {res.state}</p>
                              </div>
                              <span className="text-[10px] text-amber-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">
                                {res.zone}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cascading State -> District -> Zone -> Ward Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    {/* State Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">1. Select State / UT (28 States + 8 UTs):</label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setSelectedState(newState);
                          const districts = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[newState] || {});
                          const newDist = districts[0] || "";
                          setSelectedDistrict(newDist);
                          const zones = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[newState]?.[newDist] || {});
                          const newZone = zones[0] || "";
                          setSelectedZone(newZone);
                          const wards = INDIAN_MUNICIPAL_HIERARCHY[newState]?.[newDist]?.[newZone] || [];
                          setSelectedWardId(wards[0]?.id || "");
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {Object.keys(INDIAN_MUNICIPAL_HIERARCHY).map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* District / Corporation Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">2. Select District / Corporation:</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          const newDist = e.target.value;
                          setSelectedDistrict(newDist);
                          const zones = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[newDist] || {});
                          const newZone = zones[0] || "";
                          setSelectedZone(newZone);
                          const wards = INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[newDist]?.[newZone] || [];
                          setSelectedWardId(wards[0]?.id || "");
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {Object.keys(INDIAN_MUNICIPAL_HIERARCHY[selectedState] || {}).map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zone Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">3. Select Zonal Division:</label>
                      <select
                        value={selectedZone}
                        onChange={(e) => {
                          const newZone = e.target.value;
                          setSelectedZone(newZone);
                          const wards = INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[selectedDistrict]?.[newZone] || [];
                          setSelectedWardId(wards[0]?.id || "");
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {Object.keys(INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[selectedDistrict] || {}).map((zone) => (
                          <option key={zone} value={zone}>{zone}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ward Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">4. Select Ward:</label>
                      <select
                        value={selectedWardId}
                        onChange={(e) => setSelectedWardId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {(INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[selectedDistrict]?.[selectedZone] || []).map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Resolved Ward Details Card */}
                  {(() => {
                    const ward = getOrCreateWardInfo(selectedState, selectedDistrict, selectedZone, selectedWardId);
                    return (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 shadow-lg">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-emerald-400" />
                              {ward.name}
                            </h4>
                            <p className="text-[10px] text-slate-400">{selectedDistrict} • {selectedState}</p>
                          </div>
                          <span className="text-xs text-amber-300 font-bold px-2.5 py-0.5 bg-blue-950 border border-blue-800 rounded-md">
                            {selectedZone}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <p><strong className="text-slate-200">Zonal Nodal Officer:</strong> <span className="text-slate-300">{ward.officer}</span></p>
                          <p><strong className="text-slate-200">Official Helpline:</strong> <a href={`tel:${ward.phone}`} className="text-amber-300 hover:underline font-bold">{ward.phone}</a></p>
                          <p className="sm:col-span-2"><strong className="text-slate-200">Secretariat Office:</strong> <span className="text-slate-300">{ward.office}</span></p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Citizen Charter */}
              {modalType === "charter" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm">Key Guarantees & Citizen Rights</h4>
                  <ul className="space-y-2 text-xs list-disc pl-4 text-slate-300">
                    <li><strong>Guaranteed Registration:</strong> Every registered complaint receives an official 12-digit tracking reference code.</li>
                    <li><strong>Real-time Audit Trail:</strong> Citizens can monitor status updates from receipt to field deployment and final photo verification.</li>
                    <li><strong>Zero Friction Redressal:</strong> Automated escalation if an issue remains unaddressed past the designated SLA deadline.</li>
                    <li><strong>Feedback Right:</strong> Re-open a ticket within 48 hours if the field resolution is unsatisfactory.</li>
                  </ul>
                </div>
              )}

              {/* Escalation Guidelines */}
              {modalType === "escalation" && (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs">If a grievance exceeds its SLA without resolution, it automatically escalates up the municipal administrative chain:</p>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-950 border-l-4 border-blue-500 rounded">
                      <strong className="text-white">Level 1 — Ward Field Officer</strong>
                      <p className="text-slate-400 text-[11px]">Assigned immediately upon grievance submission (0 to SLA expiry).</p>
                    </div>
                    <div className="p-3 bg-slate-950 border-l-4 border-amber-500 rounded">
                      <strong className="text-white">Level 2 — Zonal Executive Engineer</strong>
                      <p className="text-slate-400 text-[11px]">Auto-escalated when ticket breaches initial SLA without field dispatch.</p>
                    </div>
                    <div className="p-3 bg-slate-950 border-l-4 border-red-500 rounded">
                      <strong className="text-white">Level 3 — Municipal Grievance Commissioner</strong>
                      <p className="text-slate-400 text-[11px]">Direct intervention for unresolved critical complaints older than 96 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Transparency Reports */}
              {modalType === "transparency" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <p className="text-lg font-bold text-emerald-400">94.8%</p>
                      <p className="text-[11px] text-slate-400">Resolution Efficiency</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <p className="text-lg font-bold text-blue-400">34 Hours</p>
                      <p className="text-[11px] text-slate-400">Average Turnaround Time</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <p className="text-lg font-bold text-amber-400">12,480+</p>
                      <p className="text-[11px] text-slate-400">Total Solved Grievances</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <p className="text-lg font-bold text-purple-400">4.6 / 5.0</p>
                      <p className="text-[11px] text-slate-400">Citizen Satisfaction</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">Data updated in real time via the Municipal Central Database.</p>
                </div>
              )}

              {/* Privacy Policy */}
              {modalType === "privacy" && (
                <div className="space-y-3 text-xs">
                  <p><strong>1. Data Collection:</strong> We collect essential contact information (name, phone, location coordinates, uploaded images) strictly for resolving reported civic grievances.</p>
                  <p><strong>2. Information Protection:</strong> All data is stored with 256-bit SSL encryption. Personal credentials are never sold or shared with third parties.</p>
                  <p><strong>3. Officer Access:</strong> Only authorized municipal field officers assigned to your ward can view complaint contact details.</p>
                </div>
              )}

              {/* Terms of Service */}
              {modalType === "terms" && (
                <div className="space-y-3 text-xs">
                  <p><strong>1. Acceptable Use:</strong> Users must submit authentic, clear photographs and precise locations of civic issues within municipal jurisdiction.</p>
                  <p><strong>2. Prohibition of Misuse:</strong> Spamming, submitting false complaints, or uploading offensive non-civic content will result in IP blocking and account suspension.</p>
                  <p><strong>3. Municipal Responsibility:</strong> SLA response times are target guidelines; emergency service dispatches are prioritized during severe weather or public disasters.</p>
                </div>
              )}

              {/* Portal Info */}
              {modalType === "portalInfo" && (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-300">
                    <strong>Smart Civic Infrastructure Portal</strong> is the official e-governance application for real-time reporting, routing, and tracking of civic grievances across municipal jurisdictions.
                  </p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                    <p className="font-semibold text-white">Domain & Endpoint Info</p>
                    <p className="text-[11px] text-blue-400">Current Local Server URL: http://localhost:5173</p>
                    <p className="text-[11px] text-slate-400">Official Municipal Subdomain: www.smartcivic.gov.in (Development Sandbox)</p>
                  </div>
                  <p className="text-slate-400">All registered complaints are saved directly to the central MongoDB database and assigned to municipal officers.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

