import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../../../shared/hooks/useAuth";
import { ROUTES } from "../../../../routes/routePaths";

interface HomeCtaProps {
  isAuthenticated: boolean;
}

const HomeCta: React.FC<HomeCtaProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const { isPatient, isDoctor } = useAuth();

  const getDashboardRoute = () => {
    if (isPatient) return ROUTES.patientDashboard;
    if (isDoctor) return ROUTES.doctorDashboard;
    return ROUTES.adminDashboard;
  };

  return (
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
  );
};

export default HomeCta;
