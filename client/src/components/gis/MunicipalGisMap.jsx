import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Filter, Layers, Flame, Search, ShieldCheck, Eye } from "lucide-react";

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

function MapFlyController({ targetCoords }) {
  const map = useMap();

  useEffect(() => {
    if (targetCoords && targetCoords.lat && targetCoords.lng) {
      map.flyTo([targetCoords.lat, targetCoords.lng], 13, { duration: 1.5 });
    }
  }, [targetCoords, map]);

  return null;
}

export default function MunicipalGisMap({ onSelectComplaint }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [mapMode, setMapMode] = useState("markers"); // 'markers' or 'heatmap'
  const [targetCoords, setTargetCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);

  const centerPosition = [12.9716, 77.5946]; // Default City Center coordinates

  useEffect(() => {
    fetchGisData();
  }, []);

  const fetchGisData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/gis/map-data");
      const data = await res.json();
      if (data.success && Array.isArray(data.markers)) {
        setMarkers(data.markers);
      }
    } catch (err) {
      console.error("Fetch GIS Map Data Error:", err);
    } finally {
      setLoading(false);
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
      setTargetCoords({ lat: localMatches[0].latitude, lng: localMatches[0].longitude });
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

        setTargetCoords({ lat: newLat, lng: newLng });
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

  const departments = [...new Set(markers.map((m) => m.department).filter(Boolean))];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-4">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-400" /> Live GIS Command Layer
          </div>
          <h3 className="text-base font-extrabold text-white">City-Wide Municipal GIS Map & Heat Density</h3>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Bar with Search Button */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search City (e.g. Ankola), Ward, Ref..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.length > 2) {
                  handleLocationSearch(e.target.value);
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              className="px-2.5 py-1.5 bg-transparent text-white text-xs outline-none w-44 sm:w-56"
            />
            <button
              onClick={() => handleLocationSearch()}
              disabled={isSearchingGeocode}
              className="bg-blue-900 hover:bg-blue-950 text-white font-extrabold px-3 py-1.5 text-xs transition border-l border-slate-700"
            >
              {isSearchingGeocode ? "Searching..." : "Go"}
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending (Red)</option>
            <option value="Accepted">Accepted (Orange)</option>
            <option value="In Progress">In Progress (Blue)</option>
            <option value="Completed">Completed (Green)</option>
            <option value="Closed">Closed (Gray)</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs outline-none font-bold"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Mode Toggle Button */}
          <button
            onClick={() => setMapMode(mapMode === "markers" ? "heatmap" : "markers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition border ${
              mapMode === "heatmap"
                ? "bg-red-600 text-white border-red-500"
                : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {mapMode === "heatmap" ? "Heatmap View" : "Pin Markers"}
          </button>
        </div>
      </div>

      {/* Leaflet Map Box */}
      <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 relative z-10">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold text-xs">
            Loading Spatial GIS Layers & Complaints...
          </div>
        ) : (
          <MapContainer center={centerPosition} zoom={12} scrollWheelZoom={true} className="w-full h-full">
            <MapFlyController targetCoords={targetCoords} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pin Marker View */}
            {mapMode === "markers" &&
              filteredMarkers.map((m) => (
                <Marker
                  key={m._id}
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

                      <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div><b>Impact Score:</b> <span className="text-red-700 font-bold">{m.impactScore}</span></div>
                        <div><b>Confidence:</b> <span className="text-emerald-700 font-bold">{m.confidenceScore}%</span></div>
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

            {/* Heatmap Density Circles View */}
            {mapMode === "heatmap" &&
              filteredMarkers.map((m) => {
                let circleColor = "#16a34a"; // Low
                let radius = 15;
                if (m.impactScore >= 150) { circleColor = "#dc2626"; radius = 35; }
                else if (m.impactScore >= 100) { circleColor = "#ea580c"; radius = 28; }
                else if (m.impactScore >= 50) { circleColor = "#ca8a04"; radius = 20; }

                return (
                  <CircleMarker
                    key={`heat-${m._id}`}
                    center={[m.latitude, m.longitude]}
                    radius={radius}
                    pathOptions={{
                      fillColor: circleColor,
                      color: circleColor,
                      weight: 1,
                      opacity: 0.6,
                      fillOpacity: 0.4,
                    }}
                  />
                );
              })}
          </MapContainer>
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
