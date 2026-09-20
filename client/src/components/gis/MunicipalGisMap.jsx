import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayerGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Filter, Layers, Flame, Search, ShieldCheck, Eye, Navigation } from "lucide-react";

const MUNICIPAL_DEPARTMENTS = [
  "Water Supply & Sewerage Board",
  "Drainage & Stormwater Division",
  "Roads & Highway Dept",
  "Public Works Dept (PWD)",
  "Electrical & Energy Dept",
  "Power Distribution & Grid Division",
  "Sanitation & Waste Management",
  "Public Health & Hygiene Dept",
  "Enforcement & Anti-Littering Squad",
  "Animal Husbandry & Veterinary Services",
  "Emergency Forestry & Pruning Squad",
  "Parks & Recreation Department",
  "Town Planning & Building Control",
  "Traffic Infrastructure & Signals Division",
  "Public Transit Infrastructure Dept"
];

// Custom Leaflet Pin Icon Generator based on status color
const createCustomIcon = (status) => {
  let color = "#dc2626"; // Pending = Red
  if (status === "Accepted") color = "#ea580c"; // Orange
  if (status === "In Progress") color = "#2563eb"; // Blue
  if (status === "Completed") color = "#16a34a"; // Green
  if (status === "Closed") color = "#64748b"; // Gray

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom Icon for Searched Location Pin
const createSearchPinIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="38" height="38">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    className: "search-leaflet-marker",
    html: `<div style="position:relative;"><span style="position:absolute;-top:6px;-left:6px;width:50px;height:50px;border-radius:50%;background:rgba(79,70,229,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>${svg}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

// Custom Icon for Live User GPS Location
const createLiveGpsPinIcon = () => {
  return L.divIcon({
    className: "live-gps-marker",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
        <span style="position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(16,185,129,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        <span style="position:absolute;width:26px;height:26px;border-radius:50%;background:rgba(16,185,129,0.6);animation:pulse 2s infinite;"></span>
        <div style="position:relative;width:18px;height:18px;border-radius:50%;background:#059669;border:3px solid #ffffff;box-shadow:0 0 10px rgba(0,0,0,0.6);"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

function MapFlyController({ targetCoords, markers }) {
  const map = useMap();
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Invalidate size after mount so map tiles load cleanly without grey boxes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (targetCoords && targetCoords.lat && targetCoords.lng) {
      map.flyTo([targetCoords.lat, targetCoords.lng], 14, { duration: 1.5 });
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [targetCoords, map]);

  // Automatically center map to actual registered complaints when markers are loaded or added
  useEffect(() => {
    if (Array.isArray(markers) && markers.length > 0) {
      if (prevCountRef.current !== markers.length) {
        prevCountRef.current = markers.length;
        if (markers.length === 1) {
          map.flyTo([markers[0].latitude, markers[0].longitude], 14, { duration: 1.2 });
        } else {
          const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]));
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    } else {
      prevCountRef.current = 0;
    }
  }, [markers, map]);

  return null;
}

export default function MunicipalGisMap({ onSelectComplaint }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [mapMode, setMapMode] = useState("both"); // 'both' (default), 'markers', or 'heatmap'
  const [targetCoords, setTargetCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [userLiveLocation, setUserLiveLocation] = useState(null);
  const [isDetectingLive, setIsDetectingLive] = useState(false);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  const [deptList, setDeptList] = useState(MUNICIPAL_DEPARTMENTS);

  const centerPosition = [12.9716, 77.5946]; // Default City Center coordinates

  // Live User GPS Location Detection
  const detectUserLiveLocation = () => {
    setIsDetectingLive(true);
    if (!navigator.geolocation) {
      fallbackIpLiveLocation();
      return;
    }

    // Attempt 1: High accuracy GPS (5s timeout)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await resolveLiveLocation(lat, lng, "High-Accuracy Device GPS");
      },
      (err) => {
        console.log("GPS high accuracy note, trying standard accuracy:", err.message);
        // Attempt 2: Standard/Cached browser location
        navigator.geolocation.getCurrentPosition(
          async (pos2) => {
            await resolveLiveLocation(pos2.coords.latitude, pos2.coords.longitude, "Standard Device Location");
          },
          async (err2) => {
            console.log("Standard location note, attempting IP fallback:", err2.message);
            await fallbackIpLiveLocation();
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const fallbackIpLiveLocation = async () => {
    try {
      let lat = null;
      let lng = null;

      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          lat = parseFloat(data.latitude);
          lng = parseFloat(data.longitude);
        }
      } catch (e) {}

      if (!lat || !lng) {
        try {
          const res2 = await fetch("https://freeipapi.com/api/json");
          const data2 = await res2.json();
          if (data2.latitude && data2.longitude) {
            lat = parseFloat(data2.latitude);
            lng = parseFloat(data2.longitude);
          }
        } catch (e) {}
      }

      if (lat && lng) {
        await resolveLiveLocation(lat, lng, "Network IP Geolocation");
      } else {
        alert("Location access restricted. You can search your city/area in the search box above.");
        setIsDetectingLive(false);
      }
    } catch (e) {
      alert("Unable to detect location. Please use the search bar above to locate your area.");
      setIsDetectingLive(false);
    }
  };

  const resolveLiveLocation = async (lat, lng, sourceLabel) => {
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const geoData = await geoRes.json();
      const placeName = geoData.display_name
        ? geoData.display_name.split(",").slice(0, 3).join(",")
        : `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
      const fullAddress = geoData.display_name || `Coordinates: ${lat}, ${lng}`;

      const locObj = {
        lat,
        lng,
        name: placeName,
        address: fullAddress,
        source: sourceLabel,
      };

      setUserLiveLocation(locObj);
      setTargetCoords({ lat, lng });
      setLiveAlert({
        id: "LIVE-GPS",
        category: "Live Location Detected",
        issue: placeName,
        address: fullAddress,
      });
      setTimeout(() => setLiveAlert(null), 8000);
    } catch (err) {
      const locObj = {
        lat,
        lng,
        name: `Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`,
        address: `Live GPS Position (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        source: sourceLabel,
      };
      setUserLiveLocation(locObj);
      setTargetCoords({ lat, lng });
    } finally {
      setIsDetectingLive(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGisData(true);

    // Fetch backend departments list
    fetch("http://localhost:8000/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
          const names = data.departments.map((d) => d.name || d).filter(Boolean);
          setDeptList((prev) => Array.from(new Set([...prev, ...names])));
        }
      })
      .catch((err) => console.log("Dept fetch note:", err));

    // Real-Time 3-Second Live Polling Engine
    const intervalId = setInterval(() => {
      fetchGisData(false);
    }, 3000);

    // Event-driven real-time updates on instant complaint submission
    const handleLiveEvent = () => fetchGisData(false);
    window.addEventListener("scms_complaint_registered", handleLiveEvent);
    window.addEventListener("storage", handleLiveEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("scms_complaint_registered", handleLiveEvent);
      window.removeEventListener("storage", handleLiveEvent);
    };
  }, []);

  const fetchGisData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("http://localhost:8000/api/gis/map-data");
      const data = await res.json();
      if (data.success && Array.isArray(data.markers)) {
        setMarkers((prevMarkers) => {
          // Check for newly registered complaints
          if (prevMarkers.length > 0 && data.markers.length > prevMarkers.length) {
            const existingIds = new Set(prevMarkers.map((m) => m._id));
            const newComplaint = data.markers.find((m) => !existingIds.has(m._id));

            if (newComplaint && newComplaint.latitude && newComplaint.longitude) {
              setTargetCoords({ lat: newComplaint.latitude, lng: newComplaint.longitude });
              setLiveAlert({
                id: newComplaint.complaintId,
                category: newComplaint.category,
                issue: newComplaint.issue,
                address: newComplaint.address,
              });
              setTimeout(() => setLiveAlert(null), 6000);
            }
          }
          return data.markers;
        });
      }
    } catch (err) {
      console.error("Fetch GIS Map Data Error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleLocationSearch = async (queryStr) => {
    const query = queryStr !== undefined ? queryStr : search;
    if (!query || !query.trim()) return;
    const qLower = query.toLowerCase().trim();

    // 1. First check if any existing complaints match the search string (including address & location)
    const localMatches = markers.filter((m) =>
      m.complaintId.toLowerCase().includes(qLower) ||
      m.category.toLowerCase().includes(qLower) ||
      m.issue.toLowerCase().includes(qLower) ||
      m.ward.toLowerCase().includes(qLower) ||
      m.department.toLowerCase().includes(qLower) ||
      (m.address || "").toLowerCase().includes(qLower)
    );

    if (localMatches.length > 0) {
      const match = localMatches[0];
      const coords = { lat: match.latitude, lng: match.longitude };
      setTargetCoords(coords);
      setSearchedLocation({
        name: `${match.complaintId}: ${match.category} - ${match.issue}`,
        address: match.address || match.ward,
        lat: match.latitude,
        lng: match.longitude,
      });
      return;
    }

    // 2. Perform Geocoding lookup via OpenStreetMap Nominatim for city/place search (e.g. Ankola, Mysore, etc.)
    try {
      setIsSearchingGeocode(true);
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const geoData = await geoRes.json();

      if (Array.isArray(geoData) && geoData.length > 0) {
        const first = geoData[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        const coords = { lat: newLat, lng: newLng };

        setTargetCoords(coords);
        setSearchedLocation({
          name: first.display_name.split(",")[0] || query,
          address: first.display_name,
          lat: newLat,
          lng: newLng,
        });
      } else {
        alert(`Location "${query}" not found on map geocoder. Try typing city or area name (e.g. "Ankola", "Bengaluru", "Mysuru").`);
      }
    } catch (err) {
      console.log("Geocode search note:", err.message);
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const filteredMarkers = markers.filter((m) => {
    const val = search.toLowerCase().trim();
    if (!val) return (statusFilter === "All" || m.status === statusFilter) && (departmentFilter === "All" || m.department === departmentFilter);

    const matchesSearch =
      m.complaintId.toLowerCase().includes(val) ||
      m.category.toLowerCase().includes(val) ||
      m.issue.toLowerCase().includes(val) ||
      m.ward.toLowerCase().includes(val) ||
      m.department.toLowerCase().includes(val) ||
      (m.address || "").toLowerCase().includes(val);

    const matchesStatus = statusFilter === "All" || m.status === statusFilter;
    const matchesDept = departmentFilter === "All" || m.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const departments = Array.from(
    new Set([
      ...deptList,
      ...markers.map((m) => m.department).filter(Boolean),
    ])
  ).sort();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-4">
      {/* Real-time Notification Banner for newly registered complaints */}
      {liveAlert && (
        <div className="bg-emerald-900 text-white p-3 rounded-xl border border-emerald-700 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-300 tracking-wider">Live Grievance Mapped Real-Time</span>
              <p className="text-xs font-bold">
                {liveAlert.id}: {liveAlert.category} &rsaquo; {liveAlert.issue} ({liveAlert.address})
              </p>
            </div>
          </div>
          <button
            onClick={() => setLiveAlert(null)}
            className="text-xs text-emerald-300 hover:text-white font-bold px-2 py-1 rounded bg-emerald-950/60"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Live GIS Command Layer</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700 ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Real-time Feed Active ({markers.length} Live)
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white">City-Wide Municipal GIS Map & Heat Density</h3>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Live Automatic Location Detection Button */}
          <button
            type="button"
            onClick={detectUserLiveLocation}
            disabled={isDetectingLive}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer disabled:opacity-50 border border-emerald-400/40"
            title="Detect and fly to your live GPS coordinates"
          >
            {isDetectingLive ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Detecting GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>📍 Detect Live Location</span>
              </>
            )}
          </button>

          {/* Search Bar with Search Button */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search City (e.g. Ankola), Ward, Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              className="px-2.5 py-1.5 bg-transparent text-white text-xs outline-none w-40 sm:w-48"
            />
            <button
              onClick={() => handleLocationSearch()}
              disabled={isSearchingGeocode}
              className="bg-blue-900 hover:bg-blue-950 text-white font-extrabold px-3 py-1.5 text-xs transition border-l border-slate-700 cursor-pointer"
            >
              {isSearchingGeocode ? "..." : "Go"}
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none font-bold cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white py-1">All Statuses</option>
            <option value="Pending" className="bg-slate-900 text-white py-1">Pending (Red)</option>
            <option value="Accepted" className="bg-slate-900 text-white py-1">Accepted (Orange)</option>
            <option value="In Progress" className="bg-slate-900 text-white py-1">In Progress (Blue)</option>
            <option value="Completed" className="bg-slate-900 text-white py-1">Completed (Green)</option>
            <option value="Closed" className="bg-slate-900 text-white py-1">Closed (Gray)</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none font-bold cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white py-1">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white py-1">{d}</option>
            ))}
          </select>

          {/* Mode Selector - Both (Heatmap + Pins), Pin Markers, or Heatmap */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setMapMode("both")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                mapMode === "both"
                  ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40 font-extrabold scale-102"
                  : "hover:text-white hover:bg-slate-700/60"
              }`}
              title="Show Both Heatmap Density and Pin Markers"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Both (Heatmap + Pins)</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("markers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                mapMode === "markers"
                  ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40 font-extrabold scale-102"
                  : "hover:text-white hover:bg-slate-700/60"
              }`}
              title="Show Pin Markers Only"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Pin Markers</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("heatmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                mapMode === "heatmap"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md ring-2 ring-red-400/40 font-extrabold scale-102"
                  : "hover:text-white hover:bg-slate-700/60"
              }`}
              title="Show Thermal Heatmap Density Visualization"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Heatmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Map Box */}
      <div className="w-full h-[540px] rounded-xl overflow-hidden border border-slate-200 relative z-10">
        {/* On-Map Dynamic HUD Layer Status Badge */}
        <div className="absolute top-3 right-3 z-[1000] pointer-events-none">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-lg backdrop-blur-md border flex items-center gap-2 transition-all duration-300 ${
            mapMode === "both"
              ? "bg-slate-900/90 text-blue-300 border-blue-500/40 shadow-blue-950/40"
              : mapMode === "markers"
              ? "bg-slate-900/90 text-indigo-300 border-indigo-500/40 shadow-indigo-950/40"
              : "bg-slate-900/90 text-amber-300 border-amber-500/40 shadow-red-950/40"
          }`}>
            {mapMode === "both" && (
              <>
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Dual Layer: Pin Markers & Radiant Heatmap Active</span>
              </>
            )}
            {mapMode === "markers" && (
              <>
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Pin Markers Layer Active ({filteredMarkers.length} Pins)</span>
              </>
            )}
            {mapMode === "heatmap" && (
              <>
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>Thermal Heat Density Layer Active ({filteredMarkers.length} Heat Zones)</span>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold text-xs">
            Loading Spatial GIS Layers & Real-time Complaints...
          </div>
        ) : (
          <MapContainer center={centerPosition} zoom={12} scrollWheelZoom={true} className="w-full h-full">
            <MapFlyController targetCoords={targetCoords} markers={filteredMarkers} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Radiant Thermal Heatmap Density Layers (Shown in 'both' or 'heatmap' mode) */}
            {(mapMode === "both" || mapMode === "heatmap") &&
              filteredMarkers.map((m) => {
                const isHeatmapOnly = mapMode === "heatmap";
                const impact = m.impactScore || 50;

                let outerRadius = isHeatmapOnly ? 85 : 65;
                let midRadius = isHeatmapOnly ? 48 : 36;
                let coreRadius = isHeatmapOnly ? 22 : 14;
                let outerColor = "#10b981";
                let midColor = "#059669";
                let coreColor = "#047857";
                let intensityLabel = "Standard Activity";

                if (impact >= 120) {
                  outerRadius = isHeatmapOnly ? 100 : 80;
                  midRadius = isHeatmapOnly ? 58 : 44;
                  coreRadius = isHeatmapOnly ? 28 : 18;
                  outerColor = "#ef4444";
                  midColor = "#dc2626";
                  coreColor = "#b91c1c";
                  intensityLabel = "Critical Emergency Core";
                } else if (impact >= 80) {
                  outerRadius = isHeatmapOnly ? 88 : 70;
                  midRadius = isHeatmapOnly ? 50 : 38;
                  coreRadius = isHeatmapOnly ? 24 : 16;
                  outerColor = "#f97316";
                  midColor = "#ea580c";
                  coreColor = "#c2410c";
                  intensityLabel = "High-Intensity Hotspot";
                } else if (impact >= 40) {
                  outerRadius = isHeatmapOnly ? 75 : 58;
                  midRadius = isHeatmapOnly ? 42 : 32;
                  coreRadius = isHeatmapOnly ? 20 : 13;
                  outerColor = "#eab308";
                  midColor = "#ca8a04";
                  coreColor = "#a16207";
                  intensityLabel = "Moderate Density Zone";
                }

                return (
                  <LayerGroup key={`thermal-group-${m._id}`}>
                    {/* Layer 1: Outer Radiant Heat Diffusion Halo */}
                    <CircleMarker
                      center={[m.latitude, m.longitude]}
                      radius={outerRadius}
                      pathOptions={{
                        fillColor: outerColor,
                        color: outerColor,
                        weight: 1,
                        opacity: isHeatmapOnly ? 0.35 : 0.22,
                        fillOpacity: isHeatmapOnly ? 0.25 : 0.15,
                      }}
                    />

                    {/* Layer 2: Mid-range Thermal Density Halo */}
                    <CircleMarker
                      center={[m.latitude, m.longitude]}
                      radius={midRadius}
                      pathOptions={{
                        fillColor: midColor,
                        color: midColor,
                        weight: 1.5,
                        opacity: isHeatmapOnly ? 0.55 : 0.38,
                        fillOpacity: isHeatmapOnly ? 0.45 : 0.28,
                      }}
                    />

                    {/* Layer 3: Core Thermal Hotspot with Interactive Details */}
                    <CircleMarker
                      center={[m.latitude, m.longitude]}
                      radius={coreRadius}
                      pathOptions={{
                        fillColor: coreColor,
                        color: "#ffffff",
                        weight: 2,
                        opacity: 0.9,
                        fillOpacity: isHeatmapOnly ? 0.85 : 0.6,
                      }}
                    >
                      <Popup className="custom-gis-popup">
                        <div className="p-1 space-y-1 text-xs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                            <span className="font-extrabold text-red-600 uppercase text-[10px] flex items-center gap-1">
                              <Flame className="w-3 h-3 text-red-600 animate-pulse" /> {intensityLabel}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              Impact: {m.impactScore}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-sm">{m.category} &rsaquo; {m.issue}</p>
                          <p className="text-[11px] text-slate-600"><b>Location:</b> {m.ward} ({m.address})</p>
                          <p className="text-[10px] text-slate-500 font-medium">Status: {m.status} | Dept: {m.department}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </LayerGroup>
                );
              })}

            {/* Pin Marker View (Shown in 'both' or 'markers' mode) */}
            {(mapMode === "both" || mapMode === "markers") &&
              filteredMarkers.map((m) => (
                <Marker
                  key={`pin-${m._id}`}
                  position={[m.latitude, m.longitude]}
                  icon={createCustomIcon(m.status)}
                >
                  <Popup className="custom-gis-popup">
                    <div className="p-1 space-y-2 text-xs max-w-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                        <span className="font-extrabold text-blue-900">{m.complaintId}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {m.status}
                        </span>
                      </div>

                      <p className="font-bold text-slate-900 text-sm">{m.category} &rsaquo; {m.issue}</p>
                      <p className="text-[11px] text-slate-600"><b>Department:</b> {m.department}</p>
                      <p className="text-[11px] text-slate-600"><b>Location:</b> {m.ward} ({m.address})</p>

                      <div className="text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                        <b>Impact Score:</b> <span className="text-red-700 font-bold">{m.impactScore}</span>
                      </div>

                      {onSelectComplaint && (
                        <button
                          onClick={() => onSelectComplaint(m._id)}
                          className="w-full mt-1 bg-blue-900 hover:bg-blue-950 text-white font-bold py-1 px-2 rounded text-[11px] flex items-center justify-center gap-1 transition"
                        >
                          <Eye className="w-3 h-3" /> Inspect Grievance
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* Live GPS Detected User Location Pin with Pulsing Radar Halo */}
            {userLiveLocation && (
              <>
                <CircleMarker
                  center={[userLiveLocation.lat, userLiveLocation.lng]}
                  radius={45}
                  pathOptions={{
                    fillColor: "#10b981",
                    color: "#059669",
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.18,
                  }}
                />
                <Marker
                  position={[userLiveLocation.lat, userLiveLocation.lng]}
                  icon={createLiveGpsPinIcon()}
                >
                  <Popup defaultOpen>
                    <div className="p-1 space-y-1.5 text-xs max-w-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold uppercase text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        📍 Your Live Detected Location
                      </div>
                      <p className="font-extrabold text-slate-900 text-sm leading-tight">{userLiveLocation.name}</p>
                      <p className="text-[11px] text-slate-600 leading-snug">{userLiveLocation.address}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-100">
                        <span>{userLiveLocation.source}</span>
                        <span className="text-emerald-700 font-mono">[{userLiveLocation.lat.toFixed(4)}, {userLiveLocation.lng.toFixed(4)}]</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Special Highlighted Marker Pin for Searched Location */}
            {searchedLocation && (
              <Marker
                position={[searchedLocation.lat, searchedLocation.lng]}
                icon={createSearchPinIcon()}
              >
                <Popup defaultOpen>
                  <div className="p-1 space-y-1 text-xs">
                    <span className="font-black text-indigo-900 uppercase text-[10px]">📍 Searched Location</span>
                    <p className="font-bold text-slate-900 text-sm">{searchedLocation.name}</p>
                    <p className="text-[11px] text-slate-600 leading-snug">{searchedLocation.address}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}

        {/* Empty State Overlay when 0 complaints exist */}
        {!loading && filteredMarkers.length === 0 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-slate-700 shadow-xl flex items-center gap-2.5 text-xs pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              0 Active Grievances in this view &mdash; Registered complaints appear here dynamically at their exact reported locations.
            </span>
          </div>
        )}
      </div>


      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 border-t border-slate-100 pt-3">
        <span className="text-slate-400 uppercase text-[10px]">Status Marker Colors:</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Pending</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Accepted</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Completed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Closed</span>
        </div>
      </div>
    </div>
  );
}
