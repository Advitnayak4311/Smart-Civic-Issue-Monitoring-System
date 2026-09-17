import { useState } from "react";
import { Star, X, CheckCircle2, MessageSquare } from "lucide-react";

export default function FeedbackRatingModal({ complaintId, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [deptRating, setDeptRating] = useState(5);
  const [responseRating, setResponseRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:8000/api/transparency/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId,
          citizenRating: rating,
          departmentRating: deptRating,
          responseRating,
          workQuality: qualityRating,
          feedbackComments: comments,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Thank you! Your citizen satisfaction feedback has been recorded.");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Feedback Submission Error:", err);
      alert("Failed to record feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarPicker = (val, setVal, label) => (
    <div className="space-y-1 text-xs">
      <label className="font-bold text-slate-700 block">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            className="p-1 hover:scale-110 transition"
          >
            <Star
              className={`w-5 h-5 ${
                star <= val ? "fill-amber-400 text-amber-500" : "text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="font-black text-slate-800 ml-2 text-xs">{val} / 5</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Citizen Voice & Feedback</span>
            <h3 className="text-base font-extrabold text-white">Rate Resolution Quality</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {renderStarPicker(rating, setRating, "1. Overall Grievance Resolution Rating")}
          {renderStarPicker(deptRating, setDeptRating, "2. Department Field Officer Rating")}
          {renderStarPicker(responseRating, setResponseRating, "3. SLA Response Speed Rating")}
          {renderStarPicker(qualityRating, setQualityRating, "4. Work Quality & Repair Quality")}

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 block">5. Citizen Remarks / Feedback Comments</label>
            <textarea
              rows={3}
              placeholder="Share optional feedback regarding the repair quality or department response..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold transition shadow-sm"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
