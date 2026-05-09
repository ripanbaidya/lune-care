import React from "react";
import { ArrowLeft, Stethoscope, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../routes/routePaths";
import { useAuthStore } from "../../../../store/authStore";
import { useAuth } from "../../../../shared/hooks/useAuth";
import { useLogout } from "../../../../shared/hooks/useLogout";

const PublicProfileNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();
  const { user } = useAuthStore();
  const logout = useLogout();

  const getDashboardRoute = () => {
    if (isPatient) return ROUTES.patientDashboard;
    const { user } = useAuthStore.getState();
    if (user?.role === "ROLE_DOCTOR") return ROUTES.doctorDashboard;
    return ROUTES.home;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <Link to={ROUTES.home} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
              <Stethoscope size={14} className="text-white" />
            </div>
            <span className="text-base font-bold text-white">LuneCare</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardRoute()}
                className="hidden sm:block p-1 rounded-full ring-2 ring-gray-700 hover:ring-blue-500/60 transition-all"
                title="Open account"
              >
                {user?.profilePhotoUrl ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle size={32} className="text-gray-300" />
                )}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.login}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.register}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicProfileNavbar;
