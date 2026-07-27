import SectionCard from "./UI/SectionCard";
import PrimaryButton from "./UI/PrimaryButton";
import { useRef, useState } from "react";
import { FaCloudUploadAlt, FaMapMarkerAlt } from "react-icons/fa";
import { createComplaint } from "../api/complaintApi";

export default function ComplaintForm({ category, issue }) {
  const fileInput = useRef(null);
  const isMobile =
  /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // ---------------- Image ----------------
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");


  // ---------------- Citizen Form ----------------
  const [formData, setFormData] = useState({
    citizenName: "",
    phone: "",
    email: "",
    remarks: "",
  });

  // ---------------- Location ----------------
  const [location, setLocation] = useState({
  latitude: "",
  longitude: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
});

  // ---------------- Loading ----------------
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  // ==========================
  // Upload Image
  // ==========================
  const handleImage = (e) => {
    const file = e.target.files[0];

if (!file) return;

// Allow only JPG, JPEG and PNG
const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

if (!allowedTypes.includes(file.type)) {
  alert("Only JPG, JPEG and PNG images are allowed.");
  return;
}

// Maximum file size: 5MB
const maxSize = 5 * 1024 * 1024;

if (file.size > maxSize) {
  alert("Image size must be less than 5 MB.");
  return;
}

    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };


    const removeImage = () => {
  setImage("");
  setPreview("");

  if (fileInput.current) {
    fileInput.current.value = "";
  }
};
  // ==========================
  // Handle Input
  // ==========================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================
  // Detect Location
  // ==========================
  const detectLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );

        const data = await response.json();

        setLocation({
          latitude,
          longitude,
          address: data.display_name || "",
          city:
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "",
          state: data.address?.state || "",
          pincode: data.address?.postcode || "",
          country: data.address?.country || "",
        });

        alert("Location detected successfully.");
      } catch (err) {
  console.log(err);

  setLocation({
    latitude,
    longitude,
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  alert("GPS detected, but address couldn't be fetched.");
}
    },
    (error) => {
  console.log("Geolocation Error:", error);
  console.log("Error Code:", error.code);
  console.log("Error Message:", error.message);

  alert(
    `Location Error\nCode: ${error.code}\nMessage: ${error.message}`
  );
},
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
};
  // ==========================
  // Submit Complaint
  // ==========================
  const handleSubmit = async () => {
    // 1. Check basic required fields
    if (!formData.citizenName || !formData.phone || !formData.email || !image) {
      alert("Please fill all required fields and upload an image.");
      return;
    }

    // 2. Check location (Accepts EITHER GPS coordinates OR a typed address)
    if (!location.latitude && !location.address.trim()) {
      alert("Please either detect your GPS location or type your address manually.");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting Complaint...");

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

        city: location.city,

        state: location.state,

        pincode: location.pincode,

        country: location.country,

        image,
      });

      console.log("Response:", response);
      setComplaintId(response.data.complaintId);
      setShowSuccess(true);
      console.log("Popup opened");

      setFormData({
  citizenName: "",
  phone: "",
  email: "",
  remarks: "",
});

