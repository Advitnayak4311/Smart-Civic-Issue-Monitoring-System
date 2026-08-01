import axios from "axios";

// Base API URL
const API = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Debug log (remove after testing)
console.log("✅ API Base URL:", API.defaults.baseURL);

// Request interceptor
API.interceptors.request.use((config) => {
  console.log(
    `🚀 ${config.method?.toUpperCase()} Request:`,
    `${config.baseURL}${config.url}`
  );
  return config;
});

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error);

    if (error.config) {
      console.error(
        "❌ Failed URL:",
        `${error.config.baseURL}${error.config.url}`
      );
    }

    return Promise.reject(error);
  }
);

// =========================
// Complaint APIs
// =========================

export const createComplaint = (data) => {
  console.log("📤 Submitting Complaint...");
  return API.post("/complaint", data);
};

export const trackComplaint = (complaintId) =>
  API.get(`/admin/track/${complaintId}`);

export default API;