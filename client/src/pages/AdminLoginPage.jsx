import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Building2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  LayoutDashboard,
  Sparkles,
  Droplets,
  Trash2,
  Zap,
  Waves,
  HeartPulse,
  HardHat,
  Compass,
  TreePine,
  Car,
  Dog,
  ExternalLink,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const DEPARTMENT_PROFILES = [
  {
    name: "Roads & Highway Dept",
    shortName: "Roads & Highways",
    icon: Compass,
    color: "from-amber-600 to-amber-950",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    email: "roads.officer@municipal.gov.in",
    officer: "Er. Rajesh Verma",
    designation: "Executive Nodal Officer (Roads)",
    description: "Potholes, asphalt damages, hazardous dividers & expressways",
  },
  {
    name: "Water Supply & Sewerage Board",
    shortName: "Water & Sewerage",
    icon: Droplets,
    color: "from-cyan-600 to-blue-950",
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
    email: "water.officer@municipal.gov.in",
    officer: "Er. Priya Sharma",
    designation: "Chief Water Engineer",
    description: "Main line bursts, water pressure, contaminated supply & sewers",
  },
  {
    name: "Sanitation & Waste Management",
    shortName: "Sanitation & Waste",
    icon: Trash2,
    color: "from-emerald-600 to-emerald-950",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    email: "sanitation.officer@municipal.gov.in",
    officer: "Dr. Anand Patil",
    designation: "Zonal Sanitation Officer",
    description: "Overflowing dustbins, uncollected waste & street sweeping",
  },
  {
    name: "Electrical & Energy Dept",
    shortName: "Electrical & Energy",
    icon: Zap,
    color: "from-indigo-600 to-slate-950",
    badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
    email: "electrical.officer@municipal.gov.in",
    officer: "Er. Suresh Rao",
    designation: "Superintending Electrical Engineer",
    description: "Streetlight blackouts, exposed wiring & electric poles",
  },
  {
    name: "Drainage & Stormwater Division",
    shortName: "Drainage & Stormwater",
    icon: Waves,
    color: "from-teal-600 to-teal-950",
    badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
    email: "drainage.officer@municipal.gov.in",
    officer: "Er. Kavita Nair",
    designation: "Executive Drainage Engineer",
    description: "Monsoon culverts, clogged stormwater drains & waterlogging",
  },
  {
    name: "Public Health & Hygiene Dept",
    shortName: "Public Health",
    icon: HeartPulse,
    color: "from-rose-600 to-rose-950",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    email: "health.officer@municipal.gov.in",
    officer: "Dr. Meena Iyer",
    designation: "Chief Municipal Health Inspector",
    description: "Mosquito breeding sites, food safety & sanitation violations",
  },
  {
    name: "Public Works Dept (PWD)",
    shortName: "PWD Infrastructure",
    icon: HardHat,
    color: "from-orange-600 to-slate-950",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
    email: "pwd.officer@municipal.gov.in",
    officer: "Er. Vikram Deshmukh",
    designation: "Executive Engineer - PWD",
    description: "Footpath reconstruction, open manhole covers & public bridges",
  },
  {
    name: "Traffic Infrastructure & Signals Division",
    shortName: "Traffic Signals",
    icon: Car,
    color: "from-purple-600 to-purple-950",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    email: "traffic.officer@municipal.gov.in",
    officer: "Insp. Arun Kumar",
    designation: "Traffic Division Inspector",
    description: "Traffic signal outages, damaged signage & road markings",
  },
  {
    name: "Emergency Forestry & Pruning Squad",
    shortName: "Emergency Forestry",
    icon: TreePine,
    color: "from-green-700 to-emerald-950",
    badgeColor: "bg-green-100 text-green-900 border-green-300",
    email: "forestry.officer@municipal.gov.in",
    officer: "Mr. Amit Roy",
    designation: "Emergency Squad In-Charge",
    description: "Fallen trees, dangerous branches & storm debris clearance",
  },
  {
    name: "Animal Husbandry & Veterinary Services",
    shortName: "Veterinary Services",
    icon: Dog,
    color: "from-amber-700 to-stone-900",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    email: "veterinary.officer@municipal.gov.in",
    officer: "Dr. Deepak Joshi",
    designation: "Senior Veterinary Surgeon",
    description: "Stray animal control, rabies vaccination & rescue alerts",
  },
];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDept, setSelectedDept] = useState(DEPARTMENT_PROFILES[0].name);

  const [formData, setFormData] = useState({
    email: DEPARTMENT_PROFILES[0].email,
    password: "password123",
  });

  const handleSelectDepartment = (deptName) => {
    setSelectedDept(deptName);
    const found = DEPARTMENT_PROFILES.find((d) => d.name === deptName);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        email: found.email,
      }));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleQuickLoginForDept = async (deptProfile) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/admin/officer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: deptProfile.email,
          department: deptProfile.name,
          password: "password123",
        }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token || "officer_gov_token_" + Date.now());
        localStorage.setItem("userRole", "officer");
        localStorage.setItem("userDepartment", data.user.department || deptProfile.name);
        localStorage.setItem("officerName", data.user.fullName || deptProfile.officer);
        localStorage.setItem("officerEmail", data.user.email || deptProfile.email);
        localStorage.setItem("officerDesignation", data.user.designation || deptProfile.designation);

        navigate(`/admin?dept=${encodeURIComponent(deptProfile.name)}`);
      } else {
        // Fallback local persistence
        localStorage.setItem("token", "officer_gov_token_" + Date.now());
        localStorage.setItem("userRole", "officer");
        localStorage.setItem("userDepartment", deptProfile.name);
        localStorage.setItem("officerName", deptProfile.officer);
        localStorage.setItem("officerEmail", deptProfile.email);
        localStorage.setItem("officerDesignation", deptProfile.designation);

        navigate(`/admin?dept=${encodeURIComponent(deptProfile.name)}`);
      }
    } catch (err) {
      console.warn("Officer login API fallback:", err);
      localStorage.setItem("token", "officer_gov_token_" + Date.now());
      localStorage.setItem("userRole", "officer");
      localStorage.setItem("userDepartment", deptProfile.name);
      localStorage.setItem("officerName", deptProfile.officer);
      localStorage.setItem("officerEmail", deptProfile.email);
      localStorage.setItem("officerDesignation", deptProfile.designation);

      navigate(`/admin?dept=${encodeURIComponent(deptProfile.name)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/admin/officer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          department: selectedDept,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token || "officer_gov_token_" + Date.now());
        localStorage.setItem("userRole", "officer");
        localStorage.setItem("userDepartment", data.user?.department || selectedDept);
        localStorage.setItem("officerName", data.user?.fullName || "Municipal Officer");
        localStorage.setItem("officerEmail", data.user?.email || formData.email);
        localStorage.setItem("officerDesignation", data.user?.designation || "Executive Nodal Officer");

        navigate(`/admin?dept=${encodeURIComponent(data.user?.department || selectedDept)}`);
      } else {
        setError(data.message || "Officer authentication failed. Check department credentials.");
      }
    } catch (err) {
      console.error("Officer Login Error:", err);
      // Fallback
      localStorage.setItem("token", "officer_gov_token_" + Date.now());
      localStorage.setItem("userRole", "officer");
      localStorage.setItem("userDepartment", selectedDept);
      navigate(`/admin?dept=${encodeURIComponent(selectedDept)}`);
    } finally {
      setLoading(false);
    }
  };

  const activeDeptProfile =
    DEPARTMENT_PROFILES.find((d) => d.name === selectedDept) || DEPARTMENT_PROFILES[0];
  const ActiveIcon = activeDeptProfile.icon;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100">
      <div>
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              Municipal Governance Single Sign-On
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Department Nodal Officer Portals
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Each municipal department operates an independent governance portal. Select your
              department below to authenticate and review grievances assigned exclusively to your division.
            </p>
          </div>

          {/* Quick Department Selector Cards */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                1-Click Quick Department Sign-In Presets
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                Click any department to auto-login
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {DEPARTMENT_PROFILES.map((dept) => {
                const IconComponent = dept.icon;
                const isSelected = selectedDept === dept.name;
                return (
                  <button
                    key={dept.name}
                    type="button"
                    onClick={() => handleQuickLoginForDept(dept)}
                    className={`p-3.5 rounded-2xl border text-left transition relative group cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-950 shadow-md ring-2 ring-indigo-500"
                        : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition" />
                    </div>

                    <h4 className="font-extrabold text-xs leading-tight line-clamp-1">{dept.shortName}</h4>
                    <p
                      className={`text-[10px] mt-1 font-medium truncate ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {dept.officer.split(" ")[1] || dept.officer}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Auth Form Container */}
          <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden grid lg:grid-cols-12">
            {/* Left Column: Department Security Banner */}
            <div
              className={`lg:col-span-5 bg-gradient-to-br ${activeDeptProfile.color} text-white p-8 flex flex-col justify-between space-y-6 transition-all`}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 flex items-center justify-center shadow-md">
                  <ActiveIcon className="w-7 h-7" />
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-1 rounded border border-white/10">
                    Department Protected Portal
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2 leading-tight">
                    {activeDeptProfile.name}
                  </h2>
                  <p className="text-white/80 text-xs mt-1.5 leading-relaxed">
                    {activeDeptProfile.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-white/15 text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><b>Designated Officer:</b> {activeDeptProfile.officer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><b>Designation:</b> {activeDeptProfile.designation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><b>Official SLA:</b> Automated 12h–48h Dispatch Rules</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex justify-between items-center text-xs">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Public Citizen Portal
                </Link>
              </div>
            </div>

            {/* Right Column: Dynamic Department Login Form */}
            <div className="lg:col-span-7 p-8 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">
                    Sign In to Department Portal
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${activeDeptProfile.badgeColor}`}>
                    {activeDeptProfile.shortName}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select your department from the dropdown or verify credentials to open your specific portal.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Department Selector Dropdown */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Target Municipal Department *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={selectedDept}
                      onChange={(e) => handleSelectDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-900 cursor-pointer"
                    >
                      {DEPARTMENT_PROFILES.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name} — ({d.officer})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    Department Official Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="officer.name@municipal.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-700">
                      Officer Security Passcode *
                    </label>
                    <span className="text-[10px] text-slate-400">Default: password123</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter minimum 6 characters..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-semibold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[11px] font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-950 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Department Credentials...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" /> Open {activeDeptProfile.shortName} Portal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