setImage("");
setPreview("");

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
      console.log(error.response);
      alert(error.response?.data?.message || error.message || "Submission Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="max-w-5xl mx-auto px-6 py-10">
    {/* Progress */}
<div className="mb-10">
  <div className="flex justify-between items-center">

    <div className="flex flex-col items-center flex-1">
      <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow-lg">
        ✓
      </div>
      <p className="mt-2 text-sm font-semibold">
        Summary
      </p>
    </div>

    <div className="flex-1 h-1 bg-green-500 mx-2 rounded-full"></div>

    <div className="flex flex-col items-center flex-1">
      <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow-lg">
        ✓
      </div>
      <p className="mt-2 text-sm font-semibold">
        Photo
      </p>
    </div>

    <div className="flex-1 h-1 bg-blue-500 mx-2 rounded-full"></div>

    <div className="flex flex-col items-center flex-1">
      <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl animate-pulse">
        📍
      </div>
      <p className="mt-2 text-sm font-semibold">
        Location
      </p>
    </div>

    <div className="flex-1 h-1 bg-gray-300 mx-2 rounded-full"></div>

    <div className="flex flex-col items-center flex-1">
      <div className="w-14 h-14 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xl">
        🚀
      </div>
      <p className="mt-2 text-sm font-semibold">
        Submit
      </p>
    </div>

  </div>
</div>
      {/* Complaint Summary */}
<div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 shadow-2xl p-10 text-white mb-10">

  <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10"></div>
  <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5"></div>

  <div className="relative">
    <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold">
      📢 Smart Civic Complaint
    </span>

    <h2 className="mt-5 text-4xl font-extrabold tracking-tight">
      Complaint Summary
    </h2>

    <p className="mt-3 text-blue-100 text-lg">
      Please verify your complaint details before submission.
    </p>

    <div className="grid md:grid-cols-2 gap-6 mt-10">

      <div className="rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 p-6">
        <p className="uppercase text-xs tracking-widest text-blue-200">
          Category
        </p>

        <h3 className="mt-3 text-3xl font-bold">
          {category}
        </h3>
      </div>

      <div className="rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 p-6">
        <p className="uppercase text-xs tracking-widest text-blue-200">
          Issue
        </p>

        <h3 className="mt-3 text-3xl font-bold">
          {issue}
        </h3>
      </div>

    </div>
  </div>
</div>
   
      
{/* Upload Image */}
<SectionCard
  title="📸 Upload Complaint Photo"
  subtitle="Upload a clear image so the authorities can identify the issue quickly."
>
  <div
    onClick={() => fileInput.current.click()}
    className="
      border-2 border-dashed border-blue-300
      rounded-3xl
      p-12
      cursor-pointer
      transition-all duration-300
      hover:border-blue-600
      hover:bg-blue-50
      hover:shadow-xl
      hover:scale-[1.01]
    "
  >
    {!preview ? (
      <div className="text-center">

        <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
          <FaCloudUploadAlt className="text-5xl text-blue-600" />
        </div>

        <h3 className="text-2xl font-bold mt-6">
  {isMobile ? "Take or Upload Photo" : "Upload Complaint Photo"}
</h3>

        <p className="text-gray-500 mt-3">
  {isMobile
    ? "Use Camera or Gallery • JPG • PNG"
    : "Choose JPG or PNG from your computer"}
</p>

      </div>
    ) : (
      <div className="space-y-5">

  <div className="relative">

    <img
      src={preview}
      alt="Complaint"
      className="w-full max-h-[420px] object-cover rounded-3xl shadow-xl"
    />

    {/* Action Buttons */}
    <div className="absolute top-4 right-4 flex gap-3">

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          fileInput.current.click();
        }}
        className="bg-white text-blue-600 px-4 py-2 rounded-xl shadow hover:bg-blue-50 transition"
      >
        ✏ Change
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeImage();
        }}
        className="bg-white text-red-600 px-4 py-2 rounded-xl shadow hover:bg-red-50 transition"
      >
        🗑 Remove
      </button>

    </div>

  </div>

  <div className="text-center">
    <span className="inline-flex bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
      ✅ Photo Selected Successfully
    </span>
  </div>

</div>
    )}
  </div>

  <input
  hidden
  ref={fileInput}
  type="file"
  accept="image/*"
  {...(isMobile ? { capture: "environment" } : {})}
  onChange={handleImage}
/>
</SectionCard>
 
{/* Location */}
<SectionCard
  title="📍 Location Details"
  subtitle="Detect your current GPS location. You can edit the address if required."
