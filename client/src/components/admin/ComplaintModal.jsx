export default function ComplaintModal({
  selectedComplaint,
  setSelectedComplaint,
  status,
  setStatus,
  handleUpdate,
}) {
  if (!selectedComplaint) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-8 w-[90%] max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">

        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">
            Complaint Details
          </h2>

          <button
            onClick={() => setSelectedComplaint(null)}
            className="text-3xl"
          >
            ×
          </button>
        </div>

        <img
          src={selectedComplaint.imageUrl}
          alt=""
          className="w-full h-72 object-cover rounded-2xl mt-6"
        />

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div>
            <p className="text-gray-500">Complaint ID</p>
            <h3 className="font-bold">
              {selectedComplaint.complaintId}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">Citizen</p>
            <h3 className="font-bold">
              {selectedComplaint.citizenName}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">Phone</p>
            <h3>{selectedComplaint.phone}</h3>
          </div>

          <div>
            <p className="text-gray-500">Email</p>
            <h3>{selectedComplaint.email}</h3>
          </div>

          <div>
            <p className="text-gray-500">Category</p>
            <h3>{selectedComplaint.category}</h3>
          </div>

          <div>
            <p className="text-gray-500">Issue</p>
            <h3>{selectedComplaint.issue}</h3>
          </div>

        </div>

        <div className="mt-6">
          <p className="text-gray-500">Address</p>
          <p>{selectedComplaint.address}</p>
        </div>

        <div className="mt-4">
          <a
            href={`https://www.google.com/maps?q=${selectedComplaint.location.latitude},${selectedComplaint.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            📍 Open in Google Maps
          </a>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <p className="font-semibold">
            Auto Assigned Priority:
          </p>

          <span
            className={`px-4 py-2 rounded-full font-bold ${
              selectedComplaint.priority === "High"
                ? "bg-red-100 text-red-700"
                : selectedComplaint.priority === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {selectedComplaint.priority}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <p className="font-semibold">
            Department:
          </p>

          <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold">
            🏢 {selectedComplaint.department}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">

          <div>

            <label className="font-semibold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full mt-2 border rounded-xl p-3"
            >
              <option>Pending</option>
              <option>Accepted</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

          </div>

        </div>

        <button
          onClick={handleUpdate}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition"
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}