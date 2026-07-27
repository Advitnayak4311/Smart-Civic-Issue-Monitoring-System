import { Link, useLocation } from "react-router-dom";
import { FaCity } from "react-icons/fa";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-white font-bold text-3xl"
        >
          <FaCity className="text-yellow-400 text-4xl" />
          <span>Smart Civic</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">

          <Link
            to="/"
            className={`transition ${
              location.pathname === "/"
                ? "text-yellow-400 font-semibold"
                : "text-white hover:text-yellow-300"
            }`}
          >
            Home
          </Link>

          <Link
            to="/register"
            className={`transition ${
              location.pathname === "/register"
                ? "text-yellow-400 font-semibold"
                : "text-white hover:text-yellow-300"
            }`}
          >
            Register
          </Link>

          <Link
            to="/track"
            className={`transition ${
              location.pathname === "/track"
                ? "text-yellow-400 font-semibold"
                : "text-white hover:text-yellow-300"
            }`}
          >
            Track
          </Link>

          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-white font-semibold transition"
          >
            Admin Login
          </Link>

        </div>
      </div>
    </nav>
  );
}