>
  <button
    type="button"
    onClick={detectLocation}
    className={`
      w-full rounded-2xl p-5 flex items-center justify-center gap-3
      transition-all duration-300 shadow-md
      ${
        location.latitude
          ? "bg-green-50 border-2 border-green-300 text-green-700 hover:bg-green-100"
          : "bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100"
      }
    `}
  >
    <FaMapMarkerAlt className="text-3xl" />

    <div className="text-left">
      <p className="font-bold text-lg">
        {location.latitude
          ? "GPS Location Captured"
          : "Detect GPS Location"}
      </p>

      <p className="text-sm opacity-70">
        {location.latitude
          ? "Latitude & Longitude captured successfully."
          : "Tap here to fetch your current location."}
      </p>
    </div>
  </button>

  {location.latitude && (
    <div className="mt-5 rounded-2xl bg-green-50 border border-green-200 p-4">
      <p className="font-semibold text-green-700">
        ✅ Live Coordinates
      </p>

      <p className="text-gray-700 mt-2">
        <strong>Latitude:</strong> {location.latitude}
      </p>

      <p className="text-gray-700">
        <strong>Longitude:</strong> {location.longitude}
      </p>
    </div>
  )}

  <textarea
    rows="3"
    value={location.address}
    onChange={(e) =>
      setLocation((prev) => ({
        ...prev,
        address: e.target.value,
      }))
    }
    placeholder="Detected address will appear here..."
    className="mt-6 w-full rounded-2xl border border-gray-300 p-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
  />

  <div className="grid md:grid-cols-2 gap-5 mt-6">

    <div className="rounded-2xl bg-slate-50 border p-4">
      <p className="text-sm text-gray-500">🏙 City</p>
      <h3 className="font-bold mt-2">
        {location.city || "--"}
      </h3>
    </div>

    <div className="rounded-2xl bg-slate-50 border p-4">
      <p className="text-sm text-gray-500">🌎 State</p>
      <h3 className="font-bold mt-2">
        {location.state || "--"}
      </h3>
    </div>

    <div className="rounded-2xl bg-slate-50 border p-4">
      <p className="text-sm text-gray-500">📮 Pincode</p>
      <h3 className="font-bold mt-2">
        {location.pincode || "--"}
      </h3>
    </div>

    <div className="rounded-2xl bg-slate-50 border p-4">
      <p className="text-sm text-gray-500">🌍 Country</p>
      <h3 className="font-bold mt-2">
        {location.country || "--"}
      </h3>
    </div>

  </div>
</SectionCard>
      {/* Citizen Information */}
<SectionCard
  title="👤 Citizen Information"
  subtitle="Provide your contact details so authorities can reach you if needed."
>
  <div className="grid md:grid-cols-2 gap-6">
    <input
      type="text"
      name="citizenName"
      value={formData.citizenName}
      onChange={handleChange}
      placeholder="👤 Full Name"
      className="border rounded-xl p-4 outline-none focus:border-blue-500"
    />

    <input
      type="text"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      placeholder="📞 Phone Number"
      className="border rounded-xl p-4 outline-none focus:border-blue-500"
    />
  </div>

  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="📧 Email Address"
    className="border rounded-xl p-4 mt-6 w-full outline-none focus:border-blue-500"
  />

  <textarea
    rows="5"
    name="remarks"
    value={formData.remarks}
    onChange={handleChange}
    placeholder="📝 Additional Remarks (Optional)"
    className="border rounded-xl p-4 mt-6 w-full outline-none focus:border-blue-500 resize-none"
  />
</SectionCard>
          {/* Submit Button */}
  <div className="mt-10">
  <PrimaryButton
    loading={loading}
    onClick={handleSubmit}
  >
    🚀 Submit Complaint
  </PrimaryButton>
</div>

{/* Success Popup */}
{showSuccess && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-md text-center animate-[fadeIn_.3s_ease]">

      <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <span className="text-5xl">✅</span>
      </div>

      <h2 className="text-3xl font-bold text-green-700 mt-6">
        Complaint Submitted!
      </h2>

      <p className="text-gray-600 mt-3">
        Thank you for helping keep our city clean and safe.
      </p>

      <div className="mt-6 bg-blue-50 rounded-2xl p-4">
        <p className="text-sm text-gray-500">
          Complaint ID
        </p>

        <h3 className="text-2xl font-bold text-blue-700 mt-1">
          {complaintId}
        </h3>
      </div>

      <button
        onClick={() => setShowSuccess(false)}
        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold transition"
      >
        Continue
      </button>

    </div>

  </div>
)}

</div>
);
}