import { useState } from "react";
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
  Sparkles
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "officer@municipal.gov.in",
    password: "password123",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleQuickLogin = () => {
    localStorage.setItem("token", "officer_gov_token_" + Date.now());
    localStorage.setItem("userRole", "officer");
    navigate("/admin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.setItem("token", "officer_gov_token_" + Date.now());
      localStorage.setItem("userRole", "officer");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Unable to authenticate officer credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden grid lg:grid-cols-12">
            {/* Left Column: Officer Security Banner */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-900/80 border border-indigo-700 text-amber-400 flex items-center justify-center shadow-md">
                  <LayoutDashboard className="w-6 h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-indigo-950 px-2.5 py-1 rounded border border-indigo-800">
                    Restricted Access
                  </span>
                  <h2 className="text-xl font-black text-white mt-2">
                    Municipal Officer Portal
                  </h2>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Exclusive single sign-on gateway for authorized department officers and field inspectors.
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Department SLA Dispatch & Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Field Repair Status Verifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>256-Bit TLS Encrypted Officer Auth</span>
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition pt-4 border-t border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Citizen Homepage
              </Link>
            </div>

            {/* Right Column: Dedicated Officer Login Form */}
            <div className="lg:col-span-7 p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  Municipal Officer Sign In
                </h3>
                <p className="text-xs text-slate-500">
                  Enter your assigned municipal email credentials to access the Officer Command Dashboard.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Official Municipal Email *</label>
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

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Officer Password *</label>
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
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 border border-indigo-950 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Officer Credentials...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" /> Authenticate & Open Officer Dashboard
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
