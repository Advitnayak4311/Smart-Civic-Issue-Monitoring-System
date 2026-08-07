import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export default function SLATimerBadge({ createdAt, category, issue, slaLimitHours }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    isExpired: false,
    expiredHours: 0,
    ratio: 1,
  });

  // Calculate SLA limit based on category
  const getSlaHours = () => {
    if (slaLimitHours) return slaLimitHours;
    const cat = (category || "").toLowerCase();
    const iss = (issue || "").toLowerCase();

    if (cat.includes("water") || iss.includes("water") || iss.includes("pipe") || iss.includes("leak")) return 12;
    if (cat.includes("garbage") || cat.includes("sanitation") || iss.includes("garbage") || iss.includes("waste")) return 24;
    if (cat.includes("drain") || iss.includes("drain") || iss.includes("sewage")) return 24;
    if (cat.includes("electric") || cat.includes("light") || iss.includes("pole") || iss.includes("street light")) return 36;
    if (cat.includes("road") || iss.includes("pothole") || iss.includes("footpath")) return 48;
    return 48;
  };

  const limitHours = getSlaHours();

  useEffect(() => {
    const calculateTime = () => {
      if (!createdAt) return;
      const createdMs = new Date(createdAt).getTime();
      const deadlineMs = createdMs + limitHours * 60 * 60 * 1000;
      const nowMs = Date.now();

      const diffMs = deadlineMs - nowMs;
      const totalSlaMs = limitHours * 60 * 60 * 1000;

      if (diffMs <= 0) {
        const expiredHrs = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
        setTimeLeft({
          hours: 0,
          minutes: 0,
          isExpired: true,
          expiredHours: expiredHrs,
          ratio: 0,
        });
      } else {
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const ratio = diffMs / totalSlaMs;
        setTimeLeft({
          hours: hrs,
          minutes: mins,
          isExpired: false,
          expiredHours: 0,
          ratio,
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [createdAt, limitHours]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 text-red-900 border border-red-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
        <AlertTriangle className="w-3 h-3 text-red-600" />
        SLA Breached ({timeLeft.expiredHours}h Overdue)
      </span>
    );
  }

  // Color logic
  let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
  let dotColor = "bg-emerald-500";

  if (timeLeft.ratio < 0.25) {
    badgeColor = "bg-red-50 text-red-800 border-red-300";
    dotColor = "bg-red-500 animate-ping";
  } else if (timeLeft.ratio < 0.50) {
    badgeColor = "bg-orange-50 text-orange-800 border-orange-300";
    dotColor = "bg-orange-500";
  } else if (timeLeft.ratio < 0.75) {
    badgeColor = "bg-amber-50 text-amber-800 border-amber-300";
    dotColor = "bg-amber-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 border font-extrabold text-[10px] px-2.5 py-0.5 rounded-full ${badgeColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <Clock className="w-3 h-3 text-slate-400" />
      {timeLeft.hours}h {timeLeft.minutes}m Left
    </span>
  );
}
