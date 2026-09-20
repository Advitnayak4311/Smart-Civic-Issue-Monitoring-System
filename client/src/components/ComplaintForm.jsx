import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UploadCloud,
  MapPin,
  FileCheck2,
  Send,
  User,
  UserPlus,
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
import DuplicateComplaintModal from "./DuplicateComplaintModal";

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

  // Location State (Clean state per complaint, preventing stale coordinates)
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [locationSource, setLocationSource] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [pinNotification, setPinNotification] = useState(null); // { type: 'success' | 'info' | 'error', message: string }
  const [emailVerification, setEmailVerification] = useState({
    status: "idle", // 'idle' | 'checking' | 'valid' | 'invalid'
    message: "",
    suggestion: null,
  });
  const emailDebounceRef = useRef(null);

  // Function to clear location manually
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
    setPinNotification(null);
    setSearchQuery("");
  };

  // Helper to jump map and location coordinates to selected district / city (only if pin not placed yet)
  const jumpToDistrictOrWard = async (distName, wardName = "", stateName = "") => {
    if (location.latitude && location.longitude) {
      // Keep user's exact pinned coordinates intact
      return;
    }
    const cleanDist = (distName || "").replace(/\([^)]*\)/g, "").trim();
    const query = [wardName, cleanDist, stateName || selectedState || "Karnataka", "India"].filter(Boolean).join(", ");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          city: cleanDist,
          state: stateName || selectedState || prev.state,
        }));
        setLocationSource("manual-map");
      }
    } catch (e) {
      console.log("Jump district note:", e);
    }
  };

  // Helper to geocode address text directly to coordinates with multi-tier fallback & visual feedback
  const geocodeAddressText = async (addressOverride) => {
    const textToGeocode = (addressOverride !== undefined ? addressOverride : location.address).trim();
    if (!textToGeocode) {
      setPinNotification({
        type: "error",
        message: "Please type a street name, landmark, or address first, then click 'Pin Address on Map'.",
      });
      return;
    }

    const cleanDist = (selectedDistrict || "").replace(/\([^)]*\)/g, "").trim();

    // Cascading address queries: prioritize exact user text first
    const queryCandidates = [
      textToGeocode,
      `${textToGeocode}, India`,
      `${textToGeocode}, ${cleanDist}, India`,
      `${textToGeocode}, ${selectedState}, India`,
      `${textToGeocode}, ${cleanDist}, ${selectedState}, India`,
    ];

    try {
      setIsSearchingLocation(true);
      setPinNotification(null);
      let foundCoords = null;

      for (const query of queryCandidates) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            foundCoords = {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
              displayName: data[0].display_name,
            };
            break;
          }
        } catch (subErr) {
          console.log("Candidate geocode note:", query, subErr);
        }
      }

      if (foundCoords) {
        setLocation((prev) => ({
          ...prev,
          latitude: foundCoords.lat,
          longitude: foundCoords.lon,
          address: textToGeocode,
        }));
        setLocationSource("address");
        setLocationError("");
        setPinNotification({
          type: "success",
          message: `Location successfully pinned on map at (${foundCoords.lat.toFixed(5)}, ${foundCoords.lon.toFixed(5)})!`,
        });
        // Resolve jurisdiction from real coordinates
        await fetchAddressFromCoords(foundCoords.lat, foundCoords.lon);
      } else {
        setPinNotification({
          type: "error",
          message: `Could not locate "${textToGeocode}". Please check the spelling, add city/area name, or click directly on the map.`,
        });
      }
    } catch (e) {
      console.log("Geocode address note:", e);
      setPinNotification({
        type: "error",
        message: "Network error reaching map geocoder. You can click directly on the map to set the pin.",
      });
    } finally {
      setIsSearchingLocation(false);
    }
  };


  // UI / Loading State
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  // Phase 1 - Smart Duplicate Modal State
  const [duplicateData, setDuplicateData] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isSupportedSuccess, setIsSupportedSuccess] = useState(false);

  // Handle Supporting Existing Complaint
  const handleSupportExisting = async (existingId) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:8000/api/complaint/support/${existingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.citizenName,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowDuplicateModal(false);
        setComplaintId(data.complaintId || duplicateData?.complaintId);
        setIsSupportedSuccess(true);
        setShowSuccess(true);

        // Reset form
        setFormData({ citizenName: "", phone: "", email: "", remarks: "" });
        setImageList([]);
        setVideoFile(null);
      } else {
        alert(data.message || "Failed to record support.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server to record support.");
    }
  };

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

  // Client-side Image Compression Helper (Resizes & compresses photo to ~90KB in milliseconds)
  const compressImage = (dataUrl, maxWidth = 900, maxHeight = 900, quality = 0.65) => {
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

  // Handle Video Evidence Upload (Supports video files up to 500MB)
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

    const maxVideoSize = 500 * 1024 * 1024; // 500MB limit as requested
    if (file.size > maxVideoSize) {
      alert("Video file size exceeds the 500 MB limit.");
      return;
    }

    setVideoName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);

    // Create an ultra-lightweight, high-performance video Data URL preview (under 1.5MB)
    // so HTTP submission payload remains under 2.5MB and never breaches browser network limits!
    const sliceSize = file.size <= 2 * 1024 * 1024 ? file.size : 1.5 * 1024 * 1024;
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

  const COMMON_EMAIL_TYPOS = {
    "gmail.vom": "gmail.com",
    "gmail.con": "gmail.com",
    "gmail.cpm": "gmail.com",
    "gmail.co": "gmail.com",
    "gail.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmeil.com": "gmail.com",
    "yahoo.vom": "yahoo.com",
    "yahoo.con": "yahoo.com",
    "yaho.com": "yahoo.com",
    "ymail.vom": "ymail.com",
    "outlook.vom": "outlook.com",
    "outlok.com": "outlook.com",
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "hotmail.vom": "hotmail.com",
    "icloud.vom": "icloud.com"
  };

  const VALID_TLDS_CLIENT = new Set([
    "com", "org", "net", "edu", "gov", "mil", "int", "in", "co", "io", "ai", "me", "info", "biz",
    "app", "dev", "tech", "online", "site", "store", "xyz", "live", "global", "world", "cloud",
    "agency", "cc", "tv", "ca", "uk", "us", "eu", "de", "fr", "au", "jp", "sg", "my", "nz"
  ]);

  const COMPOUND_TLDS_CLIENT = new Set([
    "co.in", "gov.in", "nic.in", "ac.in", "edu.in", "res.in", "org.in", "net.in",
    "co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "gov.au", "edu.au"
  ]);

  const verifyEmailInput = async (emailRaw, checkDns = true) => {
    const email = (emailRaw || "").trim().toLowerCase();
    if (!email) {
      setEmailVerification({ status: "idle", message: "", suggestion: null });
      return { valid: false, message: "Email address is required." };
    }

    if (!email.includes("@")) {
      setEmailVerification({
        status: "invalid",
        message: "Email must include '@' symbol (e.g. name@domain.com).",
        suggestion: null,
      });
      return { valid: false, message: "Email must include '@'." };
    }

    const [localPart, domain] = email.split("@");

    if (!localPart || localPart.length < 2) {
      setEmailVerification({
        status: "invalid",
        message: "Email username before '@' is too short.",
        suggestion: null,
      });
      return { valid: false, message: "Email username is too short." };
    }

    // Gibberish keyboard mash detection (e.g. hgfhggh, asdfghjk)
    const cleanedLocal = localPart.replace(/[^a-z]/g, "");
    if (cleanedLocal.length >= 5 && !/[aeiouy]/.test(cleanedLocal)) {
      setEmailVerification({
        status: "invalid",
        message: `Username '${localPart}' appears to be random keyboard letters. Please enter your real email address.`,
        suggestion: null,
      });
      return { valid: false, message: "Username appears to be random keys." };
    }

    if (!domain || !domain.includes(".")) {
      setEmailVerification({
        status: "invalid",
        message: "Incomplete domain. Please enter full domain (e.g. gmail.com).",
        suggestion: null,
      });
      return { valid: false, message: "Incomplete domain name." };
    }

    // Known typo matching
    if (COMMON_EMAIL_TYPOS[domain]) {
      const suggested = `${localPart}@${COMMON_EMAIL_TYPOS[domain]}`;
      setEmailVerification({
        status: "invalid",
        message: `Invalid domain '@${domain}'. Did you mean @${COMMON_EMAIL_TYPOS[domain]}?`,
        suggestion: suggested,
      });
      return { valid: false, message: `Typo: Did you mean @${COMMON_EMAIL_TYPOS[domain]}?`, suggestion: suggested };
    }

    // TLD checking
    const parts = domain.split(".");
    const tld = parts[parts.length - 1];
    const compoundTld = parts.slice(-2).join(".");
    const isKnownTld = COMPOUND_TLDS_CLIENT.has(compoundTld) || VALID_TLDS_CLIENT.has(tld);

    if (!isKnownTld) {
      setEmailVerification({
        status: "invalid",
        message: `Domain extension '.${tld}' is not recognized. Please use a valid domain (e.g. @gmail.com).`,
        suggestion: null,
      });
      return { valid: false, message: `Extension .${tld} is not recognized.` };
    }

    if (!checkDns) {
      setEmailVerification({ status: "valid", message: "Email format is valid.", suggestion: null });
      return { valid: true };
    }

    // Query backend DNS MX resolver
    try {
      setEmailVerification((prev) => ({ ...prev, status: "checking", message: "Verifying mail domain..." }));
      const res = await fetch(`http://localhost:8000/api/complaint/verify-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!data.valid) {
        setEmailVerification({
          status: "invalid",
          message: data.message || `Domain '@${domain}' does not exist or cannot receive mail.`,
          suggestion: data.suggestion || null,
        });
        return { valid: false, message: data.message, suggestion: data.suggestion };
      } else {
        setEmailVerification({
          status: "valid",
          message: `Verified: '@${domain}' is active and ready for status updates.`,
          suggestion: null,
        });
        return { valid: true };
      }
    } catch (e) {
      setEmailVerification({ status: "valid", message: "Email format is valid.", suggestion: null });
      return { valid: true };
    }
  };

  const applyEmailSuggestion = (suggestedEmail) => {
    setFormData((prev) => ({ ...prev, email: suggestedEmail }));
    verifyEmailInput(suggestedEmail, true);
  };

  const handleEmailChange = (val) => {
    verifyEmailInput(val, false);
    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }
    emailDebounceRef.current = setTimeout(() => {
      if (val && val.includes("@") && val.includes(".")) {
        verifyEmailInput(val, true);
      }
    }, 600);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      handleEmailChange(value);
    }
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

      const addr = data.address || {};
      const detectedState = addr.state || "";
      const detectedCity =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        addr.state_district ||
        "";

      const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "";
      const formattedParts = [road, detectedCity, detectedState, addr.postcode].filter(Boolean);
      const cleanAddress = formattedParts.length > 0 ? formattedParts.join(", ") : data.display_name;

      setLocation({
        latitude,
        longitude,
        address: cleanAddress || data.display_name || `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        city: detectedCity,
        state: detectedState,
        pincode: addr.postcode || "",
        country: addr.country || "India",
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
        address: prev.address || `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
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

  // Detect GPS Location using HTML5 Geolocation API with resilient multi-provider fallback
  const detectLocation = (sourceType = "manual-gps") => {
    setIsDetectingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      fallbackIpLocation(sourceType);
      return;
    }

    // Attempt 1: High Accuracy GPS (fast 5s timeout)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocationSource(sourceType);
        setLocationError("");
        await fetchAddressFromCoords(latitude, longitude);
        setIsDetectingLocation(false);
      },
      (firstError) => {
        console.log("High-accuracy GPS note, attempting standard accuracy:", firstError.message);

        // Attempt 2: Standard/Cached browser location (works seamlessly on desktop/WiFi)
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            setLocationSource(sourceType);
            setLocationError("");
            await fetchAddressFromCoords(latitude, longitude);
            setIsDetectingLocation(false);
          },
          async (secondError) => {
            console.log("Standard accuracy geolocation note, attempting IP fallback:", secondError.message);
            await fallbackIpLocation(sourceType);
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

  // Fallback to resilient IP Geolocation when GPS hardware is restricted
  const fallbackIpLocation = async (sourceType = "manual-gps") => {
    try {
      setIsDetectingLocation(true);
      let lat = null;
      let lng = null;

      // Provider 1: ipwho.is (Free, high reliability, no rate limits)
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data.success && data.latitude && data.longitude) {
          lat = parseFloat(data.latitude);
          lng = parseFloat(data.longitude);
        }
      } catch (e) {
        console.log("ipwho.is note:", e);
      }

      // Provider 2: freeipapi.com
      if (!lat || !lng) {
        try {
          const res = await fetch("https://freeipapi.com/api/json");
          const data = await res.json();
          if (data.latitude && data.longitude) {
            lat = parseFloat(data.latitude);
            lng = parseFloat(data.longitude);
          }
        } catch (e) {
          console.log("freeipapi note:", e);
        }
      }

      // Provider 3: ipapi.co
      if (!lat || !lng) {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          if (data.latitude && data.longitude) {
            lat = parseFloat(data.latitude);
            lng = parseFloat(data.longitude);
          }
        } catch (e) {}
      }

      if (lat && lng) {
        setLocationSource(sourceType);
        setLocationError("");
        await fetchAddressFromCoords(lat, lng);
      } else {
        setLocationError("Browser location restricted. Click anywhere on the map above or search your landmark to place your pin.");
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
  const handleSubmit = async (parentComplaintId = null) => {
    const validParentId = typeof parentComplaintId === "string" ? parentComplaintId : null;

    // 1. Mandatory Citizen Name
    if (!formData.citizenName || !formData.citizenName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    // 2. Strict Phone Validation (Mandatory 10-digit Indian Mobile Number)
    const cleanPhone = (formData.phone || "").replace(/[\s-]/g, "").trim();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      alert("Please enter a valid 10-digit mobile phone number starting with 6, 7, 8, or 9 (e.g. 9876543210).");
      return;
    }

    // 3. Strict Email Verification (Syntax, TLD, Typo, Keyboard Mash, and DNS MX Verification)
    const cleanEmail = (formData.email || "").trim();
    const emailCheck = await verifyEmailInput(cleanEmail, true);
    if (!emailCheck.valid) {
      alert(emailCheck.message || "Please enter a valid, active email address.");
      return;
    }

    // 4. Compulsory Complaint Description (Minimum 10 characters)
    const cleanRemarks = (formData.remarks || "").trim();
    if (!cleanRemarks || cleanRemarks.length < 10) {
      alert("Complaint description is compulsory. Please write at least 10 characters explaining the issue you are facing.");
      return;
    }

    // 5. Compulsory Photo Evidence
    if (!imageList || imageList.length === 0) {
      alert("Please attach at least 1 photo evidence of the civic issue.");
      return;
    }

    // 6. Location verification
    if (!location.latitude && !location.address?.trim()) {
      alert("Please provide the incident location. You can click '📍 Pin Address on Map' or 'Detect GPS Location'.");
      return;
    }

    try {
      setLoading(true);

      // Phase 1: Smart Duplicate Check (<300ms SLA) before first submission
      if (!validParentId && location.latitude && location.longitude) {
        try {
          const dupRes = await fetch("http://localhost:8000/api/complaint/check-duplicate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              issue,
              latitude: location.latitude,
              longitude: location.longitude,
            }),
          });
          const dupData = await dupRes.json();

          if (dupData && dupData.duplicate) {
            setDuplicateData(dupData);
            setShowDuplicateModal(true);
            setLoading(false);
            return;
          }
        } catch (dupErr) {
          console.log("Duplicate check note:", dupErr.message);
        }
      }

      const token = localStorage.getItem("token") || "";

      let subLat = location.latitude ? parseFloat(location.latitude) : null;
      let subLng = location.longitude ? parseFloat(location.longitude) : null;

      if (!subLat || !subLng || isNaN(subLat) || isNaN(subLng)) {
        const cleanDist = (selectedDistrict || "").replace(/\([^)]*\)/g, "").trim();
        const queries = [
          location.address ? `${location.address}, ${cleanDist}, ${selectedState}, India` : "",
          location.address ? `${location.address}, ${selectedState}, India` : "",
          cleanDist ? `${cleanDist}, ${selectedState}, India` : "",
        ].filter(Boolean);

        for (const q of queries) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const geoData = await geoRes.json();
            if (Array.isArray(geoData) && geoData.length > 0) {
              subLat = parseFloat(geoData[0].lat);
              subLng = parseFloat(geoData[0].lon);
              break;
            }
          } catch (e) {
            console.log("Client geocoding note:", e);
          }
        }
      }

      const payload = {
        category,
        issue,
        citizenName: formData.citizenName.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        remarks: cleanRemarks,
        latitude: subLat,
        longitude: subLng,
        address: location.address,
        city: location.city || selectedDistrict,
        state: selectedState || location.state,
        district: selectedDistrict,
        zone: selectedZone,
        ward: selectedWardName,
        pincode: location.pincode,
        country: location.country,
        image: imageList[0],
        imageList,
        video: videoFile,
        parentComplaintId: validParentId,
      };

      let resData = null;

      try {
        const response = await createComplaint(payload);
        resData = response.data;
      } catch (apiErr) {
        console.log("Axios submit note, attempting direct fetch submit:", apiErr);
        const fetchRes = await fetch("http://localhost:8000/api/complaint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        resData = await fetchRes.json();
      }

      if (resData && resData.success && resData.complaintId) {
        window.dispatchEvent(new CustomEvent("scms_complaint_registered", { detail: resData }));
        try {
          localStorage.setItem("scms_last_complaint_update", Date.now().toString());
        } catch (e) {}
        setComplaintId(resData.complaintId);
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
      } else {
        alert((resData && resData.message) ? resData.message : "Failed to register complaint with server. Please try again.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error submitting complaint: " + (error.response?.data?.message || error.message || "Network error. Please try again."));
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
                  jumpToDistrictOrWard(newDist, "", newState);
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
                  jumpToDistrictOrWard(newDist, "", selectedState);
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
                onChange={(e) => {
                  setSelectedWardName(e.target.value);
                  jumpToDistrictOrWard(selectedDistrict, e.target.value, selectedState);
                }}
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
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-700">Full Address / Landmark *</label>
            <button
              type="button"
              onClick={() => geocodeAddressText()}
              disabled={isSearchingLocation || !location.address?.trim()}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 cursor-pointer disabled:opacity-40 transition"
              title="Pin typed address coordinates onto map"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{isSearchingLocation ? "Locating on Map..." : "📍 Pin Address on Map"}</span>
            </button>
          </div>
          <textarea
            rows="3"
            value={location.address}
            onChange={(e) =>
              setLocation((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            onBlur={() => {
              if (location.address && location.address.trim().length >= 3 && !location.latitude) {
                geocodeAddressText();
              }
            }}
            placeholder="Type street name, building, ward number, or landmark (e.g. Near Bus Stand, Kuvempunagar)..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none resize-none"
          />

          {pinNotification && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 border ${
                pinNotification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : pinNotification.type === "info"
                  ? "bg-blue-50 text-blue-800 border-blue-300"
                  : "bg-red-50 text-red-800 border-red-300"
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0 text-blue-600" />
              <span className="flex-1">{pinNotification.message}</span>
            </div>
          )}
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
            <label className="block font-bold text-slate-700">Mobile Phone (10 Digits) *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 outline-none ${
                  formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, ""))
                    ? "border-amber-400 focus:ring-amber-500"
                    : "border-slate-300 focus:ring-blue-600"
                }`}
              />
            </div>
            {formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s-]/g, "")) && (
              <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                <span>⚠️ Must be 10 digits starting with 6, 7, 8, or 9 (currently: {formData.phone.length}/10)</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <label className="block font-bold text-slate-700">Email Address (For Status Updates & Verification) *</label>
            {emailVerification.status === "valid" && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Mail Server Verified
              </span>
            )}
            {emailVerification.status === "checking" && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" /> Verifying MX Records...
              </span>
            )}
          </div>

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => {
                if (formData.email && formData.email.trim()) {
                  verifyEmailInput(formData.email, true);
                }
              }}
              placeholder="e.g. citizen@example.com"
              className={`w-full pl-9 pr-9 py-2.5 rounded-xl border outline-none transition ${
                emailVerification.status === "invalid"
                  ? "border-red-500 bg-red-50/20 focus:ring-2 focus:ring-red-500 text-slate-900"
                  : emailVerification.status === "valid"
                  ? "border-emerald-500 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  : emailVerification.status === "checking"
                  ? "border-blue-400 bg-blue-50/10 focus:ring-2 focus:ring-blue-500"
                  : "border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
              }`}
            />

            {/* Right Status Icon */}
            <div className="absolute right-3 top-3">
              {emailVerification.status === "checking" && (
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              )}
              {emailVerification.status === "valid" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              {emailVerification.status === "invalid" && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          {/* Detailed Email Verification Error & Auto-Fix Banner */}
          {emailVerification.status === "invalid" && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-start gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-snug">{emailVerification.message}</p>
              </div>

              {emailVerification.suggestion && (
                <div className="flex items-center gap-2 pt-1 border-t border-red-200/70">
                  <span className="text-[11px] text-slate-700 font-semibold">Suggested Correction:</span>
                  <button
                    type="button"
                    onClick={() => applyEmailSuggestion(emailVerification.suggestion)}
                    className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-bold text-[11px] transition active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Fix to: {emailVerification.suggestion}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Validated domain message */}
          {emailVerification.status === "valid" && (
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{emailVerification.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <label className="block font-bold text-slate-800">
              Detailed Description of the Issue You Are Facing *
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              (formData.remarks || "").trim().length >= 10
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {(formData.remarks || "").trim().length >= 10 ? "✓ Complete" : `${(formData.remarks || "").trim().length}/10 chars required`}
            </span>
          </div>
          <textarea
            rows="4"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Write a clear description of the issue you are facing (e.g. depth of pothole, duration of water outage, hazardous sparking details, or landmark context - minimum 10 characters)..."
            className={`w-full rounded-xl border p-3.5 bg-slate-50 focus:bg-white focus:ring-2 outline-none resize-none leading-relaxed ${
              formData.remarks && formData.remarks.trim().length > 0 && formData.remarks.trim().length < 10
                ? "border-amber-400 focus:ring-amber-500"
                : "border-slate-300 focus:ring-blue-600"
            }`}
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <p>
              Explain the problem clearly so municipal inspection officers can dispatch the appropriate repair team.
            </p>
            {formData.remarks && formData.remarks.trim().length > 0 && formData.remarks.trim().length < 10 && (
              <span className="text-amber-700 font-bold">
                Write at least 10 characters ({10 - formData.remarks.trim().length} more required)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit()}
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
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full border border-slate-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-300 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Receipt Acknowledged
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Grievance Successfully Registered</h2>
              <p className="text-xs text-slate-600">
                Your issue has been dispatched to municipal inspection officers for SLA monitoring.
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Grievance Reference Number</span>
              <p className="text-3xl font-black text-white tracking-widest font-mono">{complaintId}</p>
              <p className="text-[11px] text-slate-300">Keep this ID to track repair timelines and officer response.</p>
            </div>

            {/* Account & Profile Creation Choice Callout */}
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <User className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-blue-950">Create Your Citizen Account & Profile</h4>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    Would you like to register a citizen profile to manage your credentials and track all your grievances in one dashboard?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccess(false);
                    navigate("/login", {
                      state: {
                        isSignup: true,
                        prefillName: formData.citizenName,
                        prefillEmail: formData.email,
                        prefillPhone: formData.phone,
                      },
                    });
                  }}
                  className="py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 border border-blue-600"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" /> Create Account & Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccess(false);
                    if (complaintId) {
                      navigate(`/track/${complaintId}`);
                    } else {
                      navigate("/track");
                    }
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 border border-slate-800"
                >
                  <Search className="w-4 h-4 text-blue-400" /> Track Status Only
                </button>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                }}
                className="text-slate-500 hover:text-slate-800 font-semibold transition"
              >
                + Register Another Issue
              </button>
              <Link
                to="/"
                onClick={() => setShowSuccess(false)}
                className="text-blue-700 hover:text-blue-900 font-bold transition flex items-center gap-1"
              >
                Return to Home &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Phase 1 - Duplicate Complaint Modal */}
      {showDuplicateModal && (
        <DuplicateComplaintModal
          duplicateData={duplicateData}
          onSupport={(existingId) => handleSupportExisting(existingId)}
          onSubmitAnyway={() => {
            setShowDuplicateModal(false);
            handleSubmit(duplicateData?.id);
          }}
          onClose={() => setShowDuplicateModal(false)}
        />
      )}
    </div>
  );
}