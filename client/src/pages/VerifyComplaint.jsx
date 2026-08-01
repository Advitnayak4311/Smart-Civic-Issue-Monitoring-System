import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ShieldCheck, CheckCircle2, AlertTriangle, Building2, ThumbsUp, RotateCcw, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function VerifyComplaint() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleYes = async () => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:8000/api/complaint/verify/${token}`,
        { decision: "yes" }
      );
      setResult("yes");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Verification submitted or token already processed.");
    } finally {
      setLoading(false);
    }
  };

  const handleNo = async () => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:8000/api/complaint/verify/${token}`,
        { decision: "no" }
      );
      setResult("no");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Verification submitted or token already processed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Banner */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Official Citizen Resolution Audit Loop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Grievance Verification Portal
            </h1>
            <p className="text-slate-400 text-xs">
              Confirm field completion status to complete or reopen municipal grievance ticket.
            </p>
          </div>
        </div>

        {/* Main Feedback Box */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          {result === "yes" ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-md text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                  Resolution Confirmed
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">Complaint Officially Closed</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Thank you for verifying that your civic complaint has been resolved satisfactorily. Your feedback helps us maintain quality and SLA accountability.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Portal Home
                </Link>
              </div>
            </div>
          ) : result === "no" ? (
            <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-md text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-300">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase">
                  Reopened for Field Review
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">Grievance Re-escalated</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Thank you for your feedback. Since the issue is not fully resolved, your complaint status has been reset to "In Progress" and assigned back to the department officer.
              </p>
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/track"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  Track Grievance Status
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Has your civic complaint been resolved?
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Municipal officers have marked your registered issue as completed. Please confirm if the field work meets your satisfaction.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <button
                  disabled={loading}
                  onClick={handleYes}
                  className="py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 border border-emerald-600"
                >
                  <ThumbsUp className="w-4 h-4 text-amber-300" /> Yes, Issue is Fully Resolved
                </button>

                <button
                  disabled={loading}
                  onClick={handleNo}
                  className="py-3.5 px-6 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 border border-red-600"
                >
                  <RotateCcw className="w-4 h-4" /> No, Issue Persists (Reopen)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}