import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Stethoscope, X } from "lucide-react";
import { useAuth } from "../../../../shared/hooks/useAuth";
import { useAuthStore } from "../../../../store/authStore";
import { authService } from "../../../auth/services/authService";
import { ROUTES } from "../../../../routes/routePaths";

interface HomeNavbarProps {
  onNavigateDashboard?: () => void;
}

const HomeNavbar: React.FC<HomeNavbarProps> = ({ onNavigateDashboard }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isPatient, isDoctor } = useAuth();
  const { clearAuth, refreshToken } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                onClick={() => {
                  navigate(getDashboardRoute());
                  onNavigateDashboard?.();
                }}
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
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Doctors
            </Link>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setMobileMenuOpen(false);
                    onNavigateDashboard?.();
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.register}
                  className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg text-center hover:from-blue-500 hover:to-blue-600 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default HomeNavbar;
