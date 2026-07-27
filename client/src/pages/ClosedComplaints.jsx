import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClosedComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClosedComplaints();
  }, []);

  const fetchClosedComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
  "http://localhost:8000/api/admin/complaints/closed",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setComplaints(data.complaints);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch closed complaints.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this complaint permanently?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/admin/complaints/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Complaint deleted successfully.");

        setComplaints((prev) =>
          prev.filter((item) => item._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            📁 Closed Complaints
          </h1>

          <p className="mt-2 text-slate-500">
            View permanently closed complaints.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          ← Dashboard
        </button>
      </div>
            {loading ? (
        <div className="mt-10 text-center">
          <p className="text-lg text-slate-600">
            Loading closed complaints...
          </p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="mt-10 rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-2xl font-semibold text-slate-700">
            🎉 No Closed Complaints
          </h2>

          <p className="mt-3 text-slate-500">
            There are no closed complaints available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-4 text-left">Complaint ID</th>
                <th className="p-4 text-left">Citizen</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Issue</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Priority</th>
                <th className="p-4 text-left">Closed On</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4 font-medium">
                    {complaint.complaintId}
                  </td>

                  <td className="p-4">
                    {complaint.citizenName}
                  </td>

                  <td className="p-4">
                    {complaint.category}
                  </td>

                  <td className="p-4">
                    {complaint.issue}
                  </td>

                  <td className="p-4">
                    {complaint.department}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded px-3 py-1 text-white ${
                        complaint.priority === "High"
                          ? "bg-red-500"
                          : complaint.priority === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {complaint.priority}
                    </span>
                  </td>

                  <td className="p-4">
                    {complaint.verificationDate
                      ? new Date(
                          complaint.verificationDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        handleDelete(complaint._id)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}