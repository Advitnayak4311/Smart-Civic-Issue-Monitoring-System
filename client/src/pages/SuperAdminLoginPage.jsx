import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Crown,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Sparkles
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "superadmin@gov.in",
    password: "admin",
    passcode: "admin123"
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleQuickSuperAdminLogin = () => {
    localStorage.setItem("token", "superadmin_master_token_" + Date.now());
    localStorage.setItem("userRole", "superadmin");
    navigate("/superadmin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (formData.passcode !== "admin123" && formData.password !== "admin123" && formData.password !== "admin") {
        setError("Invalid Master Passcode. SuperAdmin Security verification failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", "superadmin_master_token_" + Date.now());
      localStorage.setItem("userRole", "superadmin");
      navigate("/superadmin");
    } catch (err) {
      console.error(err);
      setError("Unable to authenticate SuperAdmin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-900 text-white">
      <div>
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid lg:grid-cols-12">
            {/* Left Column: Executive Master Governance Banner */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-950/60 via-slate-950 to-indigo-950 p-8 flex flex-col justify-between space-y-6 border-r border-slate-800">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border border-amber-400 font-extrabold">
                  <Crown className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                    Master Executive Level
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">
                    SuperAdmin Master Portal
                  </h2>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Exclusive master oversight portal for Chief Municipal Commissioners & System Administrators.
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-[11px] text-amber-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>System-wide Officer & Citizen Role Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Master Grievance Audit & Override Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Master Passcode Verification Required</span>
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition pt-4 border-t border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Citizen View
              </Link>
            </div>

            {/* Right Column: Dedicated SuperAdmin Passcode Form */}
            <div className="lg:col-span-7 p-8 space-y-6 bg-slate-900">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" /> Executive Master Sign In
                </h3>
                <p className="text-xs text-slate-400">
                  Enter master commissioner credentials and passcode to access system governance.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Executive Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="commissioner@municipal.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">SuperAdmin Password *</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter SuperAdmin password..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:ring-2 focus:ring-amber-500 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1 bg-amber-950/50 p-4 rounded-xl border border-amber-800/80 space-y-2">
                  <label className="block font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" /> Master Passcode Key *
                  </label>
                  <input
                    type="password"
                    name="passcode"
                    required
                    value={formData.passcode}
                    onChange={handleChange}
                    placeholder="Enter Master Passcode (admin123)..."
                    className="w-full p-2.5 rounded-xl border border-amber-700 bg-slate-950 text-amber-300 font-extrabold focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                  <p className="text-[10px] text-amber-400 font-medium">Demo Master Passcode: <strong>admin123</strong></p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 border border-amber-400 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Master Passcode...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" /> Authenticate & Open SuperAdmin Portal
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
