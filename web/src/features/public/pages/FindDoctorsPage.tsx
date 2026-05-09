import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useDoctorSearch } from "../../public/hooks/useDoctorSearch";
import FiltersPanel from "../components/findDoctors/FiltersPanel";
import ActiveFilterChips from "../components/findDoctors/ActiveFilterChips";
import FindDoctorsResultsGrid from "../components/findDoctors/FindDoctorsResultsGrid";
import FindDoctorsPagination from "../components/findDoctors/FindDoctorsPagination";

const FindDoctorsPage: React.FC = () => {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [city, setCity] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  // Applied = committed on Search click; local state is just input state
  const [applied, setApplied] = useState({
    name: "",
    specialization: "",
    city: "",
    maxFees: "",
  });

  const { data, isLoading, isFetching } = useDoctorSearch({
    name: applied.name || undefined,
    specialization: applied.specialization || undefined,
    city: applied.city || undefined,
    maxFees: applied.maxFees ? Number(applied.maxFees) : undefined,
    page,
    size: 9,
  });

  const doctors = data?.data?.content ?? [];
  const pageInfo = data?.data?.page;
  const totalPages = pageInfo?.totalPages ?? 0;
  const total = pageInfo?.totalElements ?? 0;

  const hasActiveFilters = !!(
    applied.name ||
    applied.specialization ||
    applied.city ||
    applied.maxFees
  );
  const activeInputCount = [name, specialization, city, maxFees].filter(
    Boolean,
  ).length;

  const handleSearch = () => {
    setApplied({ name, specialization, city, maxFees });
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setName("");
    setSpecialization("");
    setCity("");
    setMaxFees("");
    setApplied({ name: "", specialization: "", city: "", maxFees: "" });
    setPage(0);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-100">Find Doctors</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Search and book appointments with verified doctors
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by doctor name..."
            className="w-full pl-9 pr-3 py-2.5 bg-gray-900/60 border border-gray-700/60 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all backdrop-blur-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={[
            "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-all",
            showFilters || hasActiveFilters
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-900/30"
              : "border-gray-700/60 text-gray-400 hover:border-gray-600 hover:text-gray-200 bg-gray-900/40",
          ].join(" ")}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeInputCount > 0 && (
            <span className="w-4 h-4 bg-white/25 text-white text-xs rounded-full flex items-center justify-center leading-none font-bold">
              {activeInputCount}
            </span>
          )}
        </button>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30"
        >
          Search
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FiltersPanel
          specialization={specialization}
          city={city}
          maxFees={maxFees}
          onSpecializationChange={setSpecialization}
          onCityChange={setCity}
          onMaxFeesChange={setMaxFees}
          onApply={handleSearch}
          onClear={handleClear}
          showClear={!!(name || specialization || city || maxFees)}
          onKeyDown={handleKeyDown}
        />
      )}

      {/* Active Filter Chips */}
      <ActiveFilterChips
        applied={applied}
        onRemoveName={() => {
          setApplied((a) => ({ ...a, name: "" }));
          setName("");
        }}
        onRemoveSpecialization={() => {
          setApplied((a) => ({ ...a, specialization: "" }));
          setSpecialization("");
        }}
        onRemoveCity={() => {
          setApplied((a) => ({ ...a, city: "" }));
          setCity("");
        }}
        onRemoveMaxFees={() => {
          setApplied((a) => ({ ...a, maxFees: "" }));
          setMaxFees("");
        }}
        onClearAll={handleClear}
      />

      {/* Results Grid */}
      <FindDoctorsResultsGrid
        doctors={doctors}
        isLoading={isLoading}
        isFetching={isFetching}
        total={total}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClear}
      />

      {/* Pagination */}
      <FindDoctorsPagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
      />
    </div>
  );
};

export default FindDoctorsPage;
