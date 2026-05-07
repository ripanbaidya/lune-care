import React, {useState} from 'react';
import {Search, SlidersHorizontal, X} from 'lucide-react';
import {useDoctorSearch} from '../hooks/useDoctorSearch';
import DoctorSearchCard from '../components/DoctorSearchCard';
import {SPECIALIZATION_LABELS, type Specialization} from '../../doctor/types/doctor.types';
import Spinner from '../../../shared/components/ui/Spinner';

const ALL_SPECIALIZATIONS = Object.keys(SPECIALIZATION_LABELS) as Specialization[];

const FindDoctorsPage: React.FC = () => {
    const [name, setName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [city, setCity] = useState('');
    const [maxFees, setMaxFees] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Applied filters (only change on "Search" button click for controlled UX)
    const [applied, setApplied] = useState({name: '', specialization: '', city: '', maxFees: ''});

    const {data, isLoading, isFetching} = useDoctorSearch({
        name: applied.name || undefined,
        specialization: applied.specialization || undefined,
        city: applied.city || undefined,
        maxFees: applied.maxFees ? Number(applied.maxFees) : undefined,
        size: 20,
    });

    const doctors = data?.data?.content ?? [];
    const total = data?.data?.page?.totalElements ?? 0;

    const handleSearch = () => {
        setApplied({name, specialization, city, maxFees});
    };

    const handleClear = () => {
        setName('');
        setSpecialization('');
        setCity('');
        setMaxFees('');
        setApplied({name: '', specialization: '', city: '', maxFees: ''});
    };

    const hasFilters = applied.name || applied.specialization || applied.city || applied.maxFees;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Find Doctors</h1>
                <p className="text-sm text-gray-500 mt-0.5">Search and book appointments</p>
            </div>

            {/* Search bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by doctor name..."
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors ${
                        showFilters ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <SlidersHorizontal size={14}/>
                    Filters
                </button>
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Specialization */}
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

                        {/* City */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Kolkata"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Max Fees */}
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
                </div>
            )}

            {/* Active filter chips */}
            {hasFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Filters:</span>
                    {applied.name && (
                        <span
                            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Name: {applied.name}
                        </span>
                    )}
                    {applied.specialization && (
                        <span
                            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {SPECIALIZATION_LABELS[applied.specialization as Specialization]}
                        </span>
                    )}
                    {applied.city && (
                        <span
                            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {applied.city}
                        </span>
                    )}
                    {applied.maxFees && (
                        <span
                            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            ≤ ₹{applied.maxFees}
                        </span>
                    )}
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-0.5 text-xs text-red-500 hover:text-red-700"
                    >
                        <X size={12}/> Clear
                    </button>
                </div>
            )}

            {/* Results */}
            <div>
                {(isLoading || isFetching) ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="md"/>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <Search size={32} className="text-gray-200"/>
                        <p className="text-sm text-gray-400">No doctors found matching your criteria.</p>
                        {hasFilters && (
                            <button onClick={handleClear} className="text-xs text-blue-600 hover:underline">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-gray-400 mb-3">{total} doctors found</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {doctors.map((doc) => (
                                <DoctorSearchCard key={doc.id} doctor={doc}/>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FindDoctorsPage;