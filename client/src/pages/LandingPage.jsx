import Navbar from "../components/Navbar";
import HeroCards from "../components/HeroCards";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />
        <HeroCards />
      </div>
      <Footer />
    </div>
  );
}