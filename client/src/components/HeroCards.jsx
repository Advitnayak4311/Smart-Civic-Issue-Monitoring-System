import { Link } from "react-router-dom";

export default function HeroCards() {
  return (
    <section className="relative flex items-center justify-center min-h-[85vh]">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/bakcground----.jpg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-7xl px-6">

        <h1 className="text-5xl md:text-6xl font-extrabold text-white">
          Smart Civic
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mt-4">
          Issue Monitoring & Response System
        </p>

        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          Report civic issues quickly and track their resolution in real-time.
          Making cities cleaner, safer and smarter.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-16">

          {/* Register */}
          <Link
            to="/register"
            className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition duration-300"
          >

            <div className="text-7xl">
                📢
            </div>

            <h2 className="text-3xl font-bold text-blue-700 mt-6">
              REGISTER
              <br />
              COMPLAINT
            </h2>

            <p className="text-gray-600 mt-5 leading-7">
              Report potholes, garbage,
              water leakage,
              streetlight faults and
              other civic issues instantly.
            </p>

            <button className="mt-8 bg-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-800">
              Register Now
            </button>

          </Link>

          {/* Track */}

          <Link
            to="/track"
            className="bg-white rounded-3xl shadow-2xl p-10 hover:scale-105 transition duration-300"
          >

            <div className="text-7xl">
                📍
            </div>

            <h2 className="text-3xl font-bold text-green-700 mt-6">
              TRACK
              <br />
              COMPLAINT
            </h2>

            <p className="text-gray-600 mt-5 leading-7">
              Check complaint status,
              updates and final
              resolution using your
              Complaint ID.
            </p>

            <button className="mt-8 bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700">
              Track Now
            </button>

          </Link>

        </div>

      </div>

    </section>
  );
}