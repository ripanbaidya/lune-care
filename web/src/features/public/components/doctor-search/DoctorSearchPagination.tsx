import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DoctorSearchPaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const DoctorSearchPagination: React.FC<DoctorSearchPaginationProps> = ({
  page,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900/60 border border-gray-700/60 text-sm text-gray-400 rounded-xl hover:border-gray-600 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
      >
        <ChevronLeft size={14} /> Prev
      </button>
      <span className="text-sm text-gray-600 px-2">
        <span className="text-gray-400 font-medium">{page + 1}</span>
        <span className="mx-1">/</span>
        <span className="text-gray-400 font-medium">{totalPages}</span>
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages - 1}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900/60 border border-gray-700/60 text-sm text-gray-400 rounded-xl hover:border-gray-600 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default DoctorSearchPagination;
