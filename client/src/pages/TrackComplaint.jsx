import { useState } from "react";
import ComplaintTimeline from "../components/ComplaintTimeline";
export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async () => {
  setError("");
  setComplaint(null);

  try {
    const res = await fetch(
      `http://localhost:8000/api/admin/track/${complaintId}`
    );

    console.log("Status:", res.status);

    const data = await res.json();

    console.log("Response:", data);

    if (data.success) {
      setComplaint(data.data);
    } else {
      setError(data.message);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    setError(err.message);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-center text-blue-700">
          Track Complaint
        </h1>

        <div className="flex gap-3 mt-8">

          <input
            type="text"
            placeholder="Enter Complaint ID"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            className="flex-1 border rounded-xl p-4"
          />

          <button
            onClick={handleTrack}
            className="bg-blue-600 text-white px-6 rounded-xl"
          >
            Track
          </button>

        </div>

        {error && (
          <p className="text-red-600 mt-4">{error}</p>
        )}

        {complaint && (
          <div className="mt-8 space-y-6">


          <div className="bg-white rounded-2xl shadow-lg border p-6">

  <div className="flex justify-between items-center">

    <div>

      <h2 className="text-2xl font-bold text-blue-700">
        {complaint.complaintId}
      </h2>

      <p className="text-gray-500">
        Complaint Summary
      </p>

    </div>
    <ComplaintTimeline complaint={complaint} />

    <span
      className={`px-4 py-2 rounded-full text-white font-semibold
      ${
        complaint.status === "Pending"
          ? "bg-yellow-500"
          : complaint.status === "Accepted"
          ? "bg-blue-500"
          : complaint.status === "In Progress"
          ? "bg-orange-500"
          : complaint.status === "Completed"
          ? "bg-green-500"
          : "bg-gray-600"
      }`}
    >
      {complaint.status}
    </span>

  </div>

  <div className="grid grid-cols-2 gap-5 mt-6">

    <div>
      <p className="text-gray-500">Priority</p>
      <h3 className="font-semibold">
        {complaint.priority}
      </h3>
    </div>

    <div>
      <p className="text-gray-500">Department</p>
      <h3 className="font-semibold">
        {complaint.department}
      </h3>
    </div>

  </div>

</div>

            <img
              src={complaint.imageUrl}
              alt=""
              className="w-full h-64 object-cover rounded-xl"
            />

            <h2 className="text-2xl font-bold mt-6">
              {complaint.complaintId}
            </h2>

            <p className="mt-2">
              <strong>Citizen:</strong> {complaint.citizenName}
            </p>

            <p>
              <strong>Category:</strong> {complaint.category}
            </p>

            <p>
              <strong>Status:</strong> {complaint.status}
            </p>

            <p>
              <strong>Priority:</strong> {complaint.priority}
            </p>

            <p>
              <strong>Department:</strong> {complaint.department}
            </p>

            <p>
              <strong>Address:</strong> {complaint.address}
            </p>

          </div>
        )}

      </div>
    </div>
  );
}