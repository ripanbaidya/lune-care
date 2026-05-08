import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {ArrowRight, LayoutDashboard, LogOut, Menu, Search, Stethoscope, X,} from "lucide-react";
import {useAuth} from "../../../shared/hooks/useAuth";
import {useAuthStore} from "../../../store/authStore";
import {authService} from "../../auth/authService";
import {ROUTES} from "../../../routes/routePaths";
import {useDoctorSearch} from "../hooks/useDoctorSearch";
import DoctorSearchCard from "../components/DoctorSearchCard";
import {type Specialization, SPECIALIZATION_LABELS,} from "../../doctor/types/doctor.types";

const FEATURED_SPECIALIZATIONS: Specialization[] = [
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "PEDIATRICIAN",
  "GYNECOLOGIST",
  "GENERAL_PHYSICIAN",
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isPatient, isDoctor } = useAuth();
  const { clearAuth, refreshToken } = useAuthStore();

  const [searchName, setSearchName] = useState("");
  const [activeSpec, setActiveSpec] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data, isLoading } = useDoctorSearch({
    name: searchName || undefined,
    specialization: activeSpec || undefined,
    size: 6,
  });
  const doctors = data?.data?.content ?? [];

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout({ refreshToken });
    } catch {
      /* best-effort */
    } finally {
      clearAuth();
      navigate(ROUTES.login, { replace: true });
    }
  };

  const getDashboardRoute = () => {
    if (isPatient) return ROUTES.patientDashboard;
    if (isDoctor) return ROUTES.doctorDashboard;
    return ROUTES.adminDashboard;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <Stethoscope size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hidden sm:inline">
              LuneCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/find-doctors"
              className="text-sm text-gray-400 hover:text-blue-400 font-medium transition-colors"
            >
              Find Doctors
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={ROUTES.login}
                  className="px-4 py-2 text-sm text-gray-300 font-medium hover:text-white border border-gray-700 rounded-lg hover:border-blue-500/50 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.register}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/find-doctors"
                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-all"
              >
                Find Doctors
              </Link>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      navigate(getDashboardRoute());
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.login}
                    className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={ROUTES.register}
                    className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg text-center hover:from-blue-500 hover:to-blue-600 transition-all"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full">
                ✨ Find & Book Appointments
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find the Perfect
              <span className="block bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                Doctor for Your Health
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed">
              Search by specialization, location, or availability. Connect with
              verified healthcare professionals and book appointments instantly.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search by doctor name..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-950/50 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-gray-700"
                />
              </div>
              <button className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                <Search size={18} />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                5,000+ Verified Doctors
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                50,000+ Happy Patients
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Available 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specializations ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Browse by Specialization
          </h2>
          <p className="text-gray-400">Find experts in your area of need</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveSpec("")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              activeSpec === ""
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/25"
                : "border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900/50"
            }`}
          >
            All Specializations
          </button>
          {FEATURED_SPECIALIZATIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSpec(activeSpec === s ? "" : s)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                activeSpec === s
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/25"
                  : "border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900/50"
              }`}
            >
              {SPECIALIZATION_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      {/* ── Doctor List ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">
              Available Doctors
            </h2>
            <p className="text-gray-400 text-sm">
              Book your next appointment today
            </p>
          </div>
          {doctors.length > 0 && (
            <Link
              to="/find-doctors"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors group"
            >
              View all
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              </div>
              <p className="text-gray-400">
                Finding the best doctors for you...
              </p>
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-600" size={28} />
            </div>
            <p className="text-gray-400 text-lg font-medium">
              No doctors found
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorSearchCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}

        {doctors.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/find-doctors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25 active:scale-95 sm:hidden"
            >
              View All Doctors
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>

      {/* ── CTA Section ── */}
      <section className="relative py-16 sm:py-20 border-t border-gray-800/50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl -translate-x-1/2"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to take care of your health?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of patients who trust LuneCare for their healthcare
            needs.
          </p>

          {isAuthenticated ? (
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </button>
          ) : (
            <Link
              to={ROUTES.register}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800/50 bg-gray-950/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Stethoscope size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">LuneCare</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting patients with healthcare providers globally.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Find Doctors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    For Doctors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 LuneCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
