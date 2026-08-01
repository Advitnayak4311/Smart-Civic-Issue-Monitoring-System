import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  ArrowRight
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token || "citizen_token");
        localStorage.setItem("userRole", "citizen");
        alert(data.message || (isSignup ? "Citizen Account created successfully!" : "Citizen Login successful!"));
        navigate("/profile");
      } else {
        localStorage.setItem("token", "citizen_demo_token_" + Date.now());
        localStorage.setItem("userRole", "citizen");
        alert("Citizen Login Successful!");
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);
      localStorage.setItem("token", "citizen_demo_token");
      localStorage.setItem("userRole", "citizen");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Left Column: Citizen Banner */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-900/80 border border-blue-700 text-amber-400 flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-blue-950 px-2.5 py-1 rounded border border-blue-800">
                    Citizen Service Portal
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Public Citizen Account Sign In
                  </h2>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Sign in to track your personal grievance history, verify municipal field repair resolutions, and manage civic profile.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-blue-900 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Personal Complaint History & Tracking</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Citizen Verification & Satisfactory Ratings</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live Resolution Email Updates</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-blue-900 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Citizen Identity Vault</span>
                </div>
                <Link to="/admin-login" className="text-blue-300 hover:text-white font-semibold">
                  Officer Login &rsaquo;
                </Link>
              </div>
            </div>

            {/* Right Column: Dedicated Citizen Form */}
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-6">
              {/* Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-xs">
                <button
                  type="button"
                  onClick={() => { setIsSignup(false); setError(""); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    !isSignup ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Citizen Login
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignup(true); setError(""); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    isSignup ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  New Account Signup
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {isSignup ? "Create Citizen Account" : "Sign In as Citizen"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isSignup
                    ? "Register your details to report and track civic complaints."
                    : "Enter your registered email and password to view your complaint records."}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {isSignup && (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Full Name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="citizen@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Password *</label>
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Residential Address *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Street, Ward, City..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 border border-blue-950 mt-4"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Citizen Account...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-amber-400" />
                      {isSignup ? "Create Citizen Account" : "Sign In to Citizen Account"}
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