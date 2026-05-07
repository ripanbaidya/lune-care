import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Stethoscope, LayoutDashboard, LogOut} from 'lucide-react';
import {useAuth} from '../../../shared/hooks/useAuth';
import {useAuthStore} from '../../../store/authStore';
import {authService} from '../../auth/authService';
import {ROUTES} from '../../../routes/routePaths';
import {useDoctorSearch} from '../hooks/useDoctorSearch';
import DoctorSearchCard from '../components/DoctorSearchCard';
import {SPECIALIZATION_LABELS, type Specialization} from '../../doctor/types/doctor.types';

const FEATURED_SPECIALIZATIONS: Specialization[] = [
    'CARDIOLOGIST', 'DERMATOLOGIST', 'NEUROLOGIST',
    'PEDIATRICIAN', 'GYNECOLOGIST', 'GENERAL_PHYSICIAN',
];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const {isAuthenticated, isPatient, isDoctor} = useAuth();
    const {clearAuth, refreshToken} = useAuthStore();

    const [searchName, setSearchName] = useState('');
    const [activeSpec, setActiveSpec] = useState<string>('');

    const {data, isLoading} = useDoctorSearch({
        name: searchName || undefined,
        specialization: activeSpec || undefined,
        size: 6,
    });
    const doctors = data?.data?.content ?? [];

    const handleLogout = async () => {
        try {
            if (refreshToken) await authService.logout({refreshToken});
        } catch { /* best-effort */
        } finally {
            clearAuth();
            navigate(ROUTES.login, {replace: true});
        }
    };

    const getDashboardRoute = () => {
        if (isPatient) return ROUTES.patientDashboard;
        if (isDoctor) return ROUTES.doctorDashboard;
        return ROUTES.adminDashboard;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* ── Navbar ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to={ROUTES.home} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope size={16} className="text-white"/>
                        </div>
                        <span className="text-lg font-bold text-gray-900">LuneCare</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/find-doctors"
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium hidden sm:block"
                        >
                            Find Doctors
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(getDashboardRoute())}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <LayoutDashboard size={14}/>
                                    Dashboard
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={16}/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to={ROUTES.login}
                                    className="text-sm text-gray-600 font-medium hover:text-blue-600"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to={ROUTES.register}
                                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="pt-14 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-6xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                        Find the Right Doctor for You
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base mb-8">
                        Search by name, specialization, or city and book an appointment in minutes.
                    </p>
                    <div className="flex max-w-lg mx-auto gap-2">
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Search by doctor name..."
                            className="flex-1 px-4 py-2.5 rounded-lg text-gray-800 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm">
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Specializations ── */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Browse by Specialization</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveSpec('')}
                        className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                            activeSpec === ''
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-600 hover:border-blue-400'
                        }`}
                    >
                        All
                    </button>
                    {FEATURED_SPECIALIZATIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setActiveSpec(activeSpec === s ? '' : s)}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                                activeSpec === s
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 text-gray-600 hover:border-blue-400'
                            }`}
                        >
                            {SPECIALIZATION_LABELS[s]}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Doctor List ── */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-800">Available Doctors</h2>
                    <Link to="/find-doctors" className="text-sm text-blue-600 hover:underline">
                        View all →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="text-sm text-gray-400">Loading doctors...</div>
                ) : doctors.length === 0 ? (
                    <div className="text-sm text-gray-400">No doctors found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {doctors.map((doc) => (
                            <DoctorSearchCard key={doc.id} doctor={doc}/>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;