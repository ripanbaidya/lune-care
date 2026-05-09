import React from "react";
import { MapPin, Plus } from "lucide-react";

interface AddressEmptyProps {
  onAdd: () => void;
}

export const AddressEmpty: React.FC<AddressEmptyProps> = ({ onAdd }) => {
  return (
    <div className="flex flex-col items-center py-12 gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-800/30 flex items-center justify-center">
        <MapPin size={24} className="text-gray-600" />
      </div>
      <p className="text-sm font-medium text-gray-300">No address saved yet</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all duration-200"
      >
        <Plus size={14} />
        Add Address
      </button>
    </div>
  );
};
