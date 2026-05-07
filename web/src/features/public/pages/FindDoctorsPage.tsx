import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    IndianRupee,
    MapPin,
    Search,
    SlidersHorizontal,
    Stethoscope,
    UserCircle,
    X,
} from 'lucide-react';
import {useDoctorSearch} from '../../public/hooks/useDoctorSearch';
import {type Specialization, SPECIALIZATION_LABELS} from '../../doctor/types/doctor.types';
import Spinner from '../../../shared/components/ui/Spinner';

const ALL_SPECIALIZATIONS = Object.keys(SPECIALIZATION_LABELS) as Specialization[];

// ── Doctor Card ───────────────────────────────────────────────────────────────
interface DoctorCardProps {
    doctor: {
        id: string;
        firstName: string;
        lastName: string;
        profilePhotoUrl: string | null;
        specialization: string | null;
        qualification: string | null;
        yearsOfExperience: number | null;
        bio: string | null;
        languagesSpoken: string[];
        clinics: {
            id: string;
            name: string;
            type: string;
            consultationFees: number;
            consultationDurationMinutes: number;
            city: string;
            state: string;
            active: boolean;
        }[];
    };
}

const DoctorCard: React.FC<DoctorCardProps> = ({doctor}) => {
    const navigate = useNavigate();
    const primaryClinic = doctor.clinics.find((c) => c.active) ?? doctor.clinics[0];
    const specLabel = doctor.specialization
        ? (SPECIALIZATION_LABELS[doctor.specialization as Specialization] ?? doctor.specialization)
        : null;

    return (
        <button
            onClick={() => navigate(`/doctors/${doctor.id}`)}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
        >
            <div className="flex items-start gap-3">
                {doctor.profilePhotoUrl ? (
                    <img
                        src={doctor.profilePhotoUrl}
                        alt={`Dr. ${doctor.firstName}`}
                        className="w-14 h-14 rounded-full object-cover border border-gray-100 flex-shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={26} className="text-blue-400"/>
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                        Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    {specLabel && (
                        <span className="inline-block text-xs text-blue-600 font-medium mt-0.5">
                            {specLabel}
                        </span>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        {doctor.qualification && (
                            <span className="text-xs text-gray-400">{doctor.qualification}</span>
                        )}
                        {doctor.yearsOfExperience != null && (
                            <>
                                <span className="text-gray-200">·</span>
                                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                    <Clock size={10}/> {doctor.yearsOfExperience} yrs
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {doctor.bio && (
                <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
                    {doctor.bio}
                </p>
            )}

            {primaryClinic && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                        <MapPin size={11} className="flex-shrink-0 text-gray-400"/>
                        <span className="truncate">{primaryClinic.city}, {primaryClinic.state}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-700 flex-shrink-0">
                        <IndianRupee size={12}/>
                        {primaryClinic.consultationFees.toLocaleString('en-IN')}
                    </div>
                </div>
            )}

            {doctor.languagesSpoken.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                    {doctor.languagesSpoken.slice(0, 3).map((lang) => (
                        <span key={lang} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {lang}
                        </span>
                    ))}
                    {doctor.languagesSpoken.length > 3 && (
                        <span className="text-xs text-gray-400">+{doctor.languagesSpoken.length - 3}</span>
                    )}
                </div>
            )}

            <div className="mt-3 text-xs text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                View Profile & Book →
            </div>
        </button>
    );
};

// ── Filter Chip ───────────────────────────────────────────────────────────────
const FilterChip: React.FC<{label: string; onRemove: () => void}> = ({label, onRemove}) => (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
        {label}
        <button onClick={onRemove} className="hover:text-blue-900 ml-0.5">
            <X size={10}/>
        </button>
    </span>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const FindDoctorsPage: React.FC = () => {
    const [name, setName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [city, setCity] = useState('');
    const [maxFees, setMaxFees] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(0);

    // Applied = committed on Search click; local state is just input state
    const [applied, setApplied] = useState({name: '', specialization: '', city: '', maxFees: ''});

    const {data, isLoading, isFetching} = useDoctorSearch({
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

    const hasActiveFilters = !!(applied.name || applied.specialization || applied.city || applied.maxFees);

    const handleSearch = () => {
        setApplied({name, specialization, city, maxFees});
        setPage(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleClear = () => {
        setName(''); setSpecialization(''); setCity(''); setMaxFees('');
        setApplied({name: '', specialization: '', city: '', maxFees: ''});
        setPage(0);
    };

    return (
        <div className="space-y-5 pb-8">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Find Doctors</h1>
                <p className="text-sm text-gray-500 mt-0.5">Search and book appointments with verified doctors</p>
            </div>

            {/* Search bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search by doctor name..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={[
                        'flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-colors',
                        showFilters || hasActiveFilters
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50',
                    ].join(' ')}
                >
                    <SlidersHorizontal size={14}/>
                    <span className="hidden sm:inline">Filters</span>
                    {hasActiveFilters && (
                        <span className="w-4 h-4 bg-white/30 text-white text-xs rounded-full flex items-center justify-center leading-none font-bold">
                            {[applied.name, applied.specialization, applied.city, applied.maxFees].filter(Boolean).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All specializations</option>
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
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. Kolkata"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Max Fees (₹)</label>
                            <div className="relative">
                                <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input
                                    type="number"
                                    value={maxFees}
                                    onChange={(e) => setMaxFees(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. 1000"
                                    min={0}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                        {(name || specialization || city || maxFees) && (
                            <button
                                onClick={handleClear}
                                className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">Active filters:</span>
                    {applied.name && (
                        <FilterChip
                            label={`Name: "${applied.name}"`}
                            onRemove={() => {setApplied((a) => ({...a, name: ''})); setName('');}}
                        />
                    )}
                    {applied.specialization && (
                        <FilterChip
                            label={SPECIALIZATION_LABELS[applied.specialization as Specialization] ?? applied.specialization}
                            onRemove={() => {setApplied((a) => ({...a, specialization: ''})); setSpecialization('');}}
                        />
                    )}
                    {applied.city && (
                        <FilterChip
                            label={`📍 ${applied.city}`}
                            onRemove={() => {setApplied((a) => ({...a, city: ''})); setCity('');}}
                        />
                    )}
                    {applied.maxFees && (
                        <FilterChip
                            label={`≤ ₹${applied.maxFees}`}
                            onRemove={() => {setApplied((a) => ({...a, maxFees: ''})); setMaxFees('');}}
                        />
                    )}
                    <button
                        onClick={handleClear}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5 ml-1"
                    >
                        <X size={11}/> Clear all
                    </button>
                </div>
            )}

            {/* Results */}
            {isLoading || isFetching ? (
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner size="lg"/>
                        <p className="text-sm text-gray-400">Searching doctors...</p>
                    </div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Stethoscope size={28} className="text-gray-300"/>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No doctors found</p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                        Try adjusting your search filters or searching by a different name.
                    </p>
                    {hasActiveFilters && (
                        <button onClick={handleClear} className="text-sm text-blue-600 hover:underline">
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">{total}</span>{' '}
                            doctor{total !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {doctors.map((doc) => (
                            <DoctorCard key={doc.id} doctor={doc}/>
                        ))}
                    </div>
                </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14}/> Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindDoctorsPage;