import React, {useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, Stethoscope, UserCircle, X} from 'lucide-react';
import {useSearchDoctors} from '../hooks/usePublicDoctor';
import {type Specialization, SPECIALIZATION_LABELS} from '../../doctor/types/doctor.types';
import {CLINIC_TYPE_LABELS} from '../../doctor/types/doctor.clinic.types';
import {ROUTES} from '../../../routes/routePaths';
import {useAuth} from '../../../shared/hooks/useAuth';
import Spinner from '../../../shared/components/ui/Spinner';

const ALL_SPECIALIZATIONS = Object.keys(SPECIALIZATION_LABELS) as Specialization[];

const DoctorSearchPage: React.FC = () => {
    // const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const {isAuthenticated, isPatient, isDoctor} = useAuth();

    // Derive filter state from URL params — bookmarkable search
    const [name, setName] = useState(searchParams.get('name') ?? '');
    const [specialization, setSpecialization] = useState(searchParams.get('specialization') ?? '');
    const [city, setCity] = useState(searchParams.get('city') ?? '');
    const [maxFees, setMaxFees] = useState(searchParams.get('maxFees') ?? '');
    const [page, setPage] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    // Build the active filter object from current state
    const activeFilters = {
        name: name || undefined,
        specialization: specialization || undefined,
        city: city || undefined,
        maxFees: maxFees ? Number(maxFees) : undefined,
        page,
        size: 9,
    };

    const {data: searchRes, isLoading, isFetching} = useSearchDoctors(activeFilters);
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
        setSearchParams(params, {replace: true});
        setPage(0);
    }, [name, specialization, city, maxFees]);

    const clearFilters = () => {
        setName('');
        setSpecialization('');
        setCity('');
        setMaxFees('');
    };

    const hasActiveFilters = !!(name || specialization || city || maxFees);

    const getDashboardRoute = () => {
        if (isPatient) return ROUTES.patientDashboard;
        if (isDoctor) return ROUTES.doctorDashboard;
        return ROUTES.login;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope size={16} className="text-white"/>
                        </div>
                        <span className="text-lg font-bold text-gray-900">LuneCare</span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link
                                to={getDashboardRoute()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to={ROUTES.login}
                                      className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                    Sign In
                                </Link>
                                <Link
                                    to={ROUTES.register}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Search Bar */}
                <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Search by doctor name..."
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters || hasActiveFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <SlidersHorizontal size={14}/>
                            Filters
                            {hasActiveFilters && (
                                <span
                                    className="w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center leading-none">
                                    {[name, specialization, city, maxFees].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm text-gray-500 rounded-lg hover:bg-gray-50"
                            >
                                <X size={13}/> Clear
                            </button>
                        )}
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                                <select
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">All Specializations</option>
                                    {ALL_SPECIALIZATIONS.map((s) => (
                                        <option key={s} value={s}>{SPECIALIZATION_LABELS[s]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Bengaluru"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Max Fees (₹)</label>
                                <input
                                    type="number"
                                    value={maxFees}
                                    onChange={(e) => setMaxFees(e.target.value)}
                                    placeholder="e.g. 1000"
                                    min={0}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                        {isLoading || isFetching ? (
                            <span className="flex items-center gap-1.5"><Spinner size="sm"/> Searching...</span>
                        ) : (
                            <>{totalElements} doctor{totalElements !== 1 ? 's' : ''} found</>
                        )}
                    </p>
                </div>

                {/* Results Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size="lg"/>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search size={22} className="text-gray-300"/>
                        </div>
                        <p className="text-sm text-gray-500">No doctors found matching your criteria.</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((doctor) => {
                            const clinic = doctor.clinics.find((c) => c.active) ?? doctor.clinics[0];
                            return (
                                <Link
                                    key={doctor.id}
                                    to={`/doctors/${doctor.id}`}
                                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
                                >
                                    {/* Doctor Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        {doctor.profilePhotoUrl ? (
                                            <img
                                                src={doctor.profilePhotoUrl}
                                                alt="Doctor"
                                                className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-gray-100"
                                            />
                                        ) : (
                                            <div
                                                className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <UserCircle size={32} className="text-blue-300"/>
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                {doctor.specialization
                                                    ? SPECIALIZATION_LABELS[doctor.specialization]
                                                    : '—'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {[doctor.qualification, doctor.yearsOfExperience != null ? `${doctor.yearsOfExperience} yrs` : null]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Languages */}
                                    {doctor.languagesSpoken.length > 0 && (
                                        <p className="text-xs text-gray-400 mb-3 truncate">
                                            Speaks: {doctor.languagesSpoken.join(', ')}
                                        </p>
                                    )}

                                    {/* Clinics */}
                                    {doctor.clinics.length > 0 && (
                                        <div className="space-y-1.5">
                                            {doctor.clinics.slice(0, 2).map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                                                >
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <MapPin size={10} className="text-gray-400 flex-shrink-0"/>
                                                        <span className="text-xs text-gray-600 truncate">
                                                            {c.city} · {CLINIC_TYPE_LABELS[c.type] || c.type}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className="text-xs font-semibold text-teal-600 flex-shrink-0 ml-2">
                                                        ₹{c.consultationFees}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-3 text-xs text-blue-600 font-medium group-hover:underline">
                                        View & Book →
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14}/> Prev
                        </button>
                        <span className="text-sm text-gray-500 px-2">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSearchPage;