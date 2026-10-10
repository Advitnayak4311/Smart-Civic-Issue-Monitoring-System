import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  FilePlus2,
  Search,
  LayoutDashboard,
  Settings,
  Archive,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall,
  Lock,
  Globe,
  Crown,
  Bot
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserRole(localStorage.getItem("userRole"));
  }, [location]);

  const [selectedLang, setSelectedLang] = useState(() => {
    const cookies = document.cookie.split(";");
    const googTransCookie = cookies.find((c) => c.trim().startsWith("googtrans="));
    if (googTransCookie) {
      const parts = googTransCookie.split("/");
      return parts[parts.length - 1] || "en";
    }
    return localStorage.getItem("app_lang") || "en";
  });

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem("app_lang", langCode);

    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;

    const selectElem = document.querySelector(".goog-te-combo");
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  const handleFontSize = (size) => {
    setFontSize(size);
    if (size === "large") {
      document.documentElement.style.fontSize = "18px";
    } else if (size === "xlarge") {
      document.documentElement.style.fontSize = "20px";
    } else {
      document.documentElement.style.fontSize = "16px";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserRole(null);
    navigate("/login");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserRole(null);
    if (isAdminPortalPage) {
      navigate("/admin-login");
    } else {
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  // Authentication login pages
  const isCitizenAuthPage = location.pathname === "/login";
  const isOfficerAuthPage = location.pathname === "/admin-login";
  const isSuperAdminAuthPage = location.pathname === "/superadmin-login";
  const isAuthPage = isCitizenAuthPage || isOfficerAuthPage || isSuperAdminAuthPage;

  // Administrative portal contexts (STRICT ROUTE-BASED SEPARATION)
  const isOfficerRoute = location.pathname.startsWith("/admin");
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");
  const isAiCommandRoute = location.pathname === "/ai-command";
  const isServiceConfigRoute = location.pathname.startsWith("/service-config");

  // True ONLY when the current URL belongs to the Administrative Portal
  const isAdminPortalPage =
    isOfficerRoute ||
    isSuperAdminRoute ||
    isAiCommandRoute ||
    isServiceConfigRoute;

  // Check if current user is signed in with an administrative officer role
  const isUserAdminRole =
    Boolean(token) &&
    token !== "undefined" &&
    token !== "null" &&
    (userRole === "officer" || userRole === "superadmin" || userRole === "admin");

  // Strictly post-login valid citizen session
  const isValidCitizenSession =
    Boolean(token) &&
    token !== "undefined" &&
    token !== "null" &&
    userRole === "citizen";

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white border-b border-slate-200">
      {/* Official Government Top Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {isAdminPortalPage
                ? "Government Governance Portal • Restricted Administrative Console"
                : isAuthPage
                ? "Government Identity Gateway • Secure SSO Portal"
                : "Government of India • Municipal Infrastructure Portal"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-[11px]">
            <div className="hidden md:flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Civic Helpline: <a href="tel:18001112470" className="text-white font-bold hover:text-amber-300 transition">1800-111-2470</a></span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-950 text-white text-[11px] font-bold rounded px-2 py-0.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                title="Select Government Portal Language"
              >
                <option value="en">English (English)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-700 pl-3">
              <span className="text-[10px] uppercase text-slate-400 font-semibold mr-0.5 hidden sm:inline">Text Size:</span>
              <button
                onClick={() => handleFontSize("normal")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition cursor-pointer ${
                  fontSize === "normal" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                }`}
                title="Default text size"
              >
                A
              </button>
              <button
                onClick={() => handleFontSize("large")}
                className={`px-1.5 py-0.5 rounded text-[11px] font-extrabold transition cursor-pointer ${
                  fontSize === "large" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-300"
                }`}
                title="Large text size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Official Logo Branding */}
          <Link
            to={isAdminPortalPage ? "/admin" : "/"}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border group-hover:scale-105 transition-transform shrink-0 ${
              isAdminPortalPage ? "bg-indigo-950 text-amber-400 border-indigo-900" : "bg-blue-900 text-amber-400 border-blue-950"
            }`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                  Smart Civic
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                  isAdminPortalPage
                    ? (isSuperAdminRoute ? "bg-amber-100 text-amber-950 border-amber-300 font-extrabold" : "bg-indigo-100 text-indigo-950 border-indigo-300 font-extrabold")
                    : "bg-blue-50 text-blue-900 border-blue-200"
                }`}>
                  {isAdminPortalPage ? (isSuperAdminRoute ? "SUPERADMIN PORTAL" : "ADMIN PORTAL") : "e-Gov Portal"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                {isAdminPortalPage
                  ? (isSuperAdminRoute ? "Executive Master Governance Portal" : "Municipal Officer Command Center")
                  : "Public Grievance & SLA Monitoring"}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {isAdminPortalPage ? (
              /* =========================================
                 ADMINISTRATIVE PORTAL LINKS (DEDICATED)
                 ========================================= */
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition ${
                    isActive("/admin")
                      ? "bg-indigo-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Home / Dashboard
                </Link>

                <Link
                  to="/ai-command"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition ${
                    isActive("/ai-command")
                      ? "bg-blue-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  AI Command
                </Link>

                <Link
                  to="/service-config"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive("/service-config")
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  Service Rules
                </Link>

                <Link
                  to="/closed-complaints"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive("/closed-complaints")
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Archive className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  Archives
                </Link>

                {userRole === "superadmin" && (
                  <Link
                    to="/superadmin"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition ${
                      isActive("/superadmin")
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-900 text-amber-300 hover:bg-slate-950 border border-slate-800"
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    SuperAdmin Master
                  </Link>
                )}
              </>
            ) : isAuthPage ? (
              <Link
                to={isOfficerAuthPage || isSuperAdminAuthPage ? "/admin" : "/"}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
              >
                {isOfficerAuthPage || isSuperAdminAuthPage ? "Return to Officer Portal" : "Return to Public Portal"}
              </Link>
            ) : (
              /* =========================================
                 PUBLIC CITIZEN PORTAL LINKS (DEDICATED)
                 ========================================= */
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive("/")
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/register"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive("/register")
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <FilePlus2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Register Issue
                </Link>

                <Link
                  to="/track"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive("/track") || location.pathname.startsWith("/track/")
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Track Status
                </Link>

                <Link
                  to="/transparency"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-extrabold transition ${
                    isActive("/transparency")
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Public Portal
                </Link>

                <Link
                  to="/closed-complaints"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive("/closed-complaints")
                      ? "bg-blue-50 text-blue-900 border border-blue-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Archive className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  Archive
                </Link>
              </>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {isAdminPortalPage ? (
              /* Administrative Portal Action Bar */
              isUserAdminRole ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-indigo-950 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" /> Officer Session Active
                  </span>

                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-400" /> End Admin Session
                  </button>
                </div>
              ) : isOfficerAuthPage || isSuperAdminAuthPage ? (
                null
              ) : (
                <Link
                  to="/admin-login"
                  className="flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition active:scale-95 border border-indigo-950"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Officer Sign In
                </Link>
              )
            ) : isAuthPage ? (
              null
            ) : (
              /* Public Citizen Portal Action Bar (STRICTLY CITIZEN - NO OFFICER PORTAL BUTTONS) */
              isValidCitizenSession ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className={`p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition ${
                      isActive("/profile") ? "bg-blue-50 text-blue-900 border-blue-300" : ""
                    }`}
                    title="User Account & History"
                  >
                    <User className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-300 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition active:scale-95 border border-blue-950"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" /> Citizen Sign In
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {isAdminPortalPage ? (
            /* Admin Mobile Drawer */
            <>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-900 hover:bg-white"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-900" /> Home / Officer Dashboard
              </Link>
              <Link
                to="/ai-command"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-slate-900 hover:bg-white"
              >
                <Bot className="w-4 h-4 text-blue-900" /> AI Command Center
              </Link>
              <Link
                to="/service-config"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <Settings className="w-4 h-4 text-slate-600" /> Service Rules
              </Link>
              <Link
                to="/closed-complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <Archive className="w-4 h-4 text-slate-600" /> Archives
              </Link>
              {userRole === "superadmin" && (
                <Link
                  to="/superadmin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
                >
                  <Crown className="w-4 h-4 text-amber-500" /> SuperAdmin Master
                </Link>
              )}
            </>
          ) : isAuthPage ? (
            <Link
              to={isOfficerAuthPage || isSuperAdminAuthPage ? "/admin" : "/"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white"
            >
              {isOfficerAuthPage || isSuperAdminAuthPage ? "Return to Officer Portal" : "Return to Public Portal"}
            </Link>
          ) : (
            /* Public Citizen Mobile Drawer (NO OFFICER PORTAL OR HEATMAP) */
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <Building2 className="w-4 h-4 text-blue-900" /> Home
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <FilePlus2 className="w-4 h-4 text-blue-600" /> Register Issue
              </Link>
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <Search className="w-4 h-4 text-emerald-600" /> Track Status
              </Link>
              <Link
                to="/transparency"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Public Portal
              </Link>
              <Link
                to="/closed-complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-white"
              >
                <Archive className="w-4 h-4 text-slate-600" /> Archive
              </Link>
            </>
          )}

          {/* Drawer Auth Controls */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            {isAdminPortalPage ? (
              isUserAdminRole ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAdminLogout();
                  }}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-amber-400" /> End Admin Session
                </button>
              ) : (
                <Link
                  to="/admin-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-indigo-900 text-white py-2.5 rounded-lg font-semibold text-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Officer Sign In
                </Link>
              )
            ) : isValidCitizenSession ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 bg-red-700 text-white py-2.5 rounded-lg font-semibold text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> End Session
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-blue-900 text-white py-2.5 rounded-lg font-semibold text-xs"
              >
                <User className="w-3.5 h-3.5 text-amber-400" /> Citizen Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}