import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  MapPin,
  FileCheck2,
  Send,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  AlertCircle,
  Video,
  XCircle,
  Image as ImageIcon,
  Plus,
  Search
} from "lucide-react";
import { createComplaint } from "../api/complaintApi";
import IncidentMap from "./UI/IncidentMap";
import { INDIAN_MUNICIPAL_HIERARCHY } from "../data/municipalHierarchy";

export default function ComplaintForm({ category, issue }) {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const cameraFileInput = useRef(null);
  const videoFileInput = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Multi-Photo List & Camera States (Max 5 Photos)
  const [imageList, setImageList] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraError, setCameraError] = useState("");

  // Video Evidence State (Optional Video File)
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState("");

  // Municipal Administrative Jurisdiction States
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bengaluru Urban (BBMP)");
  const [selectedZone, setSelectedZone] = useState("North Zone");
  const [selectedWardName, setSelectedWardName] = useState("Ward 101 - Yelahanka New Town");

  // Citizen Form State
  const [formData, setFormData] = useState({
    citizenName: "",
    phone: "",
    email: "",
    remarks: "",
  });

  // Location State (Restored from localStorage on refresh to prevent IP-jump errors)
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("scms_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.latitude && parsed.longitude) {
          return {
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            address: parsed.address || "",
            city: parsed.city || "",
            state: parsed.state || "",
            pincode: parsed.pincode || "",
            country: parsed.country || "",
          };
        }
      }
    } catch (e) {
      console.log("Error reading stored location:", e);
    }
    return {
      latitude: "",
      longitude: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    };
  });

  const [locationSource, setLocationSource] = useState(() => {
    try {
      const saved = localStorage.getItem("scms_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.locationSource) return parsed.locationSource;
      }
    } catch (e) {}
    return "";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Restore saved jurisdiction options from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("scms_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedState) setSelectedState(parsed.selectedState);
        if (parsed.selectedDistrict) setSelectedDistrict(parsed.selectedDistrict);
        if (parsed.selectedZone) setSelectedZone(parsed.selectedZone);
        if (parsed.selectedWardName) setSelectedWardName(parsed.selectedWardName);
      }
    } catch (e) {}
  }, []);

  // Persist location & jurisdiction changes to localStorage permanently
  useEffect(() => {
    if (location.latitude && location.longitude) {
      try {
        localStorage.setItem(
          "scms_user_location",
          JSON.stringify({
            ...location,
            selectedState,
            selectedDistrict,
            selectedZone,
            selectedWardName,
            locationSource,
          })
        );
      } catch (e) {
        console.log("Error persisting location:", e);
      }
    }
  }, [location, selectedState, selectedDistrict, selectedZone, selectedWardName, locationSource]);

  // Function to clear saved location manually
  const clearSavedLocation = () => {
    try {
      localStorage.removeItem("scms_user_location");
    } catch (e) {}
    setLocation({
      latitude: "",
      longitude: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
    });
    setLocationSource("");
    setLocationError("");
    setSearchQuery("");
  };

  // UI / Loading State
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  // Attach video stream to <video> element once React mounts it
  useEffect(() => {
    if (isCameraActive && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current
        .play()
        .catch((err) => console.log("Video play note:", err));
    }
  }, [isCameraActive, mediaStream]);

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Client-side Image Compression Helper (Resizes & compresses photo to ~200KB)
  const compressImage = (dataUrl, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Handle File Upload from Disk (Multiple Files supported up to 5)
  const handleImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 5 - imageList.length;
    if (availableSlots <= 0) {
      alert("Maximum 5 photo evidence files allowed.");
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 20 * 1024 * 1024; // 20MB raw file limit before compression

    const newImages = [];
    let count = 0;

    filesToProcess.forEach((file) => {
      if (!allowedTypes.includes(file.type) && !file.type.startsWith("image/")) {
        alert(`File ${file.name} is not a valid image format.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds maximum 20 MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result);
        newImages.push(compressed);
        count++;

        if (count === filesToProcess.length) {
          setImageList((prev) => {
            const updated = [...prev, ...newImages].slice(0, 5);
            return updated;
          });

          if (!location.latitude) {
            detectLocation();
          }
        }
      };
      reader.readAsDataURL(file);
    });

    stopCamera();
  };

  // Handle Video Evidence Upload (Optimized to stay within Node Buffer limit)
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-matroska",
      "video/3gpp",
    ];

    if (!allowedVideoTypes.includes(file.type) && !file.type.startsWith("video/")) {
      alert("Invalid video file format. Please attach an MP4, WebM, or MOV video file.");
      return;
    }

    const maxVideoSize = 12 * 1024 * 1024; // 12MB limit for direct JSON payload
    if (file.size > maxVideoSize) {
      alert("Video file size exceeds 12 MB. Please select a shorter video clip under 12 MB to ensure fast portal upload.");
      return;
    }

    setVideoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoName("");
    if (videoFileInput.current) {
      videoFileInput.current.value = "";
    }
  };

  // Start Web Camera Feed with robust constraints
  const startCamera = async () => {
    if (imageList.length >= 5) {
      alert("Maximum 5 photo evidence limit reached.");
      return;
    }

    setCameraError("");
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
        } catch (facingErr) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }

        setMediaStream(stream);
        setIsCameraActive(true);
      } else {
        cameraFileInput.current?.click();
      }
    } catch (err) {
      console.error("Camera Access Error:", err);
      setCameraError(
        "Camera permission denied or device camera busy. You can choose a photo file instead."
      );
      cameraFileInput.current?.click();
    }
  };

  // Stop Camera Feed
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsCameraActive(false);
  };

  // Snap Photo from Live Camera Video Stream
  const snapPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const capturedDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      setImageList((prev) => {
        const updated = [...prev, capturedDataUrl].slice(0, 5);
        return updated;
      });

      stopCamera();

      // Auto-trigger GPS detection on initial photo capture if location not set
      if (!location.latitude) {
        detectLocation();
      }
    }
  };

  // Remove photo by index from gallery list
  const removeImageAt = (indexToRemove) => {
    setImageList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    stopCamera();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Helper to reverse geocode lat & lng into full address and auto-map jurisdiction
  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      setLocationError(""); // Clear any location error when coordinates are set
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const data = await response.json();

      const detectedState = data.address?.state || "";
      const detectedCity =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        data.address?.county ||
        data.address?.state_district ||
        "";

      setLocation({
        latitude,
        longitude,
        address: data.display_name || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: detectedCity,
        state: detectedState,
        pincode: data.address?.postcode || "",
        country: data.address?.country || "",
      });

      // Automatically map State, District/Corporation, Zone, and Ward!
      autoMapJurisdiction(detectedState, detectedCity, data);

    } catch (err) {
      console.log("Reverse Geocoding Note:", err);
      setLocationError("");
      setLocation((prev) => ({
        ...prev,
        latitude,
        longitude,
        address: prev.address || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      }));
    }
  };

  // Auto-map detected GPS address to State, District/Corporation, Zone, and Ward
  const autoMapJurisdiction = (detectedState, detectedCity, rawData) => {
    const fullText = (
      (detectedState || "") + " " +
      (detectedCity || "") + " " +
      (rawData?.display_name || "") + " " +
      (rawData?.address?.county || "") + " " +
      (rawData?.address?.state_district || "") + " " +
      (rawData?.address?.suburb || "") + " " +
      (rawData?.address?.town || "") + " " +
      (rawData?.address?.village || "")
    ).toLowerCase();

    // 1. Match State
    const statesList = Object.keys(INDIAN_MUNICIPAL_HIERARCHY);
    let matchedState = statesList.find(
      (s) => detectedState && s.toLowerCase().includes(detectedState.toLowerCase())
    );
    if (!matchedState && detectedState) {
      matchedState = statesList.find(
        (s) => detectedState.toLowerCase().includes(s.toLowerCase())
      );
    }
    if (!matchedState) matchedState = "Karnataka";

    setSelectedState(matchedState);

    // 2. Match District / Corporation
    const districtsObj = INDIAN_MUNICIPAL_HIERARCHY[matchedState] || {};
    const districtKeys = Object.keys(districtsObj);

    let matchedDistrict = districtKeys.find((d) => {
      const dLower = d.toLowerCase();
      const mainName = dLower.split("(")[0].trim();
      return fullText.includes(mainName) || fullText.includes(dLower);
    });

    if (!matchedDistrict) {
      const customDistName = rawData?.address?.county || rawData?.address?.state_district || detectedCity || "Local Municipal Division";
      matchedDistrict = `${customDistName} (Municipal Council / Panchayat)`;
    }

    setSelectedDistrict(matchedDistrict);

    // 3. Match Zone & Ward
    const zonesObj = districtsObj[matchedDistrict] || {};
    const zoneKeys = Object.keys(zonesObj);

    let matchedZone = "";
    let matchedWardName = "";

    if (zoneKeys.length > 0) {
      for (const zName of zoneKeys) {
        const wards = zonesObj[zName] || [];
        for (const w of wards) {
          const wLower = w.name.toLowerCase();
          const areaKeywords = wLower.replace(/ward \d+ - /, "").split(/[\/\,\-]/);
          if (areaKeywords.some((kw) => kw.trim().length > 3 && fullText.includes(kw.trim()))) {
            matchedZone = zName;
            matchedWardName = w.name;
            break;
          }
        }
        if (matchedWardName) break;
      }

      if (!matchedZone) {
        matchedZone = zoneKeys[0];
        const defaultWards = zonesObj[matchedZone] || [];
        matchedWardName = defaultWards[0]?.name || "Ward 01 - Main Division";
      }
    } else {
      matchedZone = "Central Division";
      const localTown = detectedCity || rawData?.address?.town || rawData?.address?.village || "Local Area";
      matchedWardName = `Ward 01 - ${localTown} Sector`;
    }

    setSelectedZone(matchedZone);
    setSelectedWardName(matchedWardName);
  };

  // Detect GPS Location using HTML5 Geolocation API with IP Geolocation Fallback
  const detectLocation = (sourceType = "manual-gps") => {
    if (!navigator.geolocation) {
      fallbackIpLocation(sourceType);
      return;
    }

    setIsDetectingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocationSource(sourceType);
        setLocationError("");
        await fetchAddressFromCoords(latitude, longitude);
        setIsDetectingLocation(false);
      },
      async (error) => {
        console.log("Geolocation API note, attempting IP fallback:", error.message);
        await fallbackIpLocation(sourceType);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  // Fallback to IP Geolocation when GPS API is blocked or times out on desktop
  const fallbackIpLocation = async (sourceType = "manual-gps") => {
    try {
      setIsDetectingLocation(true);
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLocationSource(sourceType);
        setLocationError("");
        await fetchAddressFromCoords(data.latitude, data.longitude);
      } else {
        setLocationError("Location permission restricted. Please search your landmark/address above or click on the map to place your pin.");
      }
    } catch (ipErr) {
      console.log("IP Geolocation Note:", ipErr);
      setLocationError("Please search your landmark/address above or click on the map to place your pin.");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Helper to parse raw coordinates or Google Maps URLs
  const parseCoordinatesOrSearch = (query) => {
    const trimmed = query.trim();
    // Google Maps URL containing @lat,lng or q=lat,lng
    const gmapsMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || trimmed.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (gmapsMatch) {
      return { lat: parseFloat(gmapsMatch[1]), lng: parseFloat(gmapsMatch[2]) };
    }
    // Raw lat, lng e.g. "12.9786, 77.364"
    const rawMatch = trimmed.match(/^@?(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
    if (rawMatch) {
      return { lat: parseFloat(rawMatch[1]), lng: parseFloat(rawMatch[2]) };
    }
    return null;
  };

  // Search Location by Landmark / Address or Coordinates / Google Maps URL
  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearchingLocation(true);
    setLocationError("");

    // 1. First check if user pasted raw coordinates or Google Maps URL
    const parsedCoords = parseCoordinatesOrSearch(query);
    if (parsedCoords) {
      setLocationSource("search");
      await fetchAddressFromCoords(parsedCoords.lat, parsedCoords.lng);
      setIsSearchingLocation(false);
      return;
    }

    // 2. Otherwise query OpenStreetMap Nominatim Geocoder API
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const first = results[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        setLocationSource("search");
        await fetchAddressFromCoords(lat, lon);
      } else {
        setLocationError(`No map location found for "${query}". Try adding a city name (e.g. "Yelahanka, Bengaluru" or "MG Road, Mysuru").`);
      }
    } catch (err) {
      console.error("Location Search Error:", err);
      setLocationError("Unable to reach map search service. Click directly on the map pin.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Submit Complaint
  const handleSubmit = async () => {
    if (!formData.citizenName || !formData.phone || !formData.email || imageList.length === 0) {
      alert("Please fill all required fields (Name, Phone, Email) and attach at least 1 photo evidence.");
      return;
    }

    if (!location.latitude && !location.address.trim()) {
      alert("Please either click 'Detect GPS Location' or enter your location address manually.");
      return;
    }

    try {
      setLoading(true);

      const response = await createComplaint({
        category,
        issue,
        citizenName: formData.citizenName,
        phone: formData.phone,
        email: formData.email,
        remarks: formData.remarks,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city || selectedDistrict,
        state: selectedState || location.state,
        district: selectedDistrict,
        zone: selectedZone,
        ward: selectedWardName,
        pincode: location.pincode,
        country: location.country,
        image: imageList[0], // Primary photo attached
        imageList,
        video: videoFile,
      });

      setComplaintId(response.data.complaintId);
      setShowSuccess(true);

      // Reset form
      setFormData({
        citizenName: "",
        phone: "",
        email: "",
        remarks: "",
      });
      setImageList([]);
      setVideoFile(null);
      setVideoName("");
      setLocation({
        latitude: "",
        longitude: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      });

    } catch (error) {
      console.log("ERROR:", error);
      alert(error.response?.data?.message || error.message || "Complaint submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Government Standard Multi-Step Wizard Indicator */}
      <div className="mb-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />

          <div className="relative z-10 flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
              category ? "bg-blue-900 text-white shadow-md" : "bg-slate-100 text-slate-500 border border-slate-300"
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">1. Category</span>
          </div>

          <div className="relative z-10 flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
              imageList.length > 0 ? "bg-blue-900 text-white shadow-md" : "bg-slate-100 text-slate-500 border border-slate-300"
            }`}>
              <Camera className="w-5 h-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">2. Photo Evidence ({imageList.length}/5)</span>
          </div>

          <div className="relative z-10 flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
              location.latitude || location.address ? "bg-blue-900 text-white shadow-md" : "bg-slate-100 text-slate-500 border border-slate-300"
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">3. Map Location</span>
          </div>

          <div className="relative z-10 flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
              formData.citizenName && formData.phone ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-500 border border-slate-300"
            }`}>
              <Send className="w-5 h-5" />
            </div>
            <span className="mt-2 text-xs font-bold text-slate-800">4. Review & Submit</span>
          </div>
        </div>
      </div>

      {/* Selected Category Summary Badge */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg mb-8 border border-blue-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" /> Official Complaint Intake
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
            <span className="text-[11px] text-blue-200 uppercase font-semibold">Selected Department Category</span>
            <p className="text-lg font-extrabold text-white mt-0.5">{category || "Not Selected"}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
            <span className="text-[11px] text-blue-200 uppercase font-semibold">Subcategory / Specific Issue</span>
            <p className="text-lg font-extrabold text-white mt-0.5">{issue || "Not Selected"}</p>
          </div>
        </div>
      </div>

      {/* 📸 Step 2: Multi-Photo Capture / Upload Card (Max 5 Photos) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload or Capture Photo Evidence (Max 5 Photos)</h3>
              <p className="text-xs text-slate-500">Provide clear photographs of the site. You can attach up to 5 photos.</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-blue-50 text-blue-900 px-3 py-1 rounded-full border border-blue-200">
            {imageList.length} / 5 Photos Attached
          </span>
        </div>

        {/* Live Web Camera Viewfinder Mode */}
        {isCameraActive ? (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-center space-y-3 relative">
            <div className="relative max-w-lg mx-auto rounded-xl overflow-hidden bg-black border border-slate-700">
              <video ref={videoRef} autoPlay playsInline className="w-full max-h-80 object-cover" />
              <canvas ref={canvasRef} hidden />
              <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE CAMERA ({imageList.length + 1}/5)
              </div>
            </div>

            <div className="flex justify-center items-center gap-3">
              <button
                type="button"
                onClick={snapPhoto}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 border border-emerald-500"
              >
                <Camera className="w-4 h-4 text-amber-300" /> Snap Photo #{imageList.length + 1}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1 border border-slate-700"
              >
                <XCircle className="w-4 h-4" /> Cancel Camera
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Photo Gallery & Intake Cards */
          <div className="space-y-4">
            {/* Gallery Grid View when photos exist */}
            {imageList.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {imageList.map((imgSrc, idx) => (
                    <div key={idx} className="relative group bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                      <img src={imgSrc} alt={`Evidence #${idx + 1}`} className="w-full h-28 object-cover" />
                      <div className="absolute top-1.5 left-1.5">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          idx === 0 ? "bg-emerald-600 text-white" : "bg-slate-900/80 text-white"
                        }`}>
                          {idx === 0 ? "Primary" : `#${idx + 1}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-md hover:bg-red-700 shadow-xs transition"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-fit">
                  <CheckCircle2 className="w-4 h-4" /> {imageList.length} Photo Evidence File(s) Attached
                </div>
              </div>
            )}

            {/* Upload Action Choice Cards (if less than 5 photos) */}
            {imageList.length < 5 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Option A: Live Camera Snap */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-blue-900 hover:bg-blue-950 text-white p-5 rounded-xl border border-blue-950 shadow-sm transition hover:scale-[1.01] active:scale-98 text-left space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-800 text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">
                      {imageList.length === 0 ? "Live Camera Capture" : "📷 Snap Additional Photo"}
                    </h4>
                    <p className="text-[11px] text-blue-200 mt-0.5">
                      Open live webcam viewfinder ({5 - imageList.length} slots remaining).
                    </p>
                  </div>
                </button>

                {/* Option B: Browse Local Files */}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-800 p-5 rounded-xl border border-slate-300 shadow-xs transition hover:scale-[1.01] active:scale-98 text-left space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {imageList.length === 0 ? "Browse Image Files (Max 5)" : "📁 Upload Additional Photos"}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select JPG, JPEG, or PNG files from disk/gallery.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* Optional Video Evidence Upload Card */}
            <div className="border-t border-slate-100 pt-4 mt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Optional Video Evidence Attachment</span>
                </div>
                {videoFile && (
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Video
                  </button>
                )}
              </div>

              {videoFile ? (
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2">
                  <video src={videoFile} controls className="w-full max-h-56 rounded-lg bg-black" />
                  <div className="flex justify-between items-center text-[11px] text-slate-300 font-mono px-1">
                    <span className="truncate">🎬 {videoName || "Incident Video Evidence"}</span>
                    <span className="text-emerald-400 font-bold">Attached ✅</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoFileInput.current?.click()}
                  className="w-full bg-purple-50/80 hover:bg-purple-100 text-purple-950 p-4 rounded-xl border border-purple-200 shadow-2xs transition flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-purple-950">🎥 Upload Video Evidence (Optional)</h4>
                      <p className="text-[11px] text-purple-700 mt-0.5">Attach recorded incident video clip (MP4, MOV, WebM up to 500MB).</p>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-purple-600 shrink-0" />
                </button>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* Hidden Inputs for File Selection */}
        <input
          hidden
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImage}
        />
        <input
          hidden
          ref={cameraFileInput}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImage}
        />
        <input
          hidden
          ref={videoFileInput}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
        />
      </div>

      {/* 📍 Step 3: Location Details & Interactive Leaflet Map */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incident Location & Interactive Map</h3>
              <p className="text-xs text-slate-500">Search by landmark/address, click on the map pin, or detect live GPS.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {locationSource && (
              <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {locationSource === "auto-gps" && "GPS Location Detected"}
                {locationSource === "search" && "Landmark Location Set"}
                {locationSource === "manual-map" && "Map Pin Selected"}
              </span>
            )}
            {location.latitude && (
              <button
                type="button"
                onClick={clearSavedLocation}
                className="text-[11px] font-bold text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-red-200 transition"
              >
                Reset Location
              </button>
            )}
          </div>
        </div>

        {/* Search Bar for Map Location */}
        <form onSubmit={handleSearchLocation} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, landmark, street name, or paste coordinates / Google Maps link..."
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingLocation || !searchQuery.trim()}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-xs"
          >
            {isSearchingLocation ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search Location
          </button>
        </form>

        {/* Quick City/Area Jump Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="font-bold text-slate-500 mr-1">Quick Map Jump:</span>
          {[
            { label: "Bengaluru Central", lat: 12.9716, lng: 77.5946 },
            { label: "Yelahanka", lat: 13.1007, lng: 77.5963 },
            { label: "Whitefield", lat: 12.9698, lng: 77.7499 },
            { label: "Mysuru", lat: 12.2958, lng: 76.6394 },
            { label: "Hubballi-Dharwad", lat: 15.3647, lng: 75.1240 },
            { label: "Mangaluru", lat: 12.9141, lng: 74.8560 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setLocationSource("search");
                fetchAddressFromCoords(preset.lat, preset.lng);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-lg border border-slate-300 transition"
            >
              📍 {preset.label}
            </button>
          ))}
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          type="button"
          onClick={() => detectLocation("manual-gps")}
          disabled={isDetectingLocation}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition ${
            isDetectingLocation
              ? "bg-amber-50 text-amber-900 border-amber-300 cursor_wait"
              : location.latitude
              ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
              : "bg-blue-900 text-white border-blue-950 hover:bg-blue-950 shadow-sm"
          }`}
        >
          {isDetectingLocation ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>Detecting Current GPS Location...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>
                {location.latitude
                  ? "✓ GPS Location Active (Click to Re-detect Location)"
                  : "Detect Current GPS Location"}
              </span>
            </>
          )}
        </button>

        {locationError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Location Detection Note</p>
              <p className="text-amber-800 leading-snug">{locationError}</p>
            </div>
          </div>
        )}

        {/* Live Interactive Leaflet OpenStreetMap View */}
        <div className="pt-2">
          <IncidentMap
            latitude={location.latitude}
            longitude={location.longitude}
            address={location.address}
            onLocationSelect={(lat, lng) => {
              setLocationSource("manual-map");
              fetchAddressFromCoords(lat, lng);
            }}
            height="350px"
          />
        </div>

        {location.latitude && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 font-medium grid sm:grid-cols-2 gap-2">
            <div><strong>Latitude:</strong> {location.latitude}</div>
            <div><strong>Longitude:</strong> {location.longitude}</div>
          </div>
        )}

        {/* Official Administrative Jurisdiction Hierarchy Selectors */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
            🏛️ Municipal Administrative Jurisdiction Selection
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* State Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select State *</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  const newState = e.target.value;
                  setSelectedState(newState);
                  const districts = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[newState] || {});
                  const newDist = districts[0] || "";
                  setSelectedDistrict(newDist);
                  const zones = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[newState]?.[newDist] || {});
                  const newZone = zones[0] || "";
                  setSelectedZone(newZone);
                  const wards = INDIAN_MUNICIPAL_HIERARCHY[newState]?.[newDist]?.[newZone] || [];
                  setSelectedWardName(wards[0]?.name || "");
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {Object.keys(INDIAN_MUNICIPAL_HIERARCHY).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* District / Corporation Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select District / Corporation *</label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setSelectedDistrict(newDist);
                  const zones = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[newDist] || {});
                  const newZone = zones[0] || "Central Zone";
                  setSelectedZone(newZone);
                  const wards = INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[newDist]?.[newZone] || [];
                  setSelectedWardName(wards[0]?.name || "Ward 01 - Main Division");
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {(() => {
                  const preList = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[selectedState] || {});
                  const opts = selectedDistrict && !preList.includes(selectedDistrict)
                    ? [selectedDistrict, ...preList]
                    : preList;
                  return opts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ));
                })()}
              </select>
            </div>

            {/* Zonal Division Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Zonal Division *</label>
              <select
                value={selectedZone}
                onChange={(e) => {
                  const newZone = e.target.value;
                  setSelectedZone(newZone);
                  const wards = INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[selectedDistrict]?.[newZone] || [];
                  setSelectedWardName(wards[0]?.name || "Ward 01 - Main Division");
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {(() => {
                  const preList = Object.keys(INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[selectedDistrict] || {});
                  const opts = selectedZone && !preList.includes(selectedZone)
                    ? [selectedZone, ...preList]
                    : preList.length > 0 ? preList : [selectedZone || "Central Zone"];
                  return opts.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ));
                })()}
              </select>
            </div>

            {/* Ward Selector */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Municipal Ward *</label>
              <select
                value={selectedWardName}
                onChange={(e) => setSelectedWardName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {(() => {
                  const wardList = (INDIAN_MUNICIPAL_HIERARCHY[selectedState]?.[selectedDistrict]?.[selectedZone] || []).map((w) => w.name);
                  const opts = selectedWardName && !wardList.includes(selectedWardName)
                    ? [selectedWardName, ...wardList]
                    : wardList.length > 0 ? wardList : [selectedWardName || "Ward 01 - Main Division"];
                  return opts.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ));
                })()}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Full Address / Landmark</label>
          <textarea
            rows="3"
            value={location.address}
            onChange={(e) =>
              setLocation((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            placeholder="Type street name, building, ward number, or landmark..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">City</span>
            <p className="font-semibold text-slate-800 truncate">{location.city || "--"}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">State</span>
            <p className="font-semibold text-slate-800 truncate">{location.state || "--"}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Pincode</span>
            <p className="font-semibold text-slate-800 truncate">{location.pincode || "--"}</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Country</span>
            <p className="font-semibold text-slate-800 truncate">{location.country || "--"}</p>
          </div>
        </div>
      </div>

      {/* 👤 Step 4: Citizen Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Citizen Contact Information</h3>
            <p className="text-xs text-slate-500">Your information will be kept confidential under government privacy standards.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="citizenName"
                value={formData.citizenName}
                onChange={handleChange}
                placeholder="e.g. Full Name"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">Mobile Phone *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="block font-bold text-slate-700">Email Address (For Status Updates & Verification) *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. citizen@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <label className="block font-bold text-slate-800">
              Detailed Description of the Issue You Are Facing *
            </label>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Grievance Details
            </span>
          </div>
          <textarea
            rows="4"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Write a small or detailed description of the issue you are facing (e.g. depth of pothole, duration of water outage, hazardous sparking details, or landmark context)..."
            className="w-full rounded-xl border border-slate-300 p-3.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none resize-none leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            Explain the problem clearly so municipal inspection officers can dispatch the appropriate repair team.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition active:scale-98 flex items-center justify-center gap-2 border border-emerald-600"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" /> Submitting Official Grievance...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 text-amber-300" /> Submit Complaint to Municipal Authority
            </>
          )}
        </button>
      </div>

      {/* Official Success Modal Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Official Acknowledgement
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Grievance Registered</h2>
              <p className="text-xs text-slate-600">
                Your complaint has been logged and assigned to the municipal department for SLA processing.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-semibold text-blue-700 uppercase">Your Complaint Reference ID</span>
              <p className="text-2xl font-black text-blue-900 tracking-wider">{complaintId}</p>
              <p className="text-[10px] text-blue-600">Please save this ID to track your complaint progress.</p>
            </div>

            <button
              onClick={() => {
                setShowSuccess(false);
                if (complaintId) {
                  navigate(`/track/${complaintId}`);
                } else {
                  navigate("/track");
                }
              }}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 border border-blue-800"
            >
              <Search className="w-4 h-4 text-amber-300" /> Track Complaint Status & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}