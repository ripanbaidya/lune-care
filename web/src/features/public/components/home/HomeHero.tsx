import React from "react";
import { Search } from "lucide-react";

interface HomeHeroProps {
  searchName: string;
  onSearchChange: (value: string) => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ searchName, onSearchChange }) => {
  return (
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
                onChange={(e) => onSearchChange(e.target.value)}
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
  );
};

export default HomeHero;
