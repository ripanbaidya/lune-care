import React from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../routes/routePaths";
import { useAuth } from "../../../../shared/hooks/useAuth";

const HomePremiumCta: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isDoctor, isPatient } = useAuth();

  const dashboardRoute = isPatient
    ? ROUTES.patientDashboard
    : isDoctor
      ? ROUTES.doctorDashboard
      : ROUTES.adminDashboard;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-black p-8 sm:p-12">
        <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-12 h-60 w-60 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200 font-semibold">
              Ready to launch
            </p>
            <h3 className="mt-3 text-3xl sm:text-4xl font-bold text-white leading-tight">
              Build a premium care experience your patients trust instantly.
            </h3>
            <p className="mt-3 text-gray-300">
              Start with LuneCare today and deliver modern, seamless healthcare
              journeys from discovery to follow-up.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(dashboardRoute)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-blue-400 transition-all"
              >
                Open Dashboard
                <ArrowRight size={18} />
              </button>
            ) : (
              <Link
                to={ROUTES.register}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-blue-400 transition-all"
              >
                Start Free
                <ArrowRight size={18} />
              </Link>
            )}

            <Link
              to={ROUTES.findDoctors}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3 text-gray-200 font-medium hover:bg-white/[0.08] transition-all"
            >
              <PlayCircle size={18} />
              Explore Doctors
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePremiumCta;
