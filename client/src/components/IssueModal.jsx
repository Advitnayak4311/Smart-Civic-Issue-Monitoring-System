import React, { useState } from "react";

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
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl w-[90%] max-w-lg p-8 animate-[fadeIn_.3s]">

        <h2 className="text-3xl font-bold text-center text-blue-700">
          {category}
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Select the issue you want to report
        </p>

        <div className="flex flex-wrap gap-3 mt-8">

          {issues.map((issue) => (

            <button
              key={issue}
              onClick={() => setSelected(issue)}
              className={`px-5 py-3 rounded-full border transition-all
              ${
                selected === issue
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 hover:bg-blue-100"
              }`}
            >
              {issue}
            </button>

          ))}

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-300"
          >
            Cancel
          </button>

          <button
            disabled={!selected}
            onClick={() => onContinue(selected)}
            className="px-6 py-3 rounded-xl bg-blue-700 text-white disabled:bg-gray-400"
          >
            Continue
          </button>

        </div>

      </div>

    </div>
  );
}