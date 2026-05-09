import React from "react";
import { type Specialization, SPECIALIZATION_LABELS } from "../../../doctor/types/doctor.types";

interface HomeSpecializationsProps {
  specializations: Specialization[];
  activeSpec: string;
  onSpecSelect: (spec: string) => void;
}

const HomeSpecializations: React.FC<HomeSpecializationsProps> = ({
  specializations,
  activeSpec,
  onSpecSelect,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
          Discover by Specialty
        </h2>
        <p className="text-gray-400 text-base">
          Choose a clinical area to instantly filter top-rated doctors
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <button
          onClick={() => onSpecSelect("")}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            activeSpec === ""
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500 shadow-lg shadow-blue-600/30"
              : "border-gray-700 text-gray-300 hover:border-blue-500/40 hover:bg-blue-500/10"
          }`}
        >
          All Specializations
        </button>
        {specializations.map((s) => (
          <button
            key={s}
            onClick={() => onSpecSelect(activeSpec === s ? "" : s)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              activeSpec === s
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                : "border-gray-700 text-gray-300 hover:border-blue-500/40 hover:bg-blue-500/10"
            }`}
          >
            {SPECIALIZATION_LABELS[s]}
          </button>
        ))}
      </div>
    </section>
  );
};

export default HomeSpecializations;
