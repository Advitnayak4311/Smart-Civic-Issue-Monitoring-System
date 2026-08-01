import { Search, Filter, Layers, Clock } from "lucide-react";

export default function SearchFilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by ID, Citizen, Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Road Issues">Road Issues</option>
          <option value="Garbage">Garbage</option>
          <option value="Street Light">Street Light</option>
          <option value="Drainage">Drainage</option>
          <option value="Water Supply">Water Supply</option>
        </select>
      </div>
    </div>
  );
}