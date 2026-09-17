import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FilePlus2,
  Search,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Activity
} from "lucide-react";

export default function HeroCards() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    resolutionRate: "100.0%",
    avgTime: "24 Hours",
    departmentsCount: 5,
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/admin/complaints")
      .then((res) => res.json())
      .then((data) => {
        const list = data.data || [];
        if (list.length > 0) {
          const total = list.length;
          const completed = list.filter(
            (c) => c.status === "Completed" || c.status === "Closed"
          ).length;
          const rate = ((completed / total) * 100).toFixed(1) + "%";
          const depts = [...new Set(list.map((c) => c.department).filter(Boolean))].length || 5;

          setMetrics({
            total,
            completed,
            resolutionRate: rate,
            avgTime: "24 Hours",
            departmentsCount: depts,
          });
        }
      })
      .catch((err) => console.log("Metrics fetch note:", err));
  }, []);

  const faqs = [
    {
      q: "How do I register a civic complaint?",
      a: "Click on 'Register New Complaint', select the category (e.g. Roads, Sanitation, Water), attach a photograph of the issue, and provide your location using the GPS auto-detector or manual address entry."
    },
    {
      q: "What happens after I submit a complaint?",
      a: "You will instantly receive a unique Complaint ID (CIV-XXXXXXXX) via SMS/Email. Your complaint is automatically routed to the responsible municipal department based on service configuration rules."
    },
    {
      q: "How do I track the resolution progress?",
      a: "Go to 'Track Status' page and enter your Complaint ID. You can see the step-by-step milestone timeline from Pending Review to Field Inspection and Final Resolution."
    },
    {
      q: "What is the Citizen Resolution Verification process?",
      a: "When municipal officers mark an issue as 'Completed', a verification link is emailed to you. The complaint is only marked 'Closed' after you confirm the resolution."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Official Municipal Governance & Public Infrastructure Portal</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Empowering Citizens. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                  Transforming Civic Governance.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                Report road defects, sanitation issues, water leakages, and streetlight outages directly to municipal authorities. Monitor real-time SLA progress with transparent verification loops.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/register"
                  className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-900/40 hover:scale-[1.02] transition active:scale-95 border border-blue-500"
                >
                  <FilePlus2 className="w-5 h-5 text-amber-300" />
                  Register New Complaint
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/track"
                  className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm px-6 py-3.5 rounded-xl shadow-md border border-slate-700 hover:scale-[1.02] transition active:scale-95"
                >
                  <Search className="w-5 h-5 text-emerald-400" />
                  Track Complaint Status
                </Link>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time Routing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GPS Auto-Locate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Citizen Audit Loop</span>
                </div>
              </div>
            </motion.div>

            {/* Right Live Dashboard Metrics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-900/80 text-amber-400 flex items-center justify-center border border-blue-700">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Public Service Dashboard</h3>
                      <p className="text-xs text-slate-400">Live Database Metrics</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
                    <p className="text-[11px] font-medium text-slate-400">Resolution Rate</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1">{metrics.resolutionRate}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400" /> {metrics.completed} Completed
                    </p>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
                    <p className="text-[11px] font-medium text-slate-400">Registered Grievances</p>
                    <p className="text-2xl font-extrabold text-blue-400 mt-1">{metrics.total}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" /> {metrics.departmentsCount} Departments
                    </p>
                  </div>
                </div>

                <div className="bg-blue-950/60 border border-blue-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Citizen Verification Protocol</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Complaints are strictly marked "Closed" only after citizens verify completion through our automated email validation loop.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Explorer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Services & Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Report Civic Issues by Category
          </h2>
          <p className="text-slate-600 text-sm">
            Select a category to lodge your grievance directly to the responsible officer.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              🛣️
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Roads & Infrastructure</h3>
            <p className="text-slate-500 text-xs mb-4">Potholes, broken footpaths, damaged road dividers, missing manhole covers.</p>
            <Link to="/register" className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1">
              Report Issue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              🧹
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Sanitation & Garbage</h3>
            <p className="text-slate-500 text-xs mb-4">Overflowing dustbins, uncollected waste, street sweeping, illegal dumping.</p>
            <Link to="/register" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1">
              Report Issue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              🚰
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Water Supply & Drainage</h3>
            <p className="text-slate-500 text-xs mb-4">Pipe bursts, low pressure supply, contaminated water, clogged storm drains.</p>
            <Link to="/register" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1">
              Report Issue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-amber-300 transition group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              💡
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Electrical & Lighting</h3>
            <p className="text-slate-500 text-xs mb-4">Non-functional streetlights, loose wiring, transformer leaks, pole damage.</p>
            <Link to="/register" className="text-xs font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1">
              Report Issue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Step Wizard */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Transparent Governance Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How the System Works
            </h2>
            <p className="text-slate-600 text-sm">
              Simple 4-step workflow ensuring accountability from registration to citizen verification.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Lodge Complaint</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Submit issue details, photograph evidence, and precise GPS location.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Auto Department Routing</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Service rules automatically assign responsible department & SLA priority.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Field Resolution</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Municipal officers inspect, repair, and update progress in real time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Citizen Verification</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Receive an email verification link to confirm completion before official closure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Citizen Information & FAQs
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center font-bold text-slate-800 text-sm hover:bg-slate-50 transition"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-slate-600 text-xs leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}