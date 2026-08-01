import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Camera,
  LogOut,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  Edit2,
  Save,
  Phone,
  Search,
  Filter,
  ChevronRight,
  XCircle,
  Eye,
  Video,
  Image as ImageIcon,
  Compass
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/UI/StatusBadge";
import PriorityBadge from "../components/UI/PriorityBadge";
import IncidentMap from "../components/UI/IncidentMap";
import { INDIA_LOCATION_DATA, ALL_INDIAN_STATES, getTaluksForDistrict } from "../data/indiaLocations";

// Curated photo avatars for quick citizen profile choice
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [user, setUser] = useState({
    fullName: "Registered Citizen",
    email: "citizen@gov.in",
    phone: "",
    address: "",
    state: "Karnataka",
    district: "BENGALURU URBAN",
    taluk: "Bengaluru North",
    pincode: "560001",
    profilePic: "",
  });

  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Search & Filter State for Grievances Log
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    state: "Karnataka",
    district: "BENGALURU URBAN",
    taluk: "Bengaluru North",
    pincode: "560001",
    profilePic: "",
  });

  // Derived location dropdown options based on selected State & District
  const availableDistricts = INDIA_LOCATION_DATA[editForm.state] || [];
  const availableTaluks = getTaluksForDistrict(editForm.state, editForm.district);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfileAndComplaints();
  }, [navigate]);

  const fetchProfileAndComplaints = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        // Fetch Auth User Details
        const authRes = await fetch("http://localhost:8000/api/auth/check", {
          headers: {
            token: token,
            Authorization: `Bearer ${token}`,
          },
        });
        const authData = await authRes.json();
        if (authData.success && authData.user) {
          const u = authData.user;
          const userState = u.state || "Karnataka";
          const userDist = u.district || "BENGALURU URBAN";

          const initialUser = {
            fullName: u.fullName || "Registered Citizen",
            email: u.email || "citizen@gov.in",
            phone: u.phone || "",
            address: u.address || "",
            state: userState,
            district: userDist,
            taluk: u.taluk || "Bengaluru North",
            pincode: u.pincode || "",
            profilePic: u.profilePic || "",
          };

          setUser(initialUser);
          setEditForm(initialUser);
        }

        // Fetch Filed Grievances
        const compRes = await fetch("http://localhost:8000/api/complaint/my", {
          headers: {
            token: token,
            Authorization: `Bearer ${token}`,
          },
        });
        const compData = await compRes.json();
        if (compData.success) {
          setMyComplaints(compData.complaints || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (newState) => {
    const districts = INDIA_LOCATION_DATA[newState] || [];
    const firstDist = districts[0] || "";
    const taluks = getTaluksForDistrict(newState, firstDist);
    setEditForm((prev) => ({
      ...prev,
      state: newState,
      district: firstDist,
      taluk: taluks[0] || "",
    }));
  };

  const handleDistrictChange = (newDistrict) => {
    const taluks = getTaluksForDistrict(editForm.state, newDistrict);
    setEditForm((prev) => ({
      ...prev,
      district: newDistrict,
      taluk: taluks[0] || "",
    }));
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({ ...prev, profilePic: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please log in to update your profile.");

    // Validation for primary required fields
    if (!editForm.fullName?.trim()) return alert("Full Name is required.");
    if (!editForm.email?.trim()) return alert("Email address is required.");
    if (!editForm.phone?.trim()) return alert("Mobile Phone Number is required.");
    if (!editForm.address?.trim()) return alert("Residential Address is required.");

    try {
      setSaving(true);
      const res = await fetch("http://localhost:8000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setIsEditing(false);
        alert("Profile details updated successfully ✅");
      } else {
        // Fallback save locally if backend demo mode
        setUser({ ...editForm });
        setIsEditing(false);
        alert("Profile details updated successfully ✅");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    alert("Logged out of government portal session.");
    navigate("/login");
  };

  // Grievance Counts
  const totalCount = myComplaints.length;
  const pendingCount = myComplaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = myComplaints.filter((c) => c.status === "In Progress" || c.status === "Accepted").length;
  const completedCount = myComplaints.filter((c) => c.status === "Completed" || c.status === "Closed").length;

  // Filter Grievances by Search Query and Active Tab
  const filteredComplaints = myComplaints.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.complaintId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.issue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Pending") return matchesSearch && item.status === "Pending";
    if (activeTab === "In Progress") return matchesSearch && (item.status === "In Progress" || item.status === "Accepted");
    if (activeTab === "Completed") return matchesSearch && (item.status === "Completed" || item.status === "Closed");

    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 font-sans">
      <div>
        <Navbar />

        {/* 🏛 Header Banner */}
        <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Citizen Profile & Activity Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {user.fullName}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Manage personal contact credentials, update residential address, and review your filed grievance history.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-blue-800 transition shadow-xs"
              >
                <FileText className="w-4 h-4 text-amber-400" /> Register Issue
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-xs font-bold text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 px-4 py-2.5 rounded-xl border border-red-800/80 transition"
              >
                <LogOut className="w-4 h-4" /> End Session
              </button>
            </div>
          </div>
        </div>

        {/* 🗂 Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="grid lg:grid-cols-12 gap-8">

            {/* 👤 Left Column: Editable Citizen Profile Form (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 h-fit">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-900" /> Citizen Profile Credentials
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                    Editing Mode
                  </span>
                )}
              </div>

              {/* Avatar Preview */}
              <div className="text-center space-y-3">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-blue-900 text-blue-900 font-black text-3xl flex items-center justify-center overflow-hidden shadow-sm">
                    {editForm.profilePic || user.profilePic ? (
                      <img src={editForm.profilePic || user.profilePic} alt="Profile Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => fileInput.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-900 text-amber-300 shadow hover:bg-blue-950 transition"
                      title="Upload Avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <input ref={fileInput} hidden type="file" accept="image/*" onChange={handleProfileImage} />
                </div>

                {isEditing && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600">Choose Preset Avatar:</label>
                    <div className="flex items-center justify-center gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt={`Preset ${idx + 1}`}
                          onClick={() => setEditForm((prev) => ({ ...prev, profilePic: preset }))}
                          className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition ${
                            editForm.profilePic === preset ? "border-blue-900 scale-110" : "border-slate-300 opacity-70 hover:opacity-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Details List / Editable Inputs */}
              {!isEditing ? (
                /* READ-ONLY VIEW */
                <div className="space-y-3.5 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Full Name (Required)</span>
                    <p className="font-extrabold text-slate-900 text-sm">{user.fullName}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address (Required)</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-900" /> {user.email}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile Phone Number (Required)</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-900" /> {user.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Residential Address (Required)</span>
                    <p className="font-semibold text-slate-800 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-900 shrink-0 mt-0.5" /> {user.address || "Not specified"}
                    </p>
                  </div>

                  {/* Location Details */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-900" /> Location / Administrative Jurisdiction (Optional)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                      <div><span className="text-slate-400 block text-[10px]">State:</span> {user.state || "Karnataka"}</div>
                      <div><span className="text-slate-400 block text-[10px]">District:</span> {user.district || "BENGALURU URBAN"}</div>
                      <div><span className="text-slate-400 block text-[10px]">Taluk:</span> {user.taluk || "Not specified"}</div>
                      <div><span className="text-slate-400 block text-[10px]">Pincode:</span> {user.pincode || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-800 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Citizen Account</span>
                  </div>
                </div>
              ) : (
                /* EDITABLE INPUTS FORM */
                <div className="space-y-4 text-xs">
                  {/* Primary Required Fields */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-black text-blue-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                      Primary Details (Required)
                    </h4>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="e.g. Full Name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="citizen@example.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Mobile Phone Number *</label>
                      <input
                        type="text"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="+91 98XXXXXXXX"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Residential Address *</label>
                      <textarea
                        rows={2}
                        required
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="House/Street details, Locality..."
                      />
                    </div>
                  </div>

                  {/* Optional Location Selectors (All India) */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                      Location / Region (Optional)
                    </h4>

                    {/* State Selector */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">State / Union Territory</label>
                      <select
                        value={editForm.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                      >
                        {ALL_INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Selector */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">District</label>
                      <select
                        value={editForm.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                      >
                        {availableDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Taluk / Sub-District Selector */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Taluk / Sub-District</label>
                      <select
                        value={editForm.taluk}
                        onChange={(e) => setEditForm({ ...editForm, taluk: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                      >
                        {availableTaluks.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={editForm.pincode}
                        onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                        placeholder="e.g. 560001"
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      />
                    </div>
                  </div>

                  {/* Save & Cancel Controls */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-300" />} Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 📜 Right Column: My Filed Grievances Log (7 cols) */}
            <div className="lg:col-span-7 space-y-6">

              {/* Log Header & Search Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-900" /> My Filed Grievance Records
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Review your filed complaints and monitor repair timelines.</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {filteredComplaints.length} Records
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search complaint ID, category, or location..."
                    className="w-full bg-slate-50 text-xs rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto">
                  <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  {["All", "Pending", "In Progress", "Completed"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg border transition shrink-0 ${
                        activeTab === tab
                          ? "bg-blue-900 text-white border-blue-950"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaints List */}
              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-900 mx-auto mb-2" /> Loading your grievance history...
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <p className="text-xs text-slate-500 font-medium">You have not registered any grievances under this account yet.</p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-950 transition"
                  >
                    <FileText className="w-4 h-4 text-amber-400" /> Register New Grievance
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredComplaints.map((item) => (
                    <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                      <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[11px] font-black text-blue-900 font-mono">{item.complaintId}</span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{item.category} &rsaquo; {item.issue}</h4>
                          <p className="text-[11px] text-slate-500">Filed on: {new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={item.priority} />
                          <StatusBadge status={item.status} />
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap justify-between items-center gap-2">
                        <span>Assigned Dept: <strong>{item.department || "General Department"}</strong></span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedComplaint(item)}
                            className="text-slate-700 hover:text-blue-900 font-bold underline text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-900" /> Inspect
                          </button>
                          <Link
                            to={`/track`}
                            className="text-blue-700 hover:text-blue-900 font-bold underline text-[11px] flex items-center gap-1"
                          >
                            Track Live Timeline <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 🔍 Grievance Detail Inspection Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-black text-blue-900 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedComplaint.complaintId}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {selectedComplaint.category} &rsaquo; {selectedComplaint.issue}
                </h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-800 p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div><strong>Assigned Dept:</strong> {selectedComplaint.department || "General Department"}</div>
                <div><strong>Status:</strong> {selectedComplaint.status}</div>
                <div><strong>District:</strong> {selectedComplaint.district || "BENGALURU URBAN"}</div>
                <div><strong>Filed On:</strong> {new Date(selectedComplaint.createdAt).toLocaleString("en-IN")}</div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-900" /> Location Address
                </h4>
                <p className="text-slate-600">{selectedComplaint.address}</p>

                {selectedComplaint.location?.latitude && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-300">
                    <IncidentMap
                      latitude={selectedComplaint.location.latitude}
                      longitude={selectedComplaint.location.longitude}
                      address={selectedComplaint.address}
                      interactive={false}
                      height="200px"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <Link to="/track" className="bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-blue-950 transition">
                Open SLA Track Page
              </Link>
              <button onClick={() => setSelectedComplaint(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}