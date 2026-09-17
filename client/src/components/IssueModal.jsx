import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight, Layers } from "lucide-react";

export default function IssueModal({
  open,
  category,
  issues,
  onClose,
  onContinue,
}) {
  const [selected, setSelected] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-blue-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] font-bold text-blue-200 uppercase">Category Selected</span>
              <h3 className="text-base font-extrabold text-white">{category}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-600">
            Please select the specific issue/subcategory you wish to report:
          </p>

          {issues.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
              No specific subcategories configured for this category yet. You can proceed with general reporting.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {issues.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => setSelected(issue)}
                  className={`p-3 rounded-xl text-xs font-bold text-left border transition flex items-center justify-between ${
                    selected === issue
                      ? "bg-blue-50 text-blue-900 border-blue-600 shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  <span className="truncate">{issue}</span>
                  {selected === issue && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected && issues.length > 0}
            onClick={() => onContinue(selected || category)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}