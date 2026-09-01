import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  MessageSquare,
  Bot,
  X,
  Send,
  Sparkles,
  Search,
  Building2,
  Clock,
  ShieldCheck,
  FileText,
  PhoneCall,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  HelpCircle,
  Wrench,
  Droplet,
  Zap,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import StatusBadge from "./UI/StatusBadge";

// Comprehensive Predefined FAQ Knowledge Base
const KNOWLEDGE_BASE = [
  // --- TRACKING & STATUS ---
  {
    id: "track_how",
    label: "🔍 Track Complaint",
    keywords: ["track", "status", "check", "progress", "where", "my complaint", "ticket status", "ref id"],
    answer:
      "To track your grievance, enter your Complaint Ref ID (e.g. CIV-67553008) in the chat input below, or go to the 'Track Status' page in the top navbar. You will see a live 4-step SLA timeline and current field status.",
  },
  {
    id: "status_under_verification",
    label: "⏱ Under Verification",
    keywords: ["under verification", "citizen verification", "verification status", "waiting verification"],
    answer:
      "Status 'Under Citizen Verification' means municipal repair crews have completed field remediation. An official verification link has been sent to the citizen's email to confirm satisfaction before final ticket archiving.",
  },
  {
    id: "status_in_progress",
    label: "👷 In Progress",
    keywords: ["in progress", "work started", "dispatched", "crew active"],
    answer:
      "Status 'In Progress' indicates that the department officer has assigned a field crew and repair personnel are actively working on ground to fix the issue.",
  },
  {
    id: "status_reopened",
    label: "🔴 Reopened Ticket",
    keywords: ["reopened", "unresolved", "not fixed", "persists", "incomplete"],
    answer:
      "Status 'Reopened' means the citizen indicated that field work was incomplete. The complaint is automatically escalated to High Priority and pinned at the top of the department officer command center for immediate re-inspection.",
  },
  {
    id: "status_completed",
    label: "✅ Completed & Verified",
    keywords: ["completed", "verified", "closed", "resolved", "archived", "solved"],
    answer:
      "Status 'Completed & Verified' means the field repair was executed and the citizen explicitly confirmed satisfaction. The ticket is officially closed and archived in the solved public records.",
  },

  // --- FILING & EVIDENCE ---
  {
    id: "file_how",
    label: "📝 Register Grievance",
    keywords: ["file", "register", "submit", "new complaint", "how to report", "create complaint"],
    answer:
      "To file a new grievance, click 'Register Issue' in the top navbar. 1) Select Category & Subcategory, 2) Attach photo/video evidence, 3) Confirm GPS location, and 4) Submit. You will instantly receive a unique Complaint Reference ID.",
  },
  {
    id: "photo_evidence",
    label: "📸 Photo Rules",
    keywords: ["photo", "picture", "image", "upload photo", "camera", "photo limit", "image size"],
    answer:
      "You can attach up to 5 photo evidence images per complaint. Photos are automatically compressed client-side under 100KB for fast submission. Live web camera capture is also supported.",
  },
  {
    id: "video_evidence",
    label: "🎥 Video Uploads",
    keywords: ["video", "clip", "mp4", "recording", "upload video", "video size"],
    answer:
      "Yes! You can attach video clips (MP4, WebM, MOV) up to 500MB. The system generates a lightweight high-performance preview under 1.5MB for sub-100ms HTTP submission speed.",
  },
  {
    id: "gps_location",
    label: "📍 GPS Location",
    keywords: ["gps", "location", "map", "address", "detect location", "coordinates", "google maps"],
    answer:
      "Click 'Detect GPS Location' on the form to auto-detect your exact coordinates. You can also drag the interactive map pin, search landmarks, or paste raw lat/lng or Google Maps URLs directly into the location search bar.",
  },

  // --- CATEGORIES & DEPARTMENTS ---
  {
    id: "cat_water",
    label: "💧 Water & Pipe Leaks",
    keywords: ["water", "pipeline", "leakage", "no water", "dirty water", "contamination", "water supply", "pipe burst"],
    answer:
      "Water Supply & Contamination complaints are routed directly to the Water Board & Sanitation Department under High SLA Priority (24-48 Hours target resolution time).",
  },
  {
    id: "cat_potholes",
    label: "🛣 Potholes & Roads",
    keywords: ["pothole", "road", "tar", "asphalt", "broken road", "footpath", "pavement", "crack"],
    answer:
      "Road Damage & Pothole grievances are assigned to the Public Works Department (PWD) under Medium SLA Priority (48-72 Hours target resolution time).",
  },
  {
    id: "cat_lights",
    label: "⚡ Streetlights & Power",
    keywords: ["light", "streetlight", "electricity", "wire", "power failure", "dark street", "sparking", "transformer"],
    answer:
      "Streetlight & Electrical Hazard complaints are handled by the Electricity Supply Board (BESCOM / State Power Desk) with emergency wiring dispatched within 24-48 hours.",
  },
  {
    id: "cat_garbage",
    label: "🗑 Garbage & Waste",
    keywords: ["garbage", "trash", "waste", "cleaning", "dump", "sanitation", "smell", "dustbin", "black spot"],
    answer:
      "Solid Waste Management & Garbage Dumping issues are routed to the Municipal Health & Sanitation Cell for clearance within 48 hours.",
  },
  {
    id: "cat_drainage",
    label: "🌊 Drainage & Sewage",
    keywords: ["drainage", "sewage", "overflow", "drain", "manhole", "clogged", "flooding", "stagnant water"],
    answer:
      "Drainage & Underground Sewage Overflow issues are flagged as Critical Hazards and assigned to the Stormwater Drain Division under High Priority (24 Hours).",
  },
  {
    id: "cat_animals",
    label: "🐕 Stray Animals",
    keywords: ["stray", "dog", "animal", "rabies", "cattle", "monkey", "barking", "bite"],
    answer:
      "Stray Animal Control & Vaccination issues can be reported under 'Other Civic Grievances' and are managed by the Animal Husbandry & Veterinary Department within 72 hours.",
  },
  {
    id: "cat_trees",
    label: "🌳 Fallen Trees & Parks",
    keywords: ["tree", "branch", "park", "garden", "fallen tree", "horticulture", "cutting"],
    answer:
      "Fallen Trees, Park Maintenance, & Environmental issues can be reported under 'Other Civic Grievances' and are handled by the Forest & Horticulture Department.",
  },

  // --- SLA TIMELINES & PRIORITY ---
  {
    id: "sla_timelines",
    label: "⏱ SLA Time Limits",
    keywords: ["sla", "time limit", "deadline", "how long", "resolution time", "hours", "days"],
    answer:
      "Municipal SLA Timelines: 1) High Priority (Water/Drainage Hazards) = 24-48 Hours. 2) Medium Priority (Potholes/Garbage) = 48-72 Hours. 3) Low Priority (Routine Lights/Parks) = 5-7 Days.",
  },
  {
    id: "sla_breach",
    label: "⚠️ SLA Delay / Breach",
    keywords: ["delay", "overdue", "breach", "not solved in time", "late", "escalate"],
    answer:
      "If a complaint exceeds its target SLA timeline without field completion, it is automatically flagged in orange/red on the SuperAdmin Escalation Matrix for senior nodal officer audit.",
  },

  // --- CITIZEN VERIFICATION ---
  {
    id: "verification_how",
    label: "🛡 Verification Audit",
    keywords: ["verify", "verification", "audit", "email link", "confirm resolution", "how verification works"],
    answer:
      "When field teams complete repairs, an official audit email is sent to you with a verification link. Clicking 'Yes' officially completes & archives the ticket. Clicking 'No' reopens the grievance as High Priority for re-inspection.",
  },
  {
    id: "verification_yes",
    label: "👍 Verification YES",
    keywords: ["click yes", "satisfied", "approve resolution", "confirm yes"],
    answer:
      "Clicking 'Yes, Issue is Fully Resolved' updates citizen verification status to 'Yes', sets complaint status to 'Closed', and archives the record into the Solved Public Archives.",
  },
  {
    id: "verification_no",
    label: "👎 Verification NO",
    keywords: ["click no", "unsatisfied", "not resolved", "reopen no"],
    answer:
      "Clicking 'No, Issue Persists' updates status to 'Reopened', escalates SLA priority to 'High', and pins the complaint at the top of officer dashboards with a glowing red warning callout.",
  },

  // --- ACCOUNTS & PROFILE ---
  {
    id: "account_signup",
    label: "👤 Account Registration",
    keywords: ["account", "signup", "register user", "login required", "profile", "password"],
    answer:
      "Creating a citizen account allows you to view all your past complaints under 'My Grievances' in your Profile dashboard. Click 'Citizen Sign In' in the top navbar to log in or register.",
  },
  {
    id: "account_profile",
    label: "⚙️ Profile Settings",
    keywords: ["profile", "update details", "change phone", "change address", "change name", "ward number"],
    answer:
      "You can update your Full Name, Phone Number, Residential Address, and Ward Jurisdiction anytime from your Citizen Profile page (/profile). Security notification emails are dispatched on profile updates.",
  },

  // --- HELPLINES & CONTROLS ---
  {
    id: "helpline_number",
    label: "📞 Control Room Helpline",
    keywords: ["helpline", "phone number", "contact", "call", "toll free", "support email", "emergency contact"],
    answer:
      "National Civic Response Control Room: 1800-111-2470 (Toll-Free 24x7). Nodal Email: support-civic@gov.in. Website: www.smartcivic.gov.in.",
  },
];

