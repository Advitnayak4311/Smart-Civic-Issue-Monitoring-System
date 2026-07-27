import { useEffect, useState } from "react";

export default function ServiceConfiguration() {
  const [services, setServices] = useState([]);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/service-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServices(data.services);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const resetForm = () => {
    setCategory("");
    setSubcategory("");
    setDepartment("");
    setPriority("Medium");
    setEditingId(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!category || !subcategory || !department) {
      return alert("Please fill all fields.");
    }

    try {
      const url = isEditing
        ? `http://localhost:8000/api/service-config/${editingId}`
        : "http://localhost:8000/api/service-config";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          subcategory,
          department,
          priority,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        return alert(data.message);
      }

      if (isEditing) {
        setServices((prev) =>
          prev.map((item) =>
            item._id === editingId ? data.service : item
          )
        );

        alert("✅ Service Updated Successfully");
      } else {
        setServices((prev) => [...prev, data.service]);
        alert("✅ Service Added Successfully");
      }

      resetForm();
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/service-config/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!data.success) {
        return alert(data.message);
      }

      setServices((prev) =>
        prev.filter((service) => service._id !== id)
      );

      alert("✅ Service Deleted Successfully");
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (service) => {
    setCategory(service.category);
    setSubcategory(service.subcategory);
    setDepartment(service.department);
    setPriority(service.priority);

    setEditingId(service._id);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-4xl font-bold text-slate-800">
        📂 Service Configuration
      </h1>

      <p className="mt-2 text-slate-500">
        Manage complaint services, departments and priorities.
      </p>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-6 text-2xl font-semibold">
          {isEditing ? "✏️ Update Service" : "➕ Add Service"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border p-3"
          >
            <option value="">Select Category</option>
            <option value="Road Issues">Road Issues</option>
            <option value="Water & Pipeline">
              Water & Pipeline
            </option>
            <option value="Street Light">
              Street Light
            </option>
            <option value="Garbage">Garbage</option>
            <option value="Other Issues">
              Other Issues
            </option>
          </select>

          <input
            type="text"
            placeholder="Subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="rounded-lg border p-3"
          />

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-lg border p-3"
          >
            <option value="">Select Department</option>
            <option value="Road Department">
              Road Department
            </option>
            <option value="Water Department">
              Water Department
            </option>
            <option value="Electrical Department">
              Electrical Department
            </option>
            <option value="Sanitation Department">
              Sanitation Department
            </option>
            <option value="General Department">
              General Department
            </option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border p-3"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          {isEditing ? "Update Service" : "Save Service"}
        </button>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        {services.length === 0 ? (
          <p className="text-slate-500">
            No services configured yet.
          </p>
        ) : (
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-100">
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Subcategory</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>

                          {services.map((service) => (
                <tr
                  key={service._id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-3">{service.category}</td>

                  <td className="p-3">
                    {service.subcategory}
                  </td>

                  <td className="p-3">
                    {service.department}
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded px-3 py-1 text-white ${
                        service.priority === "High"
                          ? "bg-red-500"
                          : service.priority === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {service.priority}
                    </span>
                  </td>

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(service._id)
                      }
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}