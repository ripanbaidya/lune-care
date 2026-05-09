import React from "react";
import { MapPin, Trash2 } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import type { AddressResponse } from "../../types/patient-address.types";

interface AddressDisplayProps {
  address: AddressResponse;
  isDeleting: boolean;
  onDelete: () => void;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  isDeleting,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      {/* Address display */}
      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border border-blue-800/30 rounded-xl">
        <MapPin size={20} className="text-blue-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {address.addressLine}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {address.city}, {address.state} — {address.pinCode}
          </p>
          <p className="text-sm text-gray-400">{address.country}</p>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-4 py-2.5 border border-red-800/40 text-red-400 hover:text-red-300 hover:bg-red-950/20 hover:border-red-700/40 text-sm font-medium rounded-lg disabled:opacity-50 transition-all duration-200"
      >
        {isDeleting ? <Spinner size="sm" /> : <Trash2 size={14} />}
        Remove Address
      </button>
    </div>
  );
};
