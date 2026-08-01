import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, ExternalLink, Crosshair } from "lucide-react";

// Fix Leaflet default icon URL issue in React/Vite
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component to re-center map view when coordinates change
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
    }
  }, [lat, lng, map]);
  return null;
}

// Helper component to handle map clicks and drag pin to change location
function LocationMarker({ position, onLocationSelect, address }) {
  const map = useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable={!!onLocationSelect}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(pos.lat, pos.lng);
          }
        },
      }}
    >
      <Popup>
        <div className="text-xs p-1 space-y-1">
          <p className="font-bold text-slate-900 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-600 inline" /> Incident Location
          </p>
          <p className="text-slate-600 leading-tight">{address || "Captured Incident Site"}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            {position[0]?.toFixed(6)}, {position[1]?.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function IncidentMap({
  latitude,
  longitude,
  address,
  onLocationSelect,
  height = "350px",
  interactive = true,
}) {
  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);

  const isValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat !== 0 && parsedLng !== 0;

  // Default center if no coordinates set (General India Overview map)
  const centerLat = isValidCoords ? parsedLat : 20.5937;
  const centerLng = isValidCoords ? parsedLng : 78.9629;
  const zoom = isValidCoords ? 15 : 5;

  return (
    <div className="space-y-2">
      {/* Map Container Header */}
      <div className="flex justify-between items-center bg-slate-900 text-white px-4 py-2.5 rounded-t-xl text-xs font-bold flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Interactive Incident Location Map</span>
        </div>

        <div className="flex items-center gap-3">
          {isValidCoords && (
            <a
              href={`https://www.google.com/maps?q=${parsedLat},${parsedLng}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition"
            >
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div
        style={{ height }}
        className="w-full rounded-b-xl border-x border-b border-slate-300 overflow-hidden shadow-xs relative z-10"
      >
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {isValidCoords && <RecenterMap lat={parsedLat} lng={parsedLng} />}

          <LocationMarker
            position={isValidCoords ? [parsedLat, parsedLng] : null}
            onLocationSelect={onLocationSelect}
            address={address || "Selected Incident Spot"}
          />
        </MapContainer>
      </div>

      {interactive && onLocationSelect && (
        <p className="text-[11px] text-slate-600 font-medium text-center bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
          📍 <strong>How to set location:</strong> Click anywhere on the map or drag the pin to mark the exact incident spot.
        </p>
      )}
    </div>
  );
}
