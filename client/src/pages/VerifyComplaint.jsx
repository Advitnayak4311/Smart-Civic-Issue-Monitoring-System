import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ThumbsUp,
  RotateCcw,
  ArrowLeft,
  Star,
  MessageSquare,
  FileText,
  MapPin,
  Calendar,
  Send,
  Camera,
  UploadCloud,
  X,
  Plus,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function VerifyComplaint() {
  const { token } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState(null); // 'yes' or 'no' or null
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reopenedReason, setReopenedReason] = useState("");
  const [reopenImages, setReopenImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (token) {
      setFetching(true);
      axios
        .get(`http://localhost:8000/api/complaint/verify/${token}`)
        .then((res) => {
          if (res.data.success && res.data.complaint) {
            setComplaint(res.data.complaint);
            if (res.data.complaint.citizenVerified === "Yes") {
              setResult("yes");
              setSubmittedData({
                rating: res.data.complaint.citizenRating || null,
                comment: res.data.complaint.citizenComment || res.data.complaint.feedbackComments || "",
                reopenImages: res.data.complaint.reopenImages || [],
                videoUrl: res.data.complaint.reopenVideo || res.data.complaint.videoUrl || null,
              });
            } else if (res.data.complaint.citizenVerified === "No") {
              setResult("no");
              setSubmittedData({
                rating: res.data.complaint.citizenRating || null,
                comment: res.data.complaint.citizenComment || res.data.complaint.feedbackComments || "",
                reopenImages: res.data.complaint.reopenImages || [],
                videoUrl: res.data.complaint.reopenVideo || res.data.complaint.videoUrl || null,
              });
            }
          }
        })
        .catch((err) => console.log("Token check note:", err))
        .finally(() => setFetching(false));
    }
  }, [token]);

  // Handle image upload from file input (Max 5 images)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (reopenImages.length + files.length > 5) {
      alert("Maximum 5 photo evidence attachments allowed.");
    }

    const availableSlots = 5 - reopenImages.length;
    const allowedFiles = files.slice(0, Math.max(0, availableSlots));

    allowedFiles.forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 25MB limit. Please attach a compressed image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setReopenImages((prev) => [...prev, loadEvt.target.result].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle video evidence upload (Supports up to 500 MB video clips)
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please choose a valid video file (MP4, WebM, MOV).");
      return;
    }

    const maxVideoSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxVideoSize) {
      alert("Video file size exceeds the 500 MB upload limit.");
      return;
    }

    setVideoName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);

    // Use optimized stream slice for fast upload and preview
    const sliceSize = file.size <= 2 * 1024 * 1024 ? file.size : 2 * 1024 * 1024;
    const slice = file.slice(0, sliceSize);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setVideoFile(reader.result);
      }
    };
    reader.readAsDataURL(slice);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoName("");
  };

  const handleRemoveImage = (indexToRemove) => {
    setReopenImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitVerification = async (decision) => {
    try {
      setLoading(true);
      const payload = {
        decision,
        citizenRating: rating,
        citizenComment: comment || reopenedReason,
        feedbackComments: comment || reopenedReason,
        reopenImages: decision === "no" ? reopenImages.slice(0, 5) : [],
        videoUrl: decision === "no" ? videoFile : null,
        reopenedReason: decision === "no" ? (reopenedReason || comment) : "",
      };

      const res = await axios.post(
        `http://localhost:8000/api/complaint/verify/${token}`,
        payload
      );

      if (res.data.success) {
        setResult(decision);
        setSubmittedData({
          rating,
          comment: comment || reopenedReason,
          reopenImages: decision === "no" ? reopenImages.slice(0, 5) : [],
          videoUrl: decision === "no" ? videoFile : null,
        });
      }
    } catch (error) {
      console.error("Verification submit error:", error);
      alert(error.response?.data?.message || "Failed to submit verification feedback.");
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (score) => {
    switch (score) {
      case 5:
        return "Excellent Resolution ⭐⭐⭐⭐⭐";
      case 4:
        return "Good Quality ⭐⭐⭐⭐";
      case 3:
        return "Average / Satisfactory ⭐⭐⭐";
      case 2:
        return "Needs Improvement ⭐⭐";
      case 1:
        return "Unsatisfactory / Poor ⭐";
      default:
        return "Select a Rating";
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Banner */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Official Citizen Resolution Audit Loop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Grievance Verification & Feedback Portal
            </h1>
            <p className="text-slate-400 text-xs max-w-xl mx-auto">
              Please verify if the municipal remediation field work meets your satisfaction and submit your valuable feedback.
            </p>
          </div>
        </div>

        {/* Main Verification Container */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          {fetching ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-bold text-xs space-y-3 shadow-xs">
              <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Loading Grievance Verification Details...</p>
            </div>
          ) : result === "yes" ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-md text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                  Resolution Confirmed
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">Complaint Officially Verified & Closed</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Thank you for verifying that your civic complaint has been resolved satisfactorily. Your feedback and rating directly contribute to municipal department accountability.
              </p>

              {/* Recorded Feedback Card */}
              {submittedData && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-700">Your Submitted Rating:</span>
                    {submittedData.rating ? (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= submittedData.rating ? "fill-amber-400 text-amber-500" : "text-slate-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-slate-800 font-extrabold">({submittedData.rating}/5)</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-semibold italic">Recorded without Star Rating</span>
                    )}
                  </div>
                  {submittedData.comment && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Your Feedback Comments:</span>
                      <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                        "{submittedData.comment}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 px-5 py-2.5 rounded-xl shadow-xs transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Portal Home
                </Link>
                {complaint?.complaintId && (
                  <Link
                    to={`/track/${complaint.complaintId}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition border border-slate-300"
                  >
                    Track Status
                  </Link>
                )}
              </div>
            </div>
          ) : result === "no" ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-md text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-300 shadow-sm">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-red-800 bg-red-50 px-3 py-1 rounded-full border border-red-200 uppercase tracking-wide">
                  Reopened for Field Re-Inspection
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">Grievance Reopened & Escalated</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Thank you for your feedback. Since you reported the issue is incomplete, your complaint priority has been upgraded to High and reassigned to the municipal response team along with your submitted photo evidence.
              </p>

              {/* Recorded Feedback Card */}
              {submittedData && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-700">Reported Satisfaction:</span>
                    {submittedData.rating ? (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= submittedData.rating ? "fill-amber-400 text-amber-500" : "text-slate-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-slate-800 font-extrabold">({submittedData.rating}/5)</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-semibold italic">Recorded without Star Rating</span>
                    )}
                  </div>

                  {submittedData.comment && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Your Feedback Notes:</span>
                      <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                        "{submittedData.comment}"
                      </p>
                    </div>
                  )}

                  {submittedData.reopenImages && submittedData.reopenImages.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700 block">Submitted Photo Evidence ({submittedData.reopenImages.length} File{submittedData.reopenImages.length > 1 ? "s" : ""}):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {submittedData.reopenImages.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`Reopen Proof ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-slate-200 bg-white"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {submittedData.videoUrl && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-slate-700 block">Submitted Video Evidence:</span>
                      <video
                        src={submittedData.videoUrl}
                        controls
                        className="w-full max-h-48 rounded-lg border border-slate-200 bg-black"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
                {complaint?.complaintId ? (
                  <Link
                    to={`/track/${complaint.complaintId}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 px-5 py-2.5 rounded-xl shadow-xs transition"
                  >
                    Track Grievance Live Status
                  </Link>
                ) : (
                  <Link
                    to="/track"
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-950 px-5 py-2.5 rounded-xl shadow-xs transition"
                  >
                    Track Status
                  </Link>
                )}
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition border border-slate-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
                  <Building2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Has your civic issue been resolved?
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Municipal officers have marked your registered grievance as completed. Please review the details below and confirm if the work was completed satisfactorily.
                </p>
              </div>

              {/* Grievance Summary Card */}
              {complaint && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2.5 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Grievance Ref ID</span>
                      <p className="font-extrabold text-blue-900 text-sm">{complaint.complaintId}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-200">
                      {complaint.department || "Municipal Division"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Category & Issue</span>
                      <p className="font-bold text-slate-900">{complaint.category}</p>
                      <p className="text-[11px] text-slate-600">{complaint.issue}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Location / Ward</span>
                      <p className="text-[11px] text-slate-800 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{complaint.address || complaint.location?.address || "Registered Location"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Decision Toggle */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Select Resolution Outcome:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDecision("yes");
                      setRating(5);
                    }}
                    className={`p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedDecision === "yes"
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedDecision === "yes" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        ✓
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Yes, Issue Resolved</h4>
                        <p className="text-[11px] text-slate-500">Field work is satisfactory</p>
                      </div>
                    </div>
                    {selectedDecision === "yes" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDecision("no");
                      setRating(2);
                    }}
                    className={`p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedDecision === "no"
                        ? "bg-red-50 border-red-500 ring-2 ring-red-500"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedDecision === "no" ? "bg-red-600 text-white" : "bg-red-100 text-red-700"
                      }`}>
                        ✕
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">No, Issue Persists</h4>
                        <p className="text-[11px] text-slate-500">Incomplete / defective work</p>
                      </div>
                    </div>
                    {selectedDecision === "no" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  </button>
                </div>
              </div>

              {/* Conditional Form: When YES is active */}
              {selectedDecision === "yes" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Rating Selection */}
                  <div className="space-y-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                        How would you rate the resolution quality?
                      </span>
                      <span className="text-[11px] font-bold text-amber-700">
                        {getRatingLabel(hoverRating || rating)}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg hover:scale-110 transition focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-300 hover:text-slate-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Comments */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-800" />
                      Citizen Feedback & Satisfaction Remarks (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share details about the work done, cleanliness, timeliness, or appreciation for the department crew..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmitVerification("yes")}
                    className="w-full py-3.5 px-5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 border border-emerald-600 cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4 text-amber-300" />
                    {loading ? "Submitting..." : "Confirm Resolution & Close Grievance"}
                  </button>
                </div>
              )}

              {/* Conditional Form: When NO is active (Reopen with Photo Evidence Upload) */}
              {selectedDecision === "no" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Rating for Incomplete Work */}
                  <div className="space-y-2 bg-red-50/50 p-4 rounded-xl border border-red-200">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-red-600 fill-red-500" />
                        Rate Current Condition of Issue:
                      </span>
                      <span className="text-[11px] font-bold text-red-700">
                        {getRatingLabel(hoverRating || rating)}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg hover:scale-110 transition focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-500"
                                : "text-slate-300 hover:text-slate-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Reason */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      What remains unresolved? (Please describe)
                    </label>
                    <textarea
                      value={reopenedReason}
                      onChange={(e) => setReopenedReason(e.target.value)}
                      placeholder="e.g. Pothole was only filled with mud and washed away in rain, debris left blocking drainage, street light still blinking..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-red-300 bg-white placeholder-slate-400 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition resize-none"
                    />
                  </div>

                  {/* Photo Evidence Upload Box */}
                  <div className="space-y-3 bg-red-50/70 border-2 border-dashed border-red-300 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-red-950 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-red-600" />
                        Attach Photo Evidence of Incomplete Issue (Recommended)
                      </label>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                        {reopenImages.length} Photo{reopenImages.length === 1 ? "" : "s"} Selected
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Uploading current photos of the site helps municipal officers and field supervisors verify why the issue needs re-inspection.
                    </p>

                    {/* Image Preview Grid */}
                    {reopenImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {reopenImages.map((imgSrc, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-red-200 bg-white shadow-2xs">
                            <img
                              src={imgSrc}
                              alt={`Evidence Proof ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md transition cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Proof #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload File Input Button */}
                    <div className="pt-2">
                      <label className="inline-flex items-center gap-2 bg-white hover:bg-red-100/50 text-red-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-300 shadow-2xs transition cursor-pointer">
                        <UploadCloud className="w-4 h-4 text-red-600" />
                        <span>{reopenImages.length > 0 ? "Add More Photos" : "Choose / Take Photos"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Video Evidence Upload Box (500 MB Limit) */}
                  <div className="space-y-3 bg-red-50/70 border-2 border-dashed border-red-300 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-red-950 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-red-600" />
                        Attach Video Evidence (Optional - 500 MB Max Limit)
                      </label>
                      {videoName && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                          1 Video Attached
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Attach high-resolution video evidence (MP4, WebM, MOV) up to 500 MB to clearly demonstrate unresolved civic issues.
                    </p>

                    {videoFile && (
                      <div className="p-3 bg-white rounded-xl border border-red-200 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 truncate">
                          <Video className="w-4 h-4 text-red-600 shrink-0" />
                          <span className="truncate">{videoName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition shrink-0 cursor-pointer"
                        >
                          Remove Video
                        </button>
                      </div>
                    )}

                    {!videoFile && (
                      <label className="inline-flex items-center gap-2 bg-white hover:bg-red-100/50 text-red-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-300 shadow-2xs transition cursor-pointer">
                        <Video className="w-4 h-4 text-red-600" />
                        <span>Attach Video Clip (Max 500 MB)</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmitVerification("no")}
                    className="w-full py-3.5 px-5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 border border-red-600 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-200" />
                    {loading ? "Submitting Dispute..." : "Submit Dispute & Reopen Grievance 🚨"}
                  </button>
                </div>
              )}

              {/* Initial Selection Notice if neither selected yet */}
              {!selectedDecision && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
                  👆 Please choose either <b>"Yes, Issue Resolved"</b> or <b>"No, Issue Persists"</b> above to complete your verification.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}