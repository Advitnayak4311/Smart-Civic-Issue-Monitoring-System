export default function SearchFilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

      <input
        type="text"
        placeholder="🔍 Search Complaint ID, Name or Phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-2xl p-4 shadow-sm"
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border rounded-2xl p-4"
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="border rounded-2xl p-4"
      >
        <option value="All">All Categories</option>
        <option value="Road Issues">Road Issues</option>
        <option value="Garbage">Garbage</option>
        <option value="Street Light">Street Light</option>
        <option value="Drainage">Drainage</option>
        <option value="Water Supply">Water Supply</option>
      </select>

    </div>
  );
}