export default function CivicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Namaste! I am your Smart Civic Assistant. How can I help you today? Select a quick topic below, ask any municipal question, or type your Complaint Ref ID (e.g. CIV-67553008) for live status tracking.",
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Extract Complaint Ref ID pattern (CIV-12345678)
  const extractComplaintId = (text) => {
    const match = text.match(/CIV-\d+/i);
    return match ? match[0].toUpperCase() : null;
  };

  // Perform Live Complaint Lookup from API
  const fetchLiveComplaint = async (complaintId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/admin/track/${complaintId}`);
      if (res.data.success && res.data.complaint) {
        return res.data.complaint;
      }
      return null;
    } catch (err) {
      console.log("Chatbot Track Note:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Smart Search Engine matching query tokens against knowledge base keywords
  const findBestAnswer = (queryText) => {
    const lower = queryText.toLowerCase();
    const tokens = lower.split(/[\s,?.!/\\-]+/).filter((t) => t.length > 2);

    let bestMatch = null;
    let highestScore = 0;

    for (const kb of KNOWLEDGE_BASE) {
      let score = 0;
      for (const token of tokens) {
        for (const kw of kb.keywords) {
          if (kw.includes(token) || token.includes(kw)) {
            score += 2;
          }
        }
      }
      if (lower.includes(kb.id.toLowerCase())) score += 5;
      if (lower.includes(kb.label.toLowerCase())) score += 4;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = kb;
      }
    }

    return highestScore >= 2 ? bestMatch : null;
  };

  const handleSend = async (customText = null) => {
    const textToSend = (customText || input).trim();
    if (!textToSend) return;

    if (!customText) setInput("");

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // 1. Check if input contains a Complaint Ref ID
    const detectedId = extractComplaintId(textToSend);

    if (detectedId) {
      setLoading(true);
      const complaintData = await fetchLiveComplaint(detectedId);
      setLoading(false);

      if (complaintData) {
        const botCardMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: `Found official municipal grievance record for ${detectedId}:`,
          complaint: complaintData,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botCardMsg]);
      } else {
        const notFoundMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: `Unable to find grievance record matching "${detectedId}". Please check the ID and try again, or file a new complaint from the portal.`,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, notFoundMsg]);
      }
      return;
    }

    // 2. Query Knowledge Base using Smart Search Engine
    const match = findBestAnswer(textToSend);

    setTimeout(() => {
      let responseText = "";
      if (match) {
        responseText = match.answer;
      } else if (
        textToSend.toLowerCase().includes("hello") ||
        textToSend.toLowerCase().includes("hi") ||
        textToSend.toLowerCase().includes("namaste")
      ) {
        responseText =
          "Namaste! How can I assist you today? You can select a quick topic below, ask any civic policy question, or enter your Complaint Ref ID (e.g. CIV-67553008).";
      } else {
        responseText =
          "I understand your query regarding municipal services. For direct tracking, please enter your Complaint ID (format: CIV-12345678). You can also contact our 24x7 control room helpline at 1800-111-2470.";
      }

      const botMsg = {
        id: Date.now() + 2,
        sender: "bot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 350);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-slate-900 hover:bg-blue-950 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border border-slate-700 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-blue-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="font-bold text-xs tracking-wide">Civic Assistant</span>
          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-400/30">
            24x7 Help
          </span>
        </button>
      )}

      {/* Expanded Chatbot Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[560px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Top Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                  Smart Civic Assistant
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Comprehensive Municipal Knowledge Desk
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* FAQ Chips Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {KNOWLEDGE_BASE.slice(0, 8).map((kb) => (
              <button
                key={kb.id}
                onClick={() => handleSend(kb.label)}
                className="shrink-0 text-[11px] font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 px-3 py-1.5 rounded-full border border-slate-200 transition shadow-xs cursor-pointer"
              >
                {kb.label}
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] space-y-2 ${
                    msg.sender === "user"
                      ? "bg-blue-900 text-white rounded-2xl rounded-tr-xs p-3 text-xs shadow-xs"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-xs p-3 text-xs border border-slate-200 shadow-xs"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Interactive Status Card inside Chat Stream */}
                  {msg.complaint && (
                    <div className="mt-2 bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-extrabold text-[11px] text-blue-950 font-mono">
                          {msg.complaint.complaintId}
                        </span>
                        <StatusBadge
                          status={msg.complaint.status}
                          citizenVerified={msg.complaint.citizenVerified}
                        />
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <p>
                          <strong>Category:</strong> {msg.complaint.category} &rsaquo; {msg.complaint.issue}
                        </p>
                        <p>
                          <strong>Department:</strong> {msg.complaint.department || "General Department"}
                        </p>
                        <p>
                          <strong>Priority:</strong> {msg.complaint.priority || "Medium"}
                        </p>
                        <p>
                          <strong>Location:</strong> {msg.complaint.address}
                        </p>
                      </div>

                      <div className="pt-1">
                        <Link
                          to={`/track/${msg.complaint.complaintId}`}
                          onClick={() => setIsOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] py-1.5 rounded-lg transition"
                        >
                          View Full Timeline <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] text-right mt-1 ${
                      msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-950 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs bg-white p-3 rounded-2xl w-fit border border-slate-200">
                <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Querying municipal records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or paste Complaint ID (CIV-67553008)..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white flex items-center justify-center transition shrink-0 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
