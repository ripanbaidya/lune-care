import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Search, Stethoscope, MapPin, Star, ChevronRight, UserCircle} from 'lucide-react';
import {useSearchDoctors} from '../hooks/usePublicDoctor';
import {SPECIALIZATION_LABELS} from '../../doctor/types/doctor.types';
import {CLINIC_TYPE_LABELS} from '../../doctor/types/doctor.clinic.types';
import {ROUTES} from '../../../routes/routePaths';
import {useAuth} from '../../../shared/hooks/useAuth';
import Spinner from '../../../shared/components/ui/Spinner';

const QUICK_SPECIALIZATIONS = [
    'CARDIOLOGIST',
    'DERMATOLOGIST',
    'NEUROLOGIST',
    'PEDIATRICIAN',
    'GYNECOLOGIST',
    'GENERAL_PHYSICIAN',
] as const;

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const {isAuthenticated, isPatient, isDoctor} = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // Load some featured doctors with no filters
    const {data: featuredRes, isLoading: featuredLoading} = useSearchDoctors({size: 6}, true);
    const featured = featuredRes?.data?.content ?? [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?name=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/search');
        }
    };

    const handleSpecialization = (spec: string) => {
        navigate(`/search?specialization=${spec}`);
    };

    const getDashboardRoute = () => {
        if (isPatient) return ROUTES.patientDashboard;
        if (isDoctor) return ROUTES.doctorDashboard;
        return ROUTES.login;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Top Nav ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope size={16} className="text-white"/>
                        </div>
                        <span className="text-lg font-bold text-gray-900">LuneCare</span>
                    </Link>

                    <nav className="flex items-center gap-3">
                        <Link
                            to="/search"
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:inline"
                        >
                            Find Doctors
                        </Link>
                        {isAuthenticated ? (
                            <Link
                                to={getDashboardRoute()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to={ROUTES.login}
                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                                >
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

            {/* ── Hero ── */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                        Find the Right Doctor for You
                    </h1>
                    <p className="text-blue-100 text-base mb-8">
                        Search by name, specialization, or city and book an appointment in minutes.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
                        <div className="flex-1 relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by doctor name..."
                                className="w-full pl-9 pr-4 py-3 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-3 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </section>

            {/* ── Quick Specializations ── */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Browse by Specialization</h2>
                <div className="flex flex-wrap gap-2">
                    {QUICK_SPECIALIZATIONS.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => handleSpecialization(spec)}
                            className="px-4 py-2 bg-white border border-gray-200 text-sm text-gray-700 rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        >
                            {SPECIALIZATION_LABELS[spec]}
                        </button>
                    ))}
                    <button
                        onClick={() => navigate('/search')}
                        className="px-4 py-2 bg-white border border-dashed border-gray-300 text-sm text-gray-500 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                        View all →
                    </button>
                </div>
            </section>

            {/* ── Featured Doctors ── */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-700">Available Doctors</h2>
                    <Link
                        to="/search"
                        className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
                    >
                        View all <ChevronRight size={14}/>
                    </Link>
                </div>

                {featuredLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg"/>
                    </div>
                ) : featured.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No doctors found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featured.map((doctor) => {
                            const clinic = doctor.clinics.find((c) => c.active) ?? doctor.clinics[0];
                            return (
                                <Link
                                    key={doctor.id}
                                    to={`/doctors/${doctor.id}`}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        {doctor.profilePhotoUrl ? (
                                            <img
                                                src={doctor.profilePhotoUrl}
                                                alt="Doctor"
                                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <UserCircle size={28} className="text-blue-300"/>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                Dr. {doctor.firstName} {doctor.lastName}
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium mt-0.5">
                                                {doctor.specialization
                                                    ? SPECIALIZATION_LABELS[doctor.specialization]
                                                    : '—'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {doctor.qualification}
                                                {doctor.yearsOfExperience != null
                                                    ? ` · ${doctor.yearsOfExperience} yrs exp`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {clinic && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin size={11} className="flex-shrink-0"/>
                                                <span className="truncate">{clinic.city}, {clinic.state}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Star size={11} className="flex-shrink-0 text-amber-400"/>
                                                <span>
                                                    {CLINIC_TYPE_LABELS[clinic.type] || clinic.type}
                                                    {' · '}
                                                    <span className="text-teal-600 font-medium">
                                                        ₹{clinic.consultationFees}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;