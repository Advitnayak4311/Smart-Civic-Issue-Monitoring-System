import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import SuperAdminLoginPage from "./pages/SuperAdminLoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import VerifyComplaint from "./pages/VerifyComplaint";
import ServiceConfiguration from "./pages/ServiceConfiguration";
import ClosedComplaints from "./pages/ClosedComplaints";
import GisDashboard from "./pages/GisDashboard";
import PublicTransparencyPortal from "./pages/PublicTransparencyPortal";
import AiCommandCenter from "./pages/AiCommandCenter";
import CivicChatbot from "./components/CivicChatbot";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/track/:complaintId" element={<TrackComplaint />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/superadmin-login" element={<SuperAdminLoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/service-config" element={<ServiceConfiguration />} />
        <Route path="/closed-complaints" element={<ClosedComplaints />} />
        <Route path="/gis-map" element={<GisDashboard />} />
        <Route path="/transparency" element={<PublicTransparencyPortal />} />
        <Route path="/ai-command" element={<AiCommandCenter />} />
        <Route path="/verify/:token" element={<VerifyComplaint />} />
      </Routes>
      <CivicChatbot />
    </>
  );
}

export default App;