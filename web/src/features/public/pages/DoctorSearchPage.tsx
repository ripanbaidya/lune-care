import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Stethoscope, X } from "lucide-react";
import { useSearchDoctors } from "../hooks/usePublicDoctor";
import { ROUTES } from "../../../routes/routePaths";
import { useAuth } from "../../../shared/hooks/useAuth";
import DoctorSearchFiltersPanel from "../components/doctor-search/DoctorSearchFiltersPanel";
import DoctorSearchActiveChips from "../components/doctor-search/DoctorSearchActiveChips";
import DoctorSearchResultsGrid from "../components/doctor-search/DoctorSearchResultsGrid";
import DoctorSearchPagination from "../components/doctor-search/DoctorSearchPagination";

const DoctorSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isPatient, isDoctor } = useAuth();

  // Derive filter state from URL params — bookmarkable search
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [specialization, setSpecialization] = useState(
    searchParams.get("specialization") ?? "",
  );
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [maxFees, setMaxFees] = useState(searchParams.get("maxFees") ?? "");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters = {
    name: name || undefined,
    specialization: specialization || undefined,
    city: city || undefined,
    maxFees: maxFees ? Number(maxFees) : undefined,
    page,
    size: 9,
  };

  const {
    data: searchRes,
    isLoading,
    isFetching,
  } = useSearchDoctors(activeFilters);
  const results = searchRes?.data?.content ?? [];
  const pageInfo = searchRes?.data?.page;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? 0;

  // Sync URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (name) params.name = name;
    if (specialization) params.specialization = specialization;
    if (city) params.city = city;
    if (maxFees) params.maxFees = maxFees;
    setSearchParams(params, { replace: true });
    setPage(0);
  }, [name, specialization, city, maxFees]);

  const clearFilters = () => {
    setName("");
    setSpecialization("");
    setCity("");
    setMaxFees("");
  };

  const hasActiveFilters = !!(name || specialization || city || maxFees);
  const activeFilterCount = [name, specialization, city, maxFees].filter(
    Boolean,
  ).length;

  const getDashboardRoute = () => {
    if (isPatient) return ROUTES.patientDashboard;
    if (isDoctor) return ROUTES.doctorDashboard;
    return ROUTES.login;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <header className="bg-gray-950/80 border-b border-gray-800/50 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">LuneCare</span>
          </Link>
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardRoute()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.login}
                  className="text-sm text-gray-400 hover:text-gray-100 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.register}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl px-5 py-4 mb-6 backdrop-blur-sm">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Search by doctor name..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={[
                "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-all",
                showFilters || hasActiveFilters
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-900/30"
                  : "border-gray-700/60 text-gray-400 hover:border-gray-600 hover:text-gray-200 bg-gray-800/40",
              ].join(" ")}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-white/25 text-white text-xs rounded-full flex items-center justify-center leading-none font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 border border-gray-700/60 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-600 rounded-xl transition-all"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <DoctorSearchFiltersPanel
              specialization={specialization}
              city={city}
              maxFees={maxFees}
              onSpecializationChange={setSpecialization}
              onCityChange={setCity}
              onMaxFeesChange={setMaxFees}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <DoctorSearchActiveChips
            name={name}
            specialization={specialization}
            city={city}
            maxFees={maxFees}
            onClearName={() => setName("")}
            onClearSpecialization={() => setSpecialization("")}
            onClearCity={() => setCity("")}
            onClearMaxFees={() => setMaxFees("")}
            onClearAll={clearFilters}
          />
        )}

        {/* Results Grid */}
        <DoctorSearchResultsGrid
          doctors={results}
          isLoading={isLoading}
          isFetching={isFetching}
          totalElements={totalElements}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Pagination */}
        <DoctorSearchPagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      </div>
    </div>
  );
};

export default DoctorSearchPage;
