import { useState, useRef, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FolderCheck,
  ChevronDown,
  Check
} from "lucide-react";

const STATUS_OPTIONS = [
  {
    id: "Pending",
    label: "Pending",
    desc: "Awaiting initial officer inspection",
    icon: Clock,
    color: "text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100",
    badge: "bg-amber-100 text-amber-900 border-amber-300"
  },
  {
    id: "In Progress",
    label: "In Progress",
    desc: "Field repair active on-site",
    icon: Sparkles,
    color: "text-indigo-700 bg-indigo-50 border-indigo-300 hover:bg-indigo-100",
    badge: "bg-indigo-100 text-indigo-900 border-indigo-300"
  },
  {
    id: "Completed",
    label: "Completed (Send Verification Email)",
    desc: "Work finished, sends verification email to citizen",
    icon: CheckCircle2,
    color: "text-emerald-800 bg-emerald-50 border-emerald-400 hover:bg-emerald-100",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-400"
  },
  {
    id: "Reopened",
    label: "Reopened (High Priority)",
    desc: "Citizen reported issue unresolved",
    icon: AlertCircle,
    color: "text-red-700 bg-red-50 border-red-300 hover:bg-red-100",
    badge: "bg-red-100 text-red-900 border-red-400"
  }
];

export default function CustomStatusSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentOption =
    STATUS_OPTIONS.find((opt) => opt.id === value) || STATUS_OPTIONS[0];

  const IconComponent = currentOption.icon;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border font-bold text-xs shadow-xs transition-all duration-200 outline-none ${currentOption.color}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-white/80 shadow-xs shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="text-left truncate">
            <div className="text-xs font-black tracking-tight">{currentOption.label}</div>
            <div className="text-[10px] font-medium opacity-80 truncate">{currentOption.desc}</div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Premium Dropdown Options Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-800">
            Select Municipal SLA Lifecycle Status
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {STATUS_OPTIONS.map((opt) => {
              const OptIcon = opt.icon;
              const isSelected = opt.id === value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 ${
                    isSelected
                      ? "bg-blue-600/90 text-white font-bold shadow-md"
                      : "hover:bg-slate-800/90 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? "bg-white text-blue-900" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <OptIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold">{opt.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {opt.desc}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
