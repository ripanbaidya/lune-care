import { Search, SlidersHorizontal } from "lucide-react";
import React from "react";

interface SearchBarProps {
  name: string;
  onNameChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  name,
  onNameChange,
  onKeyDown,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  activeFilterCount,
  onClear,
}) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search by doctor name..."
          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={onToggleFilters}
        className={[
          "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-colors",
          showFilters || hasActiveFilters
            ? "bg-blue-600 text-white border-blue-600"
            : "border-gray-300 text-gray-600 hover:bg-gray-50",
        ].join(" ")}
      >
        <SlidersHorizontal size={14} />
        <span className="hidden sm:inline">Filters</span>
        {hasActiveFilters && (
          <span className="w-4 h-4 bg-white/30 text-white text-xs rounded-full flex items-center justify-center leading-none font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
