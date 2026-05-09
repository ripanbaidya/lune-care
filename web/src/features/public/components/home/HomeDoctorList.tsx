import { ArrowRight, Search } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import type { DoctorSearchResult } from "../../hooks/useDoctorSearch";
import DoctorSearchCard from "../DoctorSearchCard";

interface HomeDoctorListProps {
  doctors: DoctorSearchResult[];
  isLoading: boolean;
}

const HomeDoctorList: React.FC<HomeDoctorListProps> = ({ doctors, isLoading }) => {

  return (
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
  );
};

export default HomeDoctorList;
