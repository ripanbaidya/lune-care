import React from "react";
import { ArrowRight, ShieldCheck, Sparkles, Star, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../../routes/routePaths";

interface HomeHeroProps {
  searchName: string;
  onSearchChange: (value: string) => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ searchName, onSearchChange }) => {
  return (
    <section className="relative pt-24 pb-16 sm:pb-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[34rem] h-[34rem] bg-blue-900/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[34rem] h-[34rem] bg-indigo-900/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.17),transparent_45%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-full inline-flex items-center gap-1.5">
              <Sparkles size={13} />
              Premium Healthcare Platform
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.06] tracking-tight">
            Healthcare Operations
            <span className="block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Reimagined for Speed
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-xl mb-8 leading-relaxed max-w-3xl mx-auto">
            LuneCare unifies discovery, booking, engagement, and insights into
            one world-class care platform for modern clinics and patients.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="text"
                value={searchName}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by doctor name..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-950/70 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all hover:border-gray-600 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            <button className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
              <Search size={18} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.findDoctors}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-gray-200 text-sm hover:bg-white/[0.08] transition-all"
            >
              Explore Marketplace
              <ArrowRight size={15} />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-blue-200 text-sm">
              <ShieldCheck size={15} />
              Verified professionals only
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              5,000+ Verified Doctors
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              50,000+ Happy Patients
            </div>
            <div className="flex items-center gap-2">
              <Star size={13} className="text-blue-300" fill="currentColor" />
              Available 24/7
            </div>
          </div>

          {/* Product strip */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900/70 to-black/70 backdrop-blur-xl p-5 text-left">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Avg Booking Time", value: "< 45 sec" },
                { label: "No-show Reduction", value: "32%" },
                { label: "Care Satisfaction", value: "4.9 / 5" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
