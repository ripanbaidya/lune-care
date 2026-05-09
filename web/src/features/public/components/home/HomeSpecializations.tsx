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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Browse by Specialization
        </h2>
        <p className="text-gray-400">Find experts in your area of need</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onSpecSelect("")}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            activeSpec === ""
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/25"
              : "border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900/50"
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
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/25"
                : "border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-900/50"
